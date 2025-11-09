import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/database";
import { topologicalSort } from "./utils";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { discordChannel } from "./channels/discord";
import { slackChannel } from "./channels/slack";
import { ExecutionStatus } from "@/generated/prisma/client";

export const executeWorkflow = inngest.createFunction(
  //change for production
  {
    id: "execute-workflow",
    retries: 0,
    onFailure: async ({ event }) => {
      const execution = await prisma.execution.findFirst({
        where: { inngestEventId: event.data.event.id },
      });

      if (!execution) {
        console.error(
          "Execution not found for inngest event:",
          event.data.event.id
        );
        return;
      }

      return prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.FAILED,
          completedAt: new Date(),
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        },
      });
    },
  },
  {
    event: "workflow/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      discordChannel(),
      slackChannel(),
    ],
  },

  async ({ event, step, publish }) => {
    const { workflowId } = event.data;
    const inngestEventId = event.id;

    if (!workflowId || !inngestEventId) {
      throw new NonRetriableError(
        "Workflow ID or inngest event ID is required"
      );
    }

    await step.run("create-execution", async () => {
      return await prisma.execution.create({
        data: {
          inngestEventId,
          workflowId,
        },
      });
    });

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        },
      });

      return topologicalSort(workflow.nodes, workflow.connections);
    });

    const userId = await step.run("get-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: {
          userId: true,
        },
      });
      return workflow.userId;
    });

    //initialize context with any initial data from the trigger
    let context = event.data.initialData || {};

    //execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type);

      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        publish,
        userId,
      });
    }

    await step.run("update-execution", async () => {
      const execution = await prisma.execution.findFirst({
        where: { inngestEventId, workflowId },
      });

      if (!execution) {
        throw new NonRetriableError("Execution not found");
      }

      return await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context,
        },
      });
    });

    return { workflowId, result: context };
  }
);

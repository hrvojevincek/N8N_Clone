import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { db } from "@/db/client";
import { executions, workflows, nodes, connections } from "@/db/schema";
import { ExecutionStatus, NodeType } from "@/db/enums";
import { topologicalSort } from "./utils";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { discordChannel } from "./channels/discord";
import { slackChannel } from "./channels/slack";
import { and, eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: process.env.NODE_ENV === "production" ? 2 : 0,
    onFailure: async ({ event }) => {
      const eventId = event.data.event.id;
      if (!eventId) {
        return;
      }

      const [execution] = await db
        .select()
        .from(executions)
        .where(eq(executions.inngestEventId, eventId))
        .limit(1);

      if (!execution) {
        console.error(
          "Execution not found for inngest event:",
          event.data.event.id
        );
        return;
      }

      await db
        .update(executions)
        .set({
          status: ExecutionStatus.FAILED,
          completedAt: new Date(),
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        })
        .where(eq(executions.id, execution.id));
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
      await db.insert(executions).values({
        id: createId(),
        workflowId,
        inngestEventId,
        status: ExecutionStatus.RUNNING,
        startedAt: new Date(),
      });
    });

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const [workflow] = await db
        .select()
        .from(workflows)
        .where(eq(workflows.id, workflowId))
        .limit(1);

      if (!workflow) {
        throw new NonRetriableError("Workflow not found");
      }

      const wfNodes = await db
        .select()
        .from(nodes)
        .where(eq(nodes.workflowId, workflowId));

      const wfConnections = await db
        .select()
        .from(connections)
        .where(eq(connections.workflowId, workflowId));

      return topologicalSort(wfNodes, wfConnections);
    });

    const userId = await step.run("get-user-id", async () => {
      const [workflow] = await db
        .select({ userId: workflows.userId })
        .from(workflows)
        .where(eq(workflows.id, workflowId))
        .limit(1);

      if (!workflow) {
        throw new NonRetriableError("Workflow not found");
      }

      return workflow.userId;
    });

    let context = event.data.initialData || {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
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
      const [execution] = await db
        .select()
        .from(executions)
        .where(
          and(
            eq(executions.inngestEventId, inngestEventId),
            eq(executions.workflowId, workflowId)
          )
        )
        .limit(1);

      if (!execution) {
        throw new NonRetriableError("Execution not found");
      }

      await db
        .update(executions)
        .set({
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context,
        })
        .where(eq(executions.id, execution.id));
    });

    return { workflowId, result: context };
  }
);

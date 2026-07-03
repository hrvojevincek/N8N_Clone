import "server-only";

import { createId } from "@paralleldrive/cuid2";
import { db } from "@/db/client";
import {
  workflows,
  nodes as workflowNodes,
  connections as workflowConnections,
} from "@/db/schema";
import type { WorkflowTemplate } from "../templates";

export const createWorkflowFromTemplate = async (
  userId: string,
  template: WorkflowTemplate
) => {
  return await db.transaction(async (tx) => {
    const [workflow] = await tx
      .insert(workflows)
      .values({
        id: createId(),
        name: template.name,
        userId,
        isDemo: template.isDemo ?? false,
      })
      .returning();

    if (!workflow) {
      throw new Error("Failed to create workflow from template");
    }

    const nodeIdByKey = new Map<string, string>();
    for (const node of template.nodes) {
      nodeIdByKey.set(node.key, createId());
    }

    await tx.insert(workflowNodes).values(
      template.nodes.map((node) => ({
        id: nodeIdByKey.get(node.key)!,
        workflowId: workflow.id,
        name: node.name,
        type: node.type,
        position: node.position,
        data: node.data,
      }))
    );

    if (template.connections.length > 0) {
      await tx.insert(workflowConnections).values(
        template.connections.map((connection) => ({
          id: createId(),
          workflowId: workflow.id,
          fromNodeId: nodeIdByKey.get(connection.from)!,
          toNodeId: nodeIdByKey.get(connection.to)!,
          // Must match the Handle ids in base-trigger-node / base-execution-node
          fromOutput: "source-1",
          toInput: "target-1",
        }))
      );
    }

    return workflow;
  });
};

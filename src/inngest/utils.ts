import toposort from "toposort";
import { nodes, connections } from "@/db/schema";
import { inngest } from "./client";
import { createId } from "@paralleldrive/cuid2";

type Node = typeof nodes.$inferSelect;
type Connection = typeof connections.$inferSelect;

export const topologicalSort = (
  nodes: Node[],
  connections: Connection[]
): Node[] => {
  //if no connections, return node as-is (they are all independent)

  if (connections.length === 0) {
    return nodes;
  }

  //create edged array for toposort
  const edges: [string, string][] = connections.map((connection) => [
    connection.fromNodeId,
    connection.toNodeId,
  ]);

  //add nodes with no connections as self-edges to ensure theyre included
  const connectedNodeIds = new Set<string>();
  for (const connection of connections) {
    connectedNodeIds.add(connection.fromNodeId);
    connectedNodeIds.add(connection.toNodeId);
  }

  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  //perform toposort

  let sortedNodesIds: string[];
  try {
    sortedNodesIds = toposort(edges);
    //remove duplicates from self edges
    sortedNodesIds = [...new Set(sortedNodesIds)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Workflow contains a cycle");
    }
    throw error;
  }

  //Map sorted node ids back to original nodes
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  return sortedNodesIds.map((nodeId) => nodeMap.get(nodeId)!);
};

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: unknown;
}) => {
  return inngest.send({
    name: "workflow/execute.workflow",
    data,
    id: createId(),
  });
};

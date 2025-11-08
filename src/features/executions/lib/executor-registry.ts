import { NodeType } from "@/generated/prisma/client";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
};

export const getExecutor = (nodeType: NodeType): NodeExecutor => {
  const executor = executorRegistry[nodeType];
  if (!executor) {
    throw new Error(`No executor found for node type: ${nodeType}`);
  }
  return executor;
};

import { NodeType } from "@/generated/prisma/client";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "@/features/nodes/trigger-nodes/manual-trigger/executor";
import { httpRequestExecutor } from "../../nodes/execution-nodes/http-request/executor";
import { googleFormTriggerExecutor } from "@/features/nodes/trigger-nodes/google-form-trigger/executor";
import { stripeTriggerExecutor } from "@/features/nodes/trigger-nodes/stripe-trigger/executor";
import { geminiExecutor } from "../../nodes/execution-nodes/gemini/executor";
import { discordExecutor } from "../../nodes/execution-nodes/discord/executor";
import { slackExecutor } from "../../nodes/execution-nodes/slack/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.DISCORD]: discordExecutor,
  [NodeType.SLACK]: slackExecutor,
};

export const getExecutor = (nodeType: NodeType): NodeExecutor => {
  const executor = executorRegistry[nodeType];
  if (!executor) {
    throw new Error(`No executor found for node type: ${nodeType}`);
  }
  return executor;
};

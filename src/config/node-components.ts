import { InitialNode } from "@/components/initial-node";
import { DiscordNode } from "@/features/nodes/execution-nodes/discord/node";
import { GeminiNode } from "@/features/nodes/execution-nodes/gemini/node";
import { HttpRequestNode } from "@/features/nodes/execution-nodes/http-request/node";
import { SlackNode } from "@/features/nodes/execution-nodes/slack/node";
import { GoogleFormTrigger } from "@/features/nodes/trigger-nodes/google-form-trigger/node";
import { ManualTriggerNode } from "@/features/nodes/trigger-nodes/manual-trigger/node";
import { StripeTriggerNode } from "@/features/nodes/trigger-nodes/stripe-trigger/node";
import { NodeType } from "@/db/enums";
import type { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTrigger,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.DISCORD]: DiscordNode,
  [NodeType.SLACK]: SlackNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;

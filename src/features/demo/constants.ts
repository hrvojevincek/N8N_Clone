import type { Edge, Node } from "@xyflow/react";
import type { DemoNodeData } from "./components/demo-nodes";

export const DEMO_WORKFLOW_NAME = "Marketing Automation";

export const DEMO_NODES: Node<DemoNodeData>[] = [
  {
    id: "demo-google-form",
    type: "demo-trigger",
    position: { x: 0, y: 0 },
    data: {
      icon: "/logos/googleform.svg",
      name: "Google Form",
      description: "Runs when a form is submitted",
    },
  },
  {
    id: "demo-http-request",
    type: "demo-execution",
    position: { x: 200, y: 0 },
    data: {
      icon: "globe",
      name: "HTTP Request",
      description: "POST: /api/enrich-lead",
    },
  },
  {
    id: "demo-gemini",
    type: "demo-execution",
    position: { x: 400, y: 0 },
    data: {
      icon: "/logos/gemini.svg",
      name: "Gemini",
      description: "Summarize the new lead",
    },
  },
  {
    id: "demo-slack",
    type: "demo-execution",
    position: { x: 600, y: -80 },
    data: {
      icon: "/logos/slack.svg",
      name: "Slack",
      description: "Notify #new-leads",
    },
  },
  {
    id: "demo-discord",
    type: "demo-execution",
    position: { x: 600, y: 80 },
    data: {
      icon: "/logos/discord.svg",
      name: "Discord",
      description: "Notify #alerts",
    },
  },
];

export const DEMO_EDGES: Edge[] = [
  {
    id: "demo-e1",
    source: "demo-google-form",
    target: "demo-http-request",
    sourceHandle: "source-1",
    targetHandle: "target-1",
  },
  {
    id: "demo-e2",
    source: "demo-http-request",
    target: "demo-gemini",
    sourceHandle: "source-1",
    targetHandle: "target-1",
  },
  {
    id: "demo-e3",
    source: "demo-gemini",
    target: "demo-slack",
    sourceHandle: "source-1",
    targetHandle: "target-1",
  },
  {
    id: "demo-e4",
    source: "demo-gemini",
    target: "demo-discord",
    sourceHandle: "source-1",
    targetHandle: "target-1",
  },
];

/**
 * Node ids grouped by execution step. Nodes within a group light up
 * together (e.g. Slack and Discord fire in parallel at the end).
 */
export const DEMO_EXECUTION_SEQUENCE: string[][] = [
  ["demo-google-form"],
  ["demo-http-request"],
  ["demo-gemini"],
  ["demo-slack", "demo-discord"],
];

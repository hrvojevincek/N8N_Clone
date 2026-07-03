import { NodeType } from "@/db/enums";

export type TemplateNode = {
  /** Local key used to wire connections inside the template */
  key: string;
  type: NodeType;
  name: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
};

export type WorkflowTemplate = {
  id: string;
  name: string;
  description: string;
  /** Paths to logos shown on the gallery card */
  logos: string[];
  /** Human-readable list of things the user must configure */
  requires: string[];
  premium?: boolean;
  isDemo?: boolean;
  nodes: TemplateNode[];
  connections: Array<{ from: string; to: string }>;
};

const OPEN_METEO_BARCELONA =
  "https://api.open-meteo.com/v1/forecast?latitude=41.39&longitude=2.16&current=temperature_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1";

export const DEMO_TEMPLATE_ID = "daily-weather-briefing";

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: DEMO_TEMPLATE_ID,
    name: "Quick Start: Daily Weather Briefing",
    description:
      "Fetches today's weather for Barcelona and asks Gemini what to do with your day. Runs out of the box.",
    logos: ["/logos/gemini.svg"],
    requires: [],
    isDemo: true,
    nodes: [
      {
        key: "trigger",
        type: NodeType.MANUAL_TRIGGER,
        name: "Manual Trigger",
        position: { x: 0, y: 0 },
        data: {},
      },
      {
        key: "weather",
        type: NodeType.HTTP_REQUEST,
        name: "Fetch weather",
        position: { x: 320, y: 0 },
        data: {
          variableName: "weather",
          method: "GET",
          endpoint: OPEN_METEO_BARCELONA,
        },
      },
      {
        key: "gemini",
        type: NodeType.GEMINI,
        name: "Gemini",
        position: { x: 640, y: 0 },
        data: {
          variableName: "suggestion",
          model: "gemini-2.5-flash-lite",
          systemPrompt:
            "You are a friendly local guide for Barcelona. Keep answers short, upbeat, and practical.",
          userPrompt:
            "Based on this current weather data for Barcelona, suggest what to do today in 3 short bullet points:\n\n{{json weather.httpResponse.data}}",
        },
      },
    ],
    connections: [
      { from: "trigger", to: "weather" },
      { from: "weather", to: "gemini" },
    ],
  },
  {
    id: "ai-joke-critic",
    name: "AI Joke Critic",
    description:
      "Fetches a random joke, has Gemini rate it like a tough comedy critic, and posts the verdict to Discord.",
    logos: ["/logos/gemini.svg", "/logos/discord.svg"],
    requires: ["Gemini API key", "Discord webhook URL"],
    nodes: [
      {
        key: "trigger",
        type: NodeType.MANUAL_TRIGGER,
        name: "Manual Trigger",
        position: { x: 0, y: 0 },
        data: {},
      },
      {
        key: "joke",
        type: NodeType.HTTP_REQUEST,
        name: "Fetch joke",
        position: { x: 320, y: 0 },
        data: {
          variableName: "joke",
          method: "GET",
          endpoint: "https://official-joke-api.appspot.com/random_joke",
        },
      },
      {
        key: "critic",
        type: NodeType.GEMINI,
        name: "Gemini",
        position: { x: 640, y: 0 },
        data: {
          variableName: "critique",
          model: "gemini-2.5-flash-lite",
          systemPrompt:
            "You are a tough but fair comedy critic. Be brief and funny.",
          userPrompt:
            "Rate this joke out of 10 and explain your rating in 2 sentences:\n\n{{json joke.httpResponse.data}}",
        },
      },
      {
        key: "discord",
        type: NodeType.DISCORD,
        name: "Discord",
        position: { x: 960, y: 0 },
        data: {
          variableName: "discordMessage",
          content: "{{critique.aiResponse.text}}",
          username: "Joke Critic",
        },
      },
    ],
    connections: [
      { from: "trigger", to: "joke" },
      { from: "joke", to: "critic" },
      { from: "critic", to: "discord" },
    ],
  },
  {
    id: "api-health-check",
    name: "API Health Check",
    description:
      "Pings an API endpoint and posts the response status to Slack. No AI key needed.",
    logos: ["/logos/slack.svg"],
    requires: ["Slack webhook URL"],
    nodes: [
      {
        key: "trigger",
        type: NodeType.MANUAL_TRIGGER,
        name: "Manual Trigger",
        position: { x: 0, y: 0 },
        data: {},
      },
      {
        key: "check",
        type: NodeType.HTTP_REQUEST,
        name: "Ping API",
        position: { x: 320, y: 0 },
        data: {
          variableName: "healthCheck",
          method: "GET",
          endpoint: "https://api.github.com",
        },
      },
      {
        key: "slack",
        type: NodeType.SLACK,
        name: "Slack",
        position: { x: 640, y: 0 },
        data: {
          variableName: "slackMessage",
          content:
            "API health check: {{healthCheck.httpResponse.status}} {{healthCheck.httpResponse.statusText}}",
        },
      },
    ],
    connections: [
      { from: "trigger", to: "check" },
      { from: "check", to: "slack" },
    ],
  },
  {
    id: "prompt-playground",
    name: "Prompt Playground",
    description:
      "The simplest possible AI workflow: a trigger and a Gemini prompt. Tinker away.",
    logos: ["/logos/gemini.svg"],
    requires: ["Gemini API key"],
    nodes: [
      {
        key: "trigger",
        type: NodeType.MANUAL_TRIGGER,
        name: "Manual Trigger",
        position: { x: 0, y: 0 },
        data: {},
      },
      {
        key: "gemini",
        type: NodeType.GEMINI,
        name: "Gemini",
        position: { x: 320, y: 0 },
        data: {
          variableName: "answer",
          model: "gemini-2.5-flash-lite",
          userPrompt: "Write a haiku about workflow automation.",
        },
      },
    ],
    connections: [{ from: "trigger", to: "gemini" }],
  },
  {
    id: "stripe-alerts",
    name: "Stripe Event Alerts",
    description:
      "Posts a Slack message whenever a Stripe event hits your webhook. Great for payment monitoring.",
    logos: ["/logos/stripe.svg", "/logos/slack.svg"],
    requires: ["Stripe webhook", "Slack webhook URL"],
    premium: true,
    nodes: [
      {
        key: "trigger",
        type: NodeType.STRIPE_TRIGGER,
        name: "Stripe Trigger",
        position: { x: 0, y: 0 },
        data: {},
      },
      {
        key: "slack",
        type: NodeType.SLACK,
        name: "Slack",
        position: { x: 320, y: 0 },
        data: {
          variableName: "slackMessage",
          content: "New Stripe event: {{stripe.eventType}}",
        },
      },
    ],
    connections: [{ from: "trigger", to: "slack" }],
  },
  {
    id: "form-to-ai",
    name: "Form Response Summarizer",
    description:
      "Summarizes every Google Form submission with Gemini and posts it to Discord.",
    logos: ["/logos/googleform.svg", "/logos/gemini.svg", "/logos/discord.svg"],
    requires: ["Google Form webhook", "Gemini API key", "Discord webhook URL"],
    premium: true,
    nodes: [
      {
        key: "trigger",
        type: NodeType.GOOGLE_FORM_TRIGGER,
        name: "Google Form Trigger",
        position: { x: 0, y: 0 },
        data: {},
      },
      {
        key: "gemini",
        type: NodeType.GEMINI,
        name: "Gemini",
        position: { x: 320, y: 0 },
        data: {
          variableName: "summary",
          model: "gemini-2.5-flash-lite",
          userPrompt:
            "Summarize this form submission in 2 sentences:\n\n{{json googleForm}}",
        },
      },
      {
        key: "discord",
        type: NodeType.DISCORD,
        name: "Discord",
        position: { x: 640, y: 0 },
        data: {
          variableName: "discordMessage",
          content: "{{summary.aiResponse.text}}",
          username: "Form Bot",
        },
      },
    ],
    connections: [
      { from: "trigger", to: "gemini" },
      { from: "gemini", to: "discord" },
    ],
  },
];

export const getTemplate = (id: string): WorkflowTemplate | undefined =>
  workflowTemplates.find((template) => template.id === id);

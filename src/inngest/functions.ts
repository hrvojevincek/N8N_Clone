import { inngest } from "./client";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { generateText } from "ai";

const googleAI = createGoogleGenerativeAI();

export const execute = inngest.createFunction(
  { id: "execute" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: googleAI("gemini-2.5-flash"),
      system:
        "You are a helpful assistant that can answer questions and help with tasks.",
      prompt: "What is the capital of France?",
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    return steps;
  }
);

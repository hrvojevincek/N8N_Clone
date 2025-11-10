import { geminiChannel } from "@/inngest/channels/gemini";
import Handlebars from "handlebars";
import { NodeExecutor } from "../../../executions/types";
import { NonRetriableError } from "inngest";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import prisma from "@/lib/database";
import { decrypt } from "@/lib/encrypt";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type GeminiData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  credentialId?: string;
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  nodeId,
  data,
  context,
  step,
  publish,
  userId,
}) => {
  await publish(
    geminiChannel().status({
      nodeId,
      status: "loading",
    })
  );

  console.log("data", data);

  if (!data.variableName) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Variable name is required");
  }

  if (!data.userPrompt) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("User prompt is required");
  }

  if (!data.credentialId) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Credential is required");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credential = await step.run("get-credential", async () => {
    return await prisma.credential.findUniqueOrThrow({
      where: {
        id: data.credentialId,
        userId,
      },
    });
  });

  if (!credential) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Credential not found");
  }

  const credentialValue = credential.value;

  if (!credentialValue) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Gemini API key is not set");
  }

  const google = createGoogleGenerativeAI({
    apiKey: decrypt(credentialValue),
  });

  try {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google(data.model || "gemini-2.5-flash-lite"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      geminiChannel().status({
        nodeId,
        status: "success",
      })
    );

    return {
      ...context,
      [data.variableName]: {
        aiResponse: {
          text,
        },
      },
    };
  } catch (error) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};

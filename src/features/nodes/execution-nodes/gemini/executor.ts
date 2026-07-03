import { geminiChannel } from "@/inngest/channels/gemini";
import Handlebars from "handlebars";
import { NodeExecutor } from "../../../executions/types";
import { NonRetriableError } from "inngest";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/db/client";
import { credentials, users, workflows } from "@/db/schema";
import { decrypt } from "@/lib/encrypt";
import { and, eq } from "drizzle-orm";

const SANDBOX_MODEL = "gemini-2.5-flash-lite";

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
  workflowId,
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

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  let apiKey: string;
  let model: string;

  if (data.credentialId) {
    const credential = await step.run("get-credential", async () => {
      const [row] = await db
        .select()
        .from(credentials)
        .where(
          and(
            eq(credentials.id, data.credentialId!),
            eq(credentials.userId, userId)
          )
        )
        .limit(1);

      return row;
    });

    if (!credential?.value) {
      await publish(
        geminiChannel().status({
          nodeId,
          status: "error",
        })
      );
      throw new NonRetriableError("Credential not found");
    }

    apiKey = decrypt(credential.value);
    model = data.model || SANDBOX_MODEL;
  } else {
    // No credential configured: only the seeded demo workflow may fall back
    // to the server-side sandbox key, and only for the user's one demo run.
    const sandboxAllowed = await step.run("check-sandbox-eligibility", async () => {
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return false;

      const [workflow] = await db
        .select({ isDemo: workflows.isDemo })
        .from(workflows)
        .where(eq(workflows.id, workflowId))
        .limit(1);

      if (!workflow?.isDemo) return false;

      const [user] = await db
        .select({ ranDemo: users.ranDemo })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return !user?.ranDemo;
    });

    if (!sandboxAllowed) {
      await publish(
        geminiChannel().status({
          nodeId,
          status: "error",
        })
      );
      throw new NonRetriableError(
        "Credential is required. Add your Gemini API key in Credentials."
      );
    }

    apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
    model = SANDBOX_MODEL;
  }

  const google = createGoogleGenerativeAI({
    apiKey,
  });

  try {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google(model),
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

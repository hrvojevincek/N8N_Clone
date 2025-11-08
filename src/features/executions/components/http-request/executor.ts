import { NodeExecutor } from "../../types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type HttpRequestData = {
  variableName: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  nodeId,
  data,
  context,
  step,
}) => {
  //TODO: publish "loading" state  for manula trigger
  if (!data.endpoint) {
    throw new NonRetriableError("HTTP Request node: No endpoint configured");
  }
  if (!data.variableName) {
    throw new NonRetriableError(
      "HTTP Request node: No variable name configured"
    );
  }
  if (!data.method) {
    throw new NonRetriableError("HTTP Request node: No method configured");
  }

  const result = await step.run("http-request", async () => {
    let endpoint: string;
    try {
      endpoint = Handlebars.compile(data.endpoint)(context);
    } catch (error) {
      throw new NonRetriableError(
        `Failed to render endpoint template: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // Validate rendered endpoint is a valid URL
    try {
      new URL(endpoint);
    } catch (error) {
      throw new NonRetriableError(
        `Rendered endpoint is not a valid URL: ${endpoint}`
      );
    }

    const method = data.method;

    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      const resolved = Handlebars.compile(data.body || {})(context);
      JSON.parse(resolved);

      options.body = resolved;
      options.headers = {
        "Content-Type": "application/json",
      };
    }

    const response = await ky(endpoint, options);
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    const responsePayload = {
      httpResponse: {
        statusText: response.statusText,
        status: response.status,
        data: responseData,
      },
    };

    return {
      ...context,
      [data.variableName]: responsePayload,
    };
  });

  //TODO: publish "succes" state for manual trigger

  return result;
};

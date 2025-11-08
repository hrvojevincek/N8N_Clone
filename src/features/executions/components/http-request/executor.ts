import { NodeExecutor } from "../../types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestData = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint?: string;
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

  const result = await step.run("http-request", async () => {
    const endpoint = data.endpoint!;
    const method = data.method || "GET";

    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      options.body = data.body;
      options.headers = {
        "Content-Type": "application/json",
      };
    }

    const response = await ky(endpoint, options);
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    return {
      ...context,
      httpResponse: {
        statusText: response.statusText,
        status: response.status,
        data: responseData,
      },
    };
  });

  //TODO: publish "succes" state for manual trigger

  return result;
};

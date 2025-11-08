import { NodeExecutor } from "@/features/executions/types";

export type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  //TODO: publish "loading" state  for manula trigger

  const result = await step.run("manual-trigger", async () => context);

  //TODO: publish "succes" state for manual trigger

  return result;
};

import type { Realtime } from "@inngest/realtime";
import { useMemo } from "react";
import type { NodeStatus } from "@/components/react-flow/node-status-indicator";
import { useInngestSubscription } from "@inngest/realtime/hooks";

interface UseNodeStatusOptions {
  nodeId: string;
  channel: string;
  topic: string;
  refreshToken: () => Promise<Realtime.Subscribe.Token>;
}

export function useNodeStatus({
  nodeId,
  channel,
  topic,
  refreshToken,
}: UseNodeStatusOptions) {
  const { data } = useInngestSubscription({
    refreshToken,
    enabled: true,
  });
  const status = useMemo<NodeStatus>(() => {
    if (!data?.length) {
      return "initial";
    }

    const latestMessage = data
      .filter(
        (msg) =>
          msg.kind === "data" &&
          msg.channel === channel &&
          msg.topic === topic &&
          msg.data.nodeId === nodeId
      )
      .sort((a, b) => {
        if (a.kind === "data" && b.kind === "data") {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return 0;
      })[0];

    if (latestMessage?.kind === "data") {
      return latestMessage.data.status as NodeStatus;
    }

    return "initial";
  }, [data, nodeId, channel, topic]);

  return status;
}

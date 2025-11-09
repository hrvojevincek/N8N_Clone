"use client";

import { DISCORD_CHANNEL_NAME } from "@/inngest/channels/discord";
import { NodeProps, useReactFlow, type Node } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchDiscordRealtimeToken } from "./action";
import { DiscordDialog, DiscordFormValues } from "./dialog";

type DiscordNodeData = {
  webhookUrl?: string;
  content?: string;
  username?: string;
};

type DiscordNodeType = Node<DiscordNodeData>;

export const DiscordNode = memo((props: NodeProps<DiscordNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const nodeData = props.data;
  const description = nodeData.content
    ? `${nodeData.content.slice(0, 50)}...`
    : "Not configured";

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: DISCORD_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchDiscordRealtimeToken,
  });

  const handleSubmit = (values: DiscordFormValues) => {
    setNodes((nodes) => {
      return nodes.map((node) => {
        if (node.id === props.id) {
          return { ...node, data: { ...node.data, ...values } };
        }
        return node;
      });
    });
    setDialogOpen(false);
  };

  return (
    <>
      <DiscordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        icon="/logos/discord.svg"
        id={props.id}
        name="Discord"
        description={description}
        onDoubleClick={handleOpenSettings}
        onSettings={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  );
});

DiscordNode.displayName = "DiscordNode";

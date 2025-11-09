"use client";

import { SLACK_CHANNEL_NAME } from "@/inngest/channels/slack";
import { NodeProps, useReactFlow, type Node } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchSlackRealtimeToken } from "./action";
import { SlackDialog, SlackFormValues } from "./dialog";

type SlackNodeData = {
  webhookUrl?: string;
  content?: string;
  variableName?: string;
};

type SlackNodeType = Node<SlackNodeData>;

export const SlackNode = memo((props: NodeProps<SlackNodeType>) => {
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
    channel: SLACK_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchSlackRealtimeToken,
  });

  const handleSubmit = (values: SlackFormValues) => {
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
      <SlackDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        icon="/logos/slack.svg"
        id={props.id}
        name="Slack"
        description={description}
        onDoubleClick={handleOpenSettings}
        onSettings={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  );
});

SlackNode.displayName = "SlackNode";

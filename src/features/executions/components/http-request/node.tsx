"use client";

import { GlobeIcon } from "lucide-react";
import { BaseExecutionNode } from "../base-execution-node";
import { NodeProps, useReactFlow, type Node } from "@xyflow/react";
import { memo, useState } from "react";
import { FormType, HttpRequestDialog } from "./dialog";

type HttpRequestNodeData = {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body: string;
  [key: string]: unknown;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const nodeData = props.data;

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };
  const description = nodeData.endpoint
    ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
    : "Not configured";

  const nodeStatus = "initial";

  const handleSubmit = (values: FormType) => {
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
      <HttpRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData.endpoint}
        defaultMethod={nodeData.method}
        defaultBody={nodeData.body}
      />
      <BaseExecutionNode
        {...props}
        icon={GlobeIcon}
        id={props.id}
        name="HTTP Request"
        description={description}
        onDoubleClick={handleOpenSettings}
        onSettings={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  );
});

HttpRequestNode.displayName = "HttpRequestNode";

"use client";

import { GlobeIcon } from "lucide-react";
import { BaseExecutionNode } from "../base-execution-node";
import { NodeProps, type Node } from "@xyflow/react";
import { memo } from "react";

type HttpRequestNodeData = {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body: string;
  [key: string]: unknown;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const nodeData = props.data as HttpRequestNodeData;
  const description = nodeData.endpoint
    ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
    : "Not configured";

  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={GlobeIcon}
        id={props.id}
        name="HTTP Request"
        description={description}
        onDoubleClick={() => {}}
        onSettings={() => {}}
      />
    </>
  );
});

HttpRequestNode.displayName = "HttpRequestNode";

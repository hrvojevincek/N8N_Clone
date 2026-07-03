"use client";

import { BaseHandle } from "@/components/react-flow/base-handle";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import {
  NodeStatus,
  NodeStatusIndicator,
} from "@/components/react-flow/node-status-indicator";
import { WorkflowNode } from "@/components/workflow-node";
import { NodeProps, Position, type Node, type NodeTypes } from "@xyflow/react";
import { GlobeIcon, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo } from "react";

export type DemoNodeData = {
  /** Either a key into the lucide icon registry or a /logos/*.svg path */
  icon: string;
  name: string;
  description?: string;
  status?: NodeStatus;
};

type DemoNodeType = Node<DemoNodeData>;

const lucideIcons: Record<string, LucideIcon> = {
  globe: GlobeIcon,
};

const DemoNodeIcon = ({ icon, name }: { icon: string; name: string }) => {
  const LucideIconComponent = lucideIcons[icon];

  if (LucideIconComponent) {
    return <LucideIconComponent className="size-4 text-muted-foreground" />;
  }

  return (
    <Image src={icon} alt={name} width={16} height={16} className="size-5" />
  );
};

export const DemoTriggerNode = memo(
  ({ data }: NodeProps<DemoNodeType>) => {
    const status = data.status ?? "initial";

    return (
      <WorkflowNode
        showToolbar={false}
        name={data.name}
        description={data.description}
      >
        <NodeStatusIndicator
          status={status}
          variant="border"
          className="rounded-l-2xl"
        >
          <BaseNode className="rounded-l-2xl relative group" status={status}>
            <BaseNodeContent>
              <DemoNodeIcon icon={data.icon} name={data.name} />
              <BaseHandle
                id="source-1"
                position={Position.Right}
                type="source"
              />
            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    );
  },
);

DemoTriggerNode.displayName = "DemoTriggerNode";

export const DemoExecutionNode = memo(
  ({ data }: NodeProps<DemoNodeType>) => {
    const status = data.status ?? "initial";

    return (
      <WorkflowNode
        showToolbar={false}
        name={data.name}
        description={data.description}
      >
        <NodeStatusIndicator status={status}>
          <BaseNode status={status}>
            <BaseNodeContent>
              <DemoNodeIcon icon={data.icon} name={data.name} />
              <BaseHandle
                id="target-1"
                position={Position.Left}
                type="target"
              />
              <BaseHandle
                id="source-1"
                position={Position.Right}
                type="source"
              />
            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    );
  },
);

DemoExecutionNode.displayName = "DemoExecutionNode";

export const demoNodeTypes = {
  "demo-trigger": DemoTriggerNode,
  "demo-execution": DemoExecutionNode,
} satisfies NodeTypes;

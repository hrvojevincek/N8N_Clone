"use client";

import { type NodeProps, Position } from "@xyflow/react";
import { memo, type ReactNode } from "react";
import Image from "next/image";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { WorkflowNode } from "@/components/workflow-node";
import { LucideIcon } from "lucide-react";

interface BaseExecutionNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: ReactNode;
  onDoubleClick?: () => void;
  onSettings?: () => void;
}

export const BaseExecutionNode = memo(
  ({
    icon: Icon,
    name,
    description,
    children,
    onDoubleClick,
    onSettings,
  }: BaseExecutionNodeProps) => {
    const handleDelete = () => {};
    return (
      <WorkflowNode
        showToolbar={false}
        name={name}
        description={description}
        onSettings={onSettings}
        onDelete={handleDelete}
      >
        <BaseNode onDoubleClick={onDoubleClick}>
          <BaseNodeContent>
            {typeof Icon === "string" ? (
              <Image src={Icon} alt={name} width={16} height={16} />
            ) : (
              <Icon className="size 4 text-muted-foreground" />
            )}
            {children}
            <BaseHandle id="target-1" position={Position.Left} type="target" />
            <BaseHandle id="source-1" position={Position.Right} type="source" />
          </BaseNodeContent>
        </BaseNode>
      </WorkflowNode>
    );
  }
);

BaseExecutionNode.displayName = "BaseExecutionNode";

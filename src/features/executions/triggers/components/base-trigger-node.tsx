"use client";

import { type NodeProps, Position } from "@xyflow/react";
import { memo, type ReactNode } from "react";
import Image from "next/image";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { WorkflowNode } from "@/components/workflow-node";
import { LucideIcon } from "lucide-react";

interface BaseTriggerNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: ReactNode;
  onDoubleClick?: () => void;
  onSettings?: () => void;
}

export const BaseTriggerNode = memo(
  ({
    icon: Icon,
    name,
    description,
    children,
    onDoubleClick,
    onSettings,
  }: BaseTriggerNodeProps) => {
    const handleDelete = () => {};
    return (
      <WorkflowNode
        showToolbar={false}
        name={name}
        description={description}
        onSettings={onSettings}
        onDelete={handleDelete}
      >
        <BaseNode
          onDoubleClick={onDoubleClick}
          className="rounded-l-2xl relative group"
        >
          <BaseNodeContent>
            {typeof Icon === "string" ? (
              <Image src={Icon} alt={name} width={16} height={16} />
            ) : (
              <Icon className="size 4 text-muted-foreground" />
            )}
            {children}
            <BaseHandle id="source-1" position={Position.Right} type="source" />
          </BaseNodeContent>
        </BaseNode>
      </WorkflowNode>
    );
  }
);

BaseTriggerNode.displayName = "BaseTriggerNode";

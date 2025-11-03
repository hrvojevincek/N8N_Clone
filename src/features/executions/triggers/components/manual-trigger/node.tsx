import { MousePointer2Icon } from "lucide-react";
import { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { NodeProps } from "@xyflow/react";

export const ManualTriggerNode = memo((props: NodeProps) => {
  return (
    <>
      <BaseTriggerNode
        {...props}
        icon={MousePointer2Icon}
        name="When clicking 'Execute Workflow'"
        description="Triggers the flow manually."
        // status={nodeStatus}
        // onDoubleClick={handleOpenSettings}
        // onSettings={handleOpenSettings}
      />
    </>
  );
});

ManualTriggerNode.displayName = "ManualTriggerNode";

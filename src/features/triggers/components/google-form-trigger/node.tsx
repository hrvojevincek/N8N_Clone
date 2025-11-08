import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { GOOGLE_FORM_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/google-form-trigger";
import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { fetchGoogleFormTriggerRealtimeToken } from "./action";
import { GoogleFormTriggerDialog } from "./dialog";

export const GoogleFormTrigger = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GOOGLE_FORM_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGoogleFormTriggerRealtimeToken,
  });

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <GoogleFormTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon="/logos/googleform.svg"
        name="Google Form"
        description="Runs the flow when a Google Form is submitted."
        status={nodeStatus}
        onDoubleClick={handleOpenSettings}
        onSettings={handleOpenSettings}
      />
    </>
  );
});

GoogleFormTrigger.displayName = "GoogleFormTrigger";

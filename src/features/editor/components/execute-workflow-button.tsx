"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  useExecuteWorkflow,
  useUpdateWorkflow,
} from "@/features/workflows/hooks/use-workflows";
import { TRPCClientError } from "@trpc/client";
import { useAtomValue, useSetAtom } from "jotai";
import { FlaskConicalIcon, KeyRoundIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { activeExecutionEventIdAtom, editorAtom } from "../store/atoms";

const DemoUsedDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Your demo run is used up</AlertDialogTitle>
          <AlertDialogDescription>
            This workflow ran once on our sandbox key. To keep running it, add
            your own Gemini API key — Google gives them away for free at{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Google AI Studio
            </a>
            , then select it in the Gemini node.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button asChild>
            <Link href="/credentials/new">
              <KeyRoundIcon className="size-4" />
              Add your Gemini key
            </Link>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const ExecuteWorkflowButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const editor = useAtomValue(editorAtom);
  const setActiveEventId = useSetAtom(activeExecutionEventIdAtom);
  const saveWorkflow = useUpdateWorkflow();
  const executeWorkflow = useExecuteWorkflow();
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);

  const handleExecute = async () => {
    // Auto-save so the run always matches what's on the canvas
    if (editor) {
      const nodes = editor.getNodes();
      const edges = editor.getEdges();

      try {
        await saveWorkflow.mutateAsync({
          id: workflowId,
          nodes,
          edges: edges.map((edge) => ({
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle || "source-1",
            targetHandle: edge.targetHandle || "target-1",
          })),
        });
      } catch {
        // Save failed (toast already shown by the hook) — don't run stale state
        return;
      }
    }

    executeWorkflow.mutate(
      { id: workflowId },
      {
        onSuccess: (data) => {
          if (data.inngestEventId) {
            setActiveEventId(data.inngestEventId);
          }
        },
        onError: (error) => {
          if (
            error instanceof TRPCClientError &&
            error.data?.code === "PRECONDITION_FAILED"
          ) {
            setDemoDialogOpen(true);
          }
        },
      },
    );
  };

  return (
    <>
      <DemoUsedDialog open={demoDialogOpen} onOpenChange={setDemoDialogOpen} />
      <Button
        size="lg"
        onClick={handleExecute}
        disabled={executeWorkflow.isPending || saveWorkflow.isPending}
      >
        <FlaskConicalIcon className="size-4" />
        Execute Workflow
      </Button>
    </>
  );
};

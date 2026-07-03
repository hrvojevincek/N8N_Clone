"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ExecutionStatus } from "@/db/enums";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useAtom, useSetAtom } from "jotai";
import {
  CheckCircle2Icon,
  KeyRoundIcon,
  SparklesIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { hasUnseenExecutionAtom } from "@/features/executions/store/atoms";
import { activeExecutionEventIdAtom } from "../store/atoms";

type AiResponsePayload = {
  aiResponse?: { text?: string };
};

const extractAiTexts = (output: Record<string, unknown>) => {
  const results: Array<{ variableName: string; text: string }> = [];
  for (const [key, value] of Object.entries(output)) {
    const text = (value as AiResponsePayload)?.aiResponse?.text;
    if (typeof text === "string" && text.length > 0) {
      results.push({ variableName: key, text });
    }
  }
  return results;
};

const DemoBanner = () => {
  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs space-y-2">
      <p className="font-medium flex items-center gap-1.5">
        <SparklesIcon className="size-3.5" />
        This ran on our demo key
      </p>
      <p className="text-muted-foreground">
        Add your own free Gemini API key to build and run your own AI workflows.
      </p>
      <Button asChild size="sm" variant="outline" className="w-full">
        <Link href="/credentials/new">
          <KeyRoundIcon className="size-3.5" />
          Add your Gemini key
        </Link>
      </Button>
    </div>
  );
};

export const ExecutionResultPanel = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const [eventId, setEventId] = useAtom(activeExecutionEventIdAtom);
  const setHasUnseenExecution = useSetAtom(hasUnseenExecutionAtom);
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const trpc = useTRPC();

  useEffect(() => {
    setEventId(null);
  }, [workflowId, setEventId]);

  const { data: execution } = useQuery({
    ...trpc.executions.getByEventId.queryOptions({
      eventId: eventId ?? "",
    }),
    enabled: !!eventId,
    refetchInterval: (query) => {
      if (query.state.error) {
        return false;
      }
      if (!query.state.data && query.state.dataUpdateCount > 80) {
        return false;
      }
      const status = query.state.data?.status;
      return status === ExecutionStatus.SUCCESS ||
        status === ExecutionStatus.FAILED
        ? false
        : 1500;
    },
    retry: false,
  });

  useEffect(() => {
    const status = execution?.status;
    if (
      status === ExecutionStatus.SUCCESS ||
      status === ExecutionStatus.FAILED
    ) {
      setHasUnseenExecution(true);
    }
  }, [execution?.status, setHasUnseenExecution]);

  if (!eventId) {
    return null;
  }

  const status = execution?.status;
  const isRunning = !execution || status === ExecutionStatus.RUNNING;
  const isSuccess = status === ExecutionStatus.SUCCESS;
  const isFailed = status === ExecutionStatus.FAILED;

  const output = (execution?.output ?? {}) as Record<string, unknown>;
  const aiTexts = isSuccess ? extractAiTexts(output) : [];

  return (
    <div className="w-95 max-w-[calc(100vw-2rem)] rounded-lg border bg-background shadow-lg">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-medium">
          {isRunning && (
            <>
              <Spinner className="size-4" />
              Running workflow...
            </>
          )}
          {isSuccess && (
            <>
              <CheckCircle2Icon className="size-4 text-green-600" />
              Run complete
            </>
          )}
          {isFailed && (
            <>
              <XCircleIcon className="size-4 text-destructive" />
              Run failed
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => setEventId(null)}
        >
          <XIcon className="size-4" />
        </Button>
      </div>

      <div className="max-h-[50vh] overflow-y-auto p-4 space-y-3">
        {isRunning && (
          <p className="text-sm text-muted-foreground">
            Watch the nodes on the canvas light up as each step runs.
          </p>
        )}

        {isFailed && (
          <p className="text-sm text-destructive whitespace-pre-wrap">
            {execution?.error || "Something went wrong during this run."}
          </p>
        )}

        {isSuccess && (
          <>
            {aiTexts.map(({ variableName, text }) => (
              <div key={variableName} className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {variableName}
                </p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {text}
                </p>
              </div>
            ))}

            {aiTexts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Workflow finished successfully.
              </p>
            )}

            {Object.keys(output).length > 0 && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Full output
                </summary>
                <pre className="mt-2 max-h-60 overflow-auto rounded-md bg-muted p-2 whitespace-pre-wrap break-all">
                  {JSON.stringify(output, null, 2)}
                </pre>
              </details>
            )}

            {workflow.isDemo && <DemoBanner />}
          </>
        )}
      </div>
    </div>
  );
};

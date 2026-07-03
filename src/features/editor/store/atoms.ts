import { ReactFlowInstance } from "@xyflow/react";
import { atom } from "jotai";

export const editorAtom = atom<ReactFlowInstance | null>(null);

/** Inngest event id of the run currently shown in the result panel */
export const activeExecutionEventIdAtom = atom<string | null>(null);

import { atom } from "jotai";

/**
 * True when a workflow run finished but the user hasn't visited the
 * Executions page yet — drives the notification dot in the sidebar.
 */
export const hasUnseenExecutionAtom = atom(false);

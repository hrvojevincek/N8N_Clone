"use client";

import { Button } from "@/components/ui/button";
import type { NodeStatus } from "@/components/react-flow/node-status-indicator";
import {
  Background,
  Panel,
  ReactFlow,
  applyNodeChanges,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FlaskConicalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  DEMO_EDGES,
  DEMO_EXECUTION_SEQUENCE,
  DEMO_NODES,
} from "../constants";
import { demoNodeTypes, type DemoNodeData } from "./demo-nodes";

const AUTO_RUN_INTERVAL_MS = 9000;
const FIRST_RUN_DELAY_MS = 1200;
const STEP_DURATION_MS = 1000;
const SUCCESS_HOLD_MS = 2000;

export const DemoCanvas = () => {
  const router = useRouter();

  const [nodes, setNodes] = useState<Node<DemoNodeData>[]>(DEMO_NODES);
  const [statuses, setStatuses] = useState<Record<string, NodeStatus>>({});
  const [isRunning, setIsRunning] = useState(false);

  const isRunningRef = useRef(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => timeouts.forEach(clearTimeout);
  }, []);

  const schedule = (callback: () => void, delayMs: number) => {
    timeoutsRef.current.push(setTimeout(callback, delayMs));
  };

  const runSimulation = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setIsRunning(true);
    setStatuses({});

    const setGroupStatus = (group: string[], status: NodeStatus) =>
      setStatuses((prev) => ({
        ...prev,
        ...Object.fromEntries(group.map((nodeId) => [nodeId, status])),
      }));

    let delayMs = 300;
    for (const group of DEMO_EXECUTION_SEQUENCE) {
      const groupStart = delayMs;
      schedule(() => setGroupStatus(group, "loading"), groupStart);
      delayMs += STEP_DURATION_MS;
      const groupEnd = delayMs;
      schedule(() => setGroupStatus(group, "success"), groupEnd);
    }

    schedule(() => {
      setStatuses({});
      setIsRunning(false);
      isRunningRef.current = false;
    }, delayMs + SUCCESS_HOLD_MS);
  }, []);

  useEffect(() => {
    const firstRun = setTimeout(runSimulation, FIRST_RUN_DELAY_MS);
    const interval = setInterval(runSimulation, AUTO_RUN_INTERVAL_MS);
    return () => {
      clearTimeout(firstRun);
      clearInterval(interval);
    };
  }, [runSimulation]);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<DemoNodeData>>[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  const showSignupToast = useCallback(() => {
    toast("Sign up to start building", {
      id: "demo-signup",
      description:
        "Create a free account to configure nodes and run real workflows.",
      action: {
        label: "Sign up",
        onClick: () => router.push("/sign-up"),
      },
    });
  }, [router]);

  const nodesWithStatus = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: { ...node.data, status: statuses[node.id] ?? "initial" },
      })),
    [nodes, statuses],
  );

  const edges = useMemo(
    () => DEMO_EDGES.map((edge) => ({ ...edge, animated: isRunning })),
    [isRunning],
  );

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodesWithStatus}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={demoNodeTypes}
        onNodeClick={showSignupToast}
        onNodeDoubleClick={showSignupToast}
        nodesConnectable={false}
        deleteKeyCode={null}
        zoomOnDoubleClick={false}
        snapToGrid
        snapGrid={[10, 10]}
        panOnScroll
        fitView
        fitViewOptions={{ padding: 0.4 }}
      >
        <Background />
        <Panel position="bottom-center">
          <Button size="lg" onClick={runSimulation} disabled={isRunning}>
            <FlaskConicalIcon className="size-4" />
            {isRunning ? "Executing..." : "Execute Workflow"}
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

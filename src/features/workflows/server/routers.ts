import { PAGINATION } from "@/config/constants";
import { sendWorkflowExecution } from "@/inngest/utils";
import { db } from "@/db/client";
import {
  workflows,
  nodes as workflowNodes,
  connections as workflowConnections,
} from "@/db/schema";
import { NodeType } from "@/db/enums";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import type { Edge, Node } from "@xyflow/react";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { generateSlug } from "random-word-slugs";
import { z } from "zod";

export const workflowsRouter = createTRPCRouter({
  execute: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [workflow] = await db
        .select()
        .from(workflows)
        .where(
          and(
            eq(workflows.id, input.id),
            eq(workflows.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!workflow) {
        throw new Error("Workflow not found");
      }

      await sendWorkflowExecution({ workflowId: input.id });

      return workflow;
    }),

  create: premiumProcedure.mutation(async ({ ctx }) => {
    const [workflow] = await db
      .insert(workflows)
      .values({
        id: createId(),
        name: generateSlug(3),
        userId: ctx.auth.user.id,
      })
      .returning();

    if (!workflow) {
      throw new Error("Failed to create workflow");
    }

    await db.insert(workflowNodes).values({
      id: createId(),
      workflowId: workflow.id,
      name: "Initial",
      type: NodeType.INITIAL,
      position: { x: 0, y: 0 },
      data: {},
    });

    return workflow;
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.string().nullish(),
            position: z.object({
              x: z.number(),
              y: z.number(),
            }),
            data: z.record(z.string(), z.unknown()).optional(),
          })
        ),
        edges: z.array(
          z.object({
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string(),
            targetHandle: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, nodes, edges } = input;

      const [workflow] = await db
        .select()
        .from(workflows)
        .where(
          and(eq(workflows.id, id), eq(workflows.userId, ctx.auth.user.id))
        )
        .limit(1);

      if (!workflow) {
        throw new Error("Workflow not found");
      }

      await db.transaction(async (tx) => {
        await tx.delete(workflowNodes).where(eq(workflowNodes.workflowId, id));

        if (nodes.length > 0) {
          await tx.insert(workflowNodes).values(
            nodes.map((node) => ({
              id: node.id,
              workflowId: id,
              name: node.type || "unknown",
              type: (node.type as NodeType) ?? NodeType.INITIAL,
              position: node.position,
              data: node.data ?? {},
            }))
          );
        }

        await tx
          .delete(workflowConnections)
          .where(eq(workflowConnections.workflowId, id));

        if (edges.length > 0) {
          await tx.insert(workflowConnections).values(
            edges.map((edge) => ({
              id: createId(),
              workflowId: id,
              fromNodeId: edge.source,
              toNodeId: edge.target,
              fromOutput: edge.sourceHandle || "main",
              toInput: edge.targetHandle || "main",
            }))
          );
        }

        await tx
          .update(workflows)
          .set({ updatedAt: new Date() })
          .where(eq(workflows.id, id));
      });

      return workflow;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await db
        .delete(workflows)
        .where(
          and(
            eq(workflows.id, input.id),
            eq(workflows.userId, ctx.auth.user.id)
          )
        )
        .returning();

      if (!deleted) {
        throw new Error("Workflow not found");
      }

      return deleted;
    }),

  updateName: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(workflows)
        .set({ name: input.name, updatedAt: new Date() })
        .where(
          and(
            eq(workflows.id, input.id),
            eq(workflows.userId, ctx.auth.user.id)
          )
        )
        .returning();

      if (!updated) {
        throw new Error("Workflow not found");
      }

      return updated;
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [workflow] = await db
        .select()
        .from(workflows)
        .where(
          and(
            eq(workflows.id, input.id),
            eq(workflows.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!workflow) {
        throw new Error("Workflow not found");
      }

      const wfNodes = await db
        .select()
        .from(workflowNodes)
        .where(eq(workflowNodes.workflowId, workflow.id));

      const wfConnections = await db
        .select()
        .from(workflowConnections)
        .where(eq(workflowConnections.workflowId, workflow.id));

      const nodes: Node[] = wfNodes.map((node) => ({
        id: node.id,
        position: node.position as { x: number; y: number },
        type: node.type,
        data: (node.data as Record<string, unknown>) || {},
      }));

      const edges: Edge[] = wfConnections.map((connection) => ({
        id: connection.id,
        source: connection.fromNodeId,
        target: connection.toNodeId,
        sourceHandle: connection.fromOutput,
        targetHandle: connection.toInput,
      }));

      return {
        id: workflow.id,
        name: workflow.name,
        nodes,
        edges,
      };
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const where = and(
        eq(workflows.userId, ctx.auth.user.id),
        search ? ilike(workflows.name, `%${search}%`) : sql`true`
      );

      const items = await db
        .select()
        .from(workflows)
        .where(where)
        .orderBy(desc(workflows.updatedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(workflows)
        .where(where);

      const totalCount = Number(count);
      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),
});

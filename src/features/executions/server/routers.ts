// src/features/executions/server/routers.ts

import { PAGINATION } from "@/config/constants";
import { db } from "@/db/client";
import { executions, workflows } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

export const executionsRouter = createTRPCRouter({
  // Used by the editor result panel to poll a run right after dispatch.
  // Returns null (not an error) because the execution row is created by the
  // Inngest function and may not exist yet when polling starts.
  getByEventId: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [execution] = await db
        .select({
          id: executions.id,
          workflowId: executions.workflowId,
          status: executions.status,
          error: executions.error,
          startedAt: executions.startedAt,
          completedAt: executions.completedAt,
          output: executions.output,
        })
        .from(executions)
        .innerJoin(workflows, eq(executions.workflowId, workflows.id))
        .where(
          and(
            eq(executions.inngestEventId, input.eventId),
            eq(workflows.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      return execution ?? null;
    }),

  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const [execution] = await db
        .select({
          id: executions.id,
          workflowId: executions.workflowId,
          status: executions.status,
          error: executions.error,
          errorStack: executions.errorStack,
          startedAt: executions.startedAt,
          completedAt: executions.completedAt,
          inngestEventId: executions.inngestEventId,
          output: executions.output,
          workflow: {
            id: workflows.id,
            name: workflows.name,
          },
        })
        .from(executions)
        .innerJoin(workflows, eq(executions.workflowId, workflows.id))
        .where(eq(executions.id, input.id))
        .limit(1);

      if (!execution) {
        throw new Error("Execution not found");
      }

      return execution;
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
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;

      const where = eq(workflows.userId, ctx.auth.user.id);

      const items = await db
        .select({
          id: executions.id,
          workflowId: executions.workflowId,
          status: executions.status,
          error: executions.error,
          errorStack: executions.errorStack,
          startedAt: executions.startedAt,
          completedAt: executions.completedAt,
          inngestEventId: executions.inngestEventId,
          output: executions.output,
          workflow: {
            id: workflows.id,
            name: workflows.name,
          },
        })
        .from(executions)
        .innerJoin(workflows, eq(executions.workflowId, workflows.id))
        .where(where)
        .orderBy(desc(executions.startedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(executions)
        .innerJoin(workflows, eq(executions.workflowId, workflows.id))
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

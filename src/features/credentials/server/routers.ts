import { PAGINATION } from "@/config/constants";
import { db } from "@/db/client";
import { credentials } from "@/db/schema";
import { CredentialType } from "@/db/enums";
import { encrypt } from "@/lib/encrypt";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { z } from "zod";

export const credentialsRouter = createTRPCRouter({
  create: premiumProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.nativeEnum(CredentialType),
        value: z.string().min(1, "Value is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, type, value } = input;

      const [created] = await db
        .insert(credentials)
        .values({
          id: crypto.randomUUID(),
          userId: ctx.auth.user.id,
          name,
          type,
          value: encrypt(value),
        })
        .returning();

      if (!created) {
        throw new Error("Failed to create credential");
      }

      return created;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        type: z.nativeEnum(CredentialType),
        value: z.string().min(1, "Value is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, type, value } = input;

      const [updated] = await db
        .update(credentials)
        .set({
          name,
          type,
          value: encrypt(value),
          updatedAt: new Date(),
        })
        .where(
          and(eq(credentials.id, id), eq(credentials.userId, ctx.auth.user.id))
        )
        .returning();

      if (!updated) {
        throw new Error("Credential not found");
      }

      return updated;
    }),

  remove: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await db
        .delete(credentials)
        .where(
          and(
            eq(credentials.id, input.id),
            eq(credentials.userId, ctx.auth.user.id)
          )
        )
        .returning();

      if (!deleted) {
        throw new Error("Credential not found");
      }

      return deleted;
    }),

  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [credential] = await db
        .select()
        .from(credentials)
        .where(
          and(
            eq(credentials.id, input.id),
            eq(credentials.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!credential) {
        throw new Error("Credential not found");
      }

      return credential;
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
        eq(credentials.userId, ctx.auth.user.id),
        search ? ilike(credentials.name, `%${search}%`) : sql`true`
      );

      const items = await db
        .select({
          id: credentials.id,
          name: credentials.name,
          type: credentials.type,
          createdAt: credentials.createdAt,
          updatedAt: credentials.updatedAt,
        })
        .from(credentials)
        .where(where)
        .orderBy(desc(credentials.updatedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(credentials)
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

  getByType: protectedProcedure
    .input(
      z.object({
        type: z.nativeEnum(CredentialType),
      })
    )
    .query(async ({ ctx, input }) => {
      const { type } = input;

      return db
        .select()
        .from(credentials)
        .where(
          and(
            eq(credentials.userId, ctx.auth.user.id),
            eq(credentials.type, type)
          )
        )
        .orderBy(desc(credentials.createdAt));
    }),
});

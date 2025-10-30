import prisma from "@/lib/database";
import { createTRPCRouter, protectedProcedure } from "../init";
import { inngest } from "@/inngest/client";

export const appRouter = createTRPCRouter({
  testAi: protectedProcedure.mutation(async ({}) => {
    await inngest.send({
      name: "execute/ai",
    });
    return { success: true, message: "Job queued successfully" };
  }),
  getWorkflows: protectedProcedure.query(({}) => {
    return prisma.workflow.findMany();
  }),
  createWorkflow: protectedProcedure.mutation(async ({}) => {
    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "test@test.com",
      },
    });

    return prisma.workflow.create({
      data: {
        name: "test-workflow",
      },
    });
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;

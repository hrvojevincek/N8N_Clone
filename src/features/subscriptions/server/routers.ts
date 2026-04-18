import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { polarClient } from "@/lib/polar";
import { TRPCError } from "@trpc/server";

export const subscriptionsRouter = createTRPCRouter({
  getState: protectedProcedure.query(async ({ ctx }) => {
    try {
      const customer = await polarClient.customers.getStateExternal({
        externalId: ctx.auth.user.id,
      });
      return {
        activeSubscriptions: customer.activeSubscriptions ?? [],
      };
    } catch {
      // Customer doesn't exist in Polar yet
      return { activeSubscriptions: [] };
    }
  }),

  createCheckout: protectedProcedure.mutation(async ({ ctx }) => {
    const productId = process.env.POLAR_PRODUCT_ID;
    if (!productId) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "POLAR_PRODUCT_ID is not configured",
      });
    }

    try {
      const checkout = await polarClient.checkouts.create({
        products: [productId],
        externalCustomerId: ctx.auth.user.id,
        customerEmail: ctx.auth.user.email,
        successUrl: `${process.env.BETTER_AUTH_URL}/workflows?checkout=success`,
      });

      return { url: checkout.url };
    } catch (error) {
      console.error("Polar checkout creation failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create checkout session",
      });
    }
  }),

  getPortalUrl: protectedProcedure.mutation(async ({ ctx }) => {
    const session = await polarClient.customerSessions.create({
      externalCustomerId: ctx.auth.user.id,
    });

    return { url: session.customerPortalUrl };
  }),
});

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/client";
import { polarClient } from "@/lib/polar";
import { createWorkflowFromTemplate } from "@/features/workflows/server/create-from-template";
import { DEMO_TEMPLATE_ID, getTemplate } from "@/features/workflows/templates";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await polarClient.customers.create({
              email: user.email,
              externalId: user.id,
              name: user.name || undefined,
            });
          } catch (error) {
            console.error("Failed to create Polar customer:", error);
          }

          try {
            const demoTemplate = getTemplate(DEMO_TEMPLATE_ID);
            if (demoTemplate) {
              await createWorkflowFromTemplate(user.id, demoTemplate);
            }
          } catch (error) {
            console.error("Failed to seed demo workflow:", error);
          }
        },
      },
    },
  },
});

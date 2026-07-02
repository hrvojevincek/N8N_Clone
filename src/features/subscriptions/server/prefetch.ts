import { prefetch, trpc } from "@/trpc/server";

export const prefetchSubscriptionState = () => {
  return prefetch(trpc.subscriptions.getState.queryOptions());
};

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const useSubscriptions = () => {
  const trpc = useTRPC();
  return useQuery(trpc.subscriptions.getState.queryOptions());
};

export const useHasActiveSubscription = () => {
  const { data: customerState, isLoading, ...rest } = useSubscriptions();

  const hasActiveSubscription =
    customerState?.activeSubscriptions &&
    customerState.activeSubscriptions.length > 0;

  return {
    hasActiveSubscription,
    subscription: customerState?.activeSubscriptions?.[0],
    isLoading,
    ...rest,
  };
};

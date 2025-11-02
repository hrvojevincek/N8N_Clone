import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const useSubscriptions = () => {
  const session = authClient.useSession();
  const userId = session.data?.user?.id;

  return useQuery({
    queryKey: ["subscriptions", userId],
    queryFn: async () => {
      const { data } = await authClient.customer.state();
      return data;
    },
    enabled: !!userId,
    gcTime: 0,
  });
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

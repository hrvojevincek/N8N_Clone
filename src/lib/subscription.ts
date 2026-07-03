import { polarClient } from "@/lib/polar";

export const FREE_WORKFLOW_LIMIT = 3;

export const hasActiveSubscription = async (
  userId: string
): Promise<boolean> => {
  try {
    const customer = await polarClient.customers.getStateExternal({
      externalId: userId,
    });
    return (customer.activeSubscriptions?.length ?? 0) > 0;
  } catch {
    // Customer not found in Polar — treat as no subscription
    return false;
  }
};

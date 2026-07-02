import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { prefetchSubscriptionState } from "@/features/subscriptions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  await requireAuth();
  await prefetchSubscriptionState();

  return (
    <HydrateClient>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-accent/20">{children}</SidebarInset>
      </SidebarProvider>
    </HydrateClient>
  );
};

export default Layout;

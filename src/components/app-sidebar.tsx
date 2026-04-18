"use client";

import {
  CreditCardIcon,
  FolderOpenIcon,
  HelpCircleIcon,
  HistoryIcon,
  KeyIcon,
  LogOutIcon,
  StarIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscriptions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useState } from "react";

const menuItems = [
  {
    title: "Home",
    items: [
      {
        title: "Workflows",
        url: "/workflows",
        icon: FolderOpenIcon,
      },
      {
        title: "Credentials",
        url: "/credentials",
        icon: KeyIcon,
      },
      {
        title: "Executions",
        url: "/executions",
        icon: HistoryIcon,
      },
    ],
  },
];

const AppSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { hasActiveSubscription, isLoading } = useHasActiveSubscription();
  const [helpOpen, setHelpOpen] = useState(false);

  const createCheckout = useMutation(
    trpc.subscriptions.createCheckout.mutationOptions({
      onSuccess: (data) => {
        if (data.url) {
          window.location.href = data.url;
        }
      },
    })
  );

  const getPortalUrl = useMutation(
    trpc.subscriptions.getPortalUrl.mutationOptions({
      onSuccess: (data) => {
        if (data.url) {
          window.location.href = data.url;
        }
      },
    })
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="gap-x-4 h-10 px-4">
            <Link href="/" prefetch>
              <Image
                src="/logos/logo.svg"
                alt="N8N Clone"
                width={30}
                height={30}
              />
              <span className="font-semibold text-sm">N8N Clone</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={
                        item.url === "/"
                          ? pathname === item.url
                          : pathname.startsWith(item.url)
                      }
                      asChild
                      className="gap-x-4 h-10 px-4"
                    >
                      <Link href={item.url} prefetch>
                        <item.icon className="size-4" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {!hasActiveSubscription && !isLoading && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => createCheckout.mutate()}
                disabled={createCheckout.isPending}
                className="gap-x-4 h-10 px-4"
                tooltip="Upgrade to Pro"
              >
                <StarIcon className="h-4 w-4" />
                <span>{createCheckout.isPending ? "Redirecting..." : "Upgrade to Pro"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {hasActiveSubscription && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => getPortalUrl.mutate()}
                disabled={getPortalUrl.isPending}
                className="gap-x-4 h-10 px-4"
                tooltip="Billing"
              >
                <CreditCardIcon className="h-4 w-4" />
                <span>{getPortalUrl.isPending ? "Loading..." : "Billing"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setHelpOpen(true)}
              className="gap-x-4 h-10 px-4"
              tooltip="Help"
            >
              <HelpCircleIcon className="h-4 w-4" />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={async () => {
                queryClient.removeQueries({ queryKey: ["subscriptions"] });

                await authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/login");
                    },
                  },
                });
              }}
              className="gap-x-4 h-10 px-4"
              tooltip="Sign Out"
            >
              <LogOutIcon className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Getting Started</DialogTitle>
            <DialogDescription>
              How to build your first workflow
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
            <li>
              <span className="font-medium text-foreground">Subscribe to Pro</span>
              {" "}&mdash; click &quot;Upgrade to Pro&quot; to unlock workflow creation
            </li>
            <li>
              <span className="font-medium text-foreground">Create a Workflow</span>
              {" "}&mdash; go to Workflows and click the + button
            </li>
            <li>
              <span className="font-medium text-foreground">Choose a Trigger</span>
              {" "}&mdash; every workflow starts with a trigger node (webhook, schedule, etc.)
            </li>
            <li>
              <span className="font-medium text-foreground">Add Actions</span>
              {" "}&mdash; connect action nodes to process data, call APIs, or send notifications
            </li>
            <li>
              <span className="font-medium text-foreground">Add Credentials</span>
              {" "}&mdash; go to Credentials to store API keys for your integrations
            </li>
            <li>
              <span className="font-medium text-foreground">Execute</span>
              {" "}&mdash; run your workflow manually or let the trigger fire automatically
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
};

export default AppSidebar;

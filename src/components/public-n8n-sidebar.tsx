"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FolderOpenIcon, HistoryIcon, KeyIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  {
    title: "Home",
    items: [
      {
        title: "Workflows",
        url: "/sign-up",
        icon: FolderOpenIcon,
      },
      {
        title: "Credentials",
        url: "/sign-up",
        icon: KeyIcon,
      },
      {
        title: "Executions",
        url: "/sign-up",
        icon: HistoryIcon,
      },
    ],
  },
];

const PublicN8nSidebar = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="gap-x-4 h-10 px-4">
            <Link href="/login" prefetch>
              <Image
                src="/logos/logo.svg"
                alt="N8N Clone"
                width={30}
                height={30}
                style={{ width: "auto", height: "auto" }}
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
                      className="gap-x-4 h-10 px-4"
                      asChild
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
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="gap-x-4 h-10 px-4">
              <Link href="/login" prefetch>
                <UserIcon className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default PublicN8nSidebar;

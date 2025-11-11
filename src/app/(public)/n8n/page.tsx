"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { RegisterForm } from "@/features/auth/components/register-form";
import { SaveIcon } from "lucide-react";
import Image from "next/image";

const Page = () => {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
        <div className="flex flex-row justify-between w-full items-center gap-x-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <div>Workflows</div>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="cursor-pointer hover:text-foreground transition-colors">
                Welcome to N8N CLONE - Presentation Mode - Login to get started
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <Button variant="outline" size="sm" disabled={true}>
              <SaveIcon className="size-4" />
              Save
            </Button>
          </div>
        </div>
      </header>
      <div className="flex-1 group relative overflow-hidden">
        <Image
          src="/images/n8n-clone.png"
          alt="N8N Clone"
          className="object-cover"
          fill
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

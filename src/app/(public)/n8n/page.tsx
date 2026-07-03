import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoCanvas } from "@/features/demo/components/demo-canvas";
import { DEMO_WORKFLOW_NAME } from "@/features/demo/constants";
import Link from "next/link";

const Page = () => {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
        <div className="flex flex-row justify-between w-full items-center gap-x-4">
          <div className="flex items-center gap-x-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/sign-up">Workflows</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{DEMO_WORKFLOW_NAME}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Badge variant="secondary">Demo</Badge>
          </div>
          <div className="ml-auto flex items-center gap-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>
      <div className="flex-1 min-h-0">
        <DemoCanvas />
      </div>
    </div>
  );
};

export default Page;

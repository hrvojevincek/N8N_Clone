import PublicN8nSidebar from "@/components/public-n8n-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <PublicN8nSidebar />
      <SidebarInset className="bg-accent/20">
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;

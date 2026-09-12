import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { requireAdmin } from "@/lib/authz";

import { AppSidebar } from "./_components/app-sidebar";
import { AdminBreadcrumbs } from "./_components/breadcrumbs";

/**
 * Kerangka panel admin. Guard dipasang juga di sini agar seluruh route di
 * bawahnya tertutup sejak layout, bukan hanya per halaman.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <SidebarProvider>
      <AppSidebar nama={admin.username ?? admin.name} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <AdminBreadcrumbs />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

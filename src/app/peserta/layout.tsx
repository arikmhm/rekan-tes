import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { requireUser } from "@/lib/authz";

import { AppSidebar } from "./_components/app-sidebar";
import { PesertaBreadcrumbs } from "./_components/breadcrumbs";

/**
 * Kerangka ruang peserta. Guard dipasang di sini, sama seperti
 * `admin/layout.tsx`, supaya seluruh route di bawah /peserta ikut tertutup
 * sejak layout.
 */
export default async function PesertaLayout({
  children,
}: LayoutProps<"/peserta">) {
  const user = await requireUser();

  return (
    <SidebarProvider>
      <AppSidebar nama={user.username ?? user.name} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <PesertaBreadcrumbs />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

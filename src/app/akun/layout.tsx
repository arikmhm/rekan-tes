import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { requireUser } from "@/lib/authz";

import { AppSidebar } from "./_components/app-sidebar";

/**
 * Kerangka dashboard peserta. Guard dipasang di sini, sama seperti
 * `admin/layout.tsx`, supaya seluruh route di bawah /akun ikut tertutup
 * sejak layout.
 */
export default async function AkunLayout({ children }: LayoutProps<"/akun">) {
  const user = await requireUser();

  return (
    <SidebarProvider>
      <AppSidebar nama={user.username ?? user.name} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium">Dasbor</span>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

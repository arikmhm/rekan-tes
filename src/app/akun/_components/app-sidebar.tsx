"use client";

import { BookOpen, ExternalLink, KeyRound, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

const menu = [{ href: "/akun", label: "Dasbor", icon: LayoutDashboard }];

export function AppSidebar({ nama }: { nama: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [keluar, setKeluar] = useState(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/akun" />}>
              <span className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-xs font-bold">
                RT
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">Rekan Tes</span>
                <span className="text-muted-foreground truncate text-xs">Dashboard peserta</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Ringkasan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => {
                const aktif = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={aktif}
                      tooltip={item.label}
                      className="data-active:text-brand-orange"
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Simulasi</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Katalog" render={<Link href="/tes" />}>
                  <BookOpen />
                  <span>Katalog</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton size="lg" tooltip={nama}>
                    <span className="bg-brand-orange flex aspect-square size-8 items-center justify-center rounded-lg text-xs font-semibold text-white uppercase">
                      {nama.slice(0, 2)}
                    </span>
                    <span className="grid flex-1 text-left leading-tight">
                      <span className="truncate font-medium">{nama}</span>
                      <span className="text-muted-foreground truncate text-xs">Peserta</span>
                    </span>
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem render={<Link href="/lupa-password" />}>
                  <KeyRound />
                  Ganti password
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/" />}>
                  <ExternalLink />
                  Lihat situs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={keluar}
                  onClick={async () => {
                    setKeluar(true);
                    await authClient.signOut();
                    router.push("/");
                    router.refresh();
                  }}
                >
                  <LogOut />
                  {keluar ? "Keluar…" : "Keluar"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

"use client";

import {
  BookOpen,
  ExternalLink,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Package,
  Receipt,
  Users,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
import { keluar } from "@/lib/auth-actions";

const grup = [
  {
    label: "Ringkasan",
    items: [{ href: "/admin", label: "Dasbor", icon: LayoutDashboard }],
  },
  {
    label: "Bank konten",
    items: [
      { href: "/admin/kategori", label: "Kategori soal", icon: Tags },
      { href: "/admin/soal", label: "Bank soal", icon: BookOpen },
      { href: "/admin/subtes", label: "Subtes", icon: ListChecks },
    ],
  },
  {
    label: "Produk",
    items: [{ href: "/admin/tes", label: "Produk tes", icon: Package }],
  },
  {
    label: "Operasional",
    items: [
      { href: "/admin/pesanan", label: "Pesanan", icon: Receipt },
      { href: "/admin/pengguna", label: "Pengguna", icon: Users },
    ],
  },
];

export function AppSidebar({ nama }: { nama: string }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/admin" />}>
              <span className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-xs font-bold">
                RT
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">Rekan Tes</span>
                <span className="text-muted-foreground truncate text-xs">Panel admin</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {grup.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const aktif =
                    item.href === "/admin"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

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
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton size="lg" tooltip={nama}>
                    <span className="bg-muted text-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-xs font-semibold uppercase">
                      {nama.slice(0, 2)}
                    </span>
                    <span className="grid flex-1 text-left leading-tight">
                      <span className="truncate font-medium">{nama}</span>
                      <span className="text-muted-foreground truncate text-xs">Administrator</span>
                    </span>
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem render={<Link href="/" />}>
                  <ExternalLink />
                  Lihat situs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Form, bukan onClick: keluar harus tetap bekerja walau
                    JavaScript-nya belum siap. `closeOnClick={false}` menjaga
                    tombolnya tetap ada di DOM sampai formulirnya terkirim. */}
                <form action={keluar}>
                  <DropdownMenuItem
                    closeOnClick={false}
                    nativeButton
                    className="w-full"
                    render={<button type="submit" />}
                  >
                    <LogOut />
                    Keluar
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

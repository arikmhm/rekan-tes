"use client";

import {
  BookMarked,
  ChevronRight,
  ExternalLink,
  KeyRound,
  LogOut,
  Receipt,
  Store,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { keluar } from "@/lib/auth-actions";

/**
 * Jenis produk di sidebar. Nilainya sama dengan `JenisProduk` di lib/produk,
 * disalin karena berkas itu server-only sedangkan sidebar berjalan di peramban.
 */
const jenisProduk = [
  { kunci: "simulasi", label: "Simulasi" },
  { kunci: "bank-soal", label: "Soal" },
  { kunci: "materi", label: "Ebook" },
];

/**
 * Sidebar disusun mengikuti urutan perjalanan peserta: melihat produk, membayar,
 * lalu memakai yang sudah dibeli. "Belanja" berisi dua langkah pertama —
 * halaman produk sekaligus halaman depan ruang peserta — dan isi pustaka
 * berdiri sendiri karena ia milik peserta, bukan etalase.
 */
const belanja = [
  { href: "/peserta", label: "Produk", icon: Store },
  { href: "/peserta/pesanan", label: "Pesanan", icon: Receipt },
];

export function AppSidebar({ nama }: { nama: string }) {
  const pathname = usePathname();
  const jenisAktif = useSearchParams().get("jenis");
  const diPustaka = pathname === "/peserta/pustaka";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/peserta" />}>
              <span className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-xs font-bold">
                RT
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">Rekan Tes</span>
                <span className="text-muted-foreground truncate text-xs">
                  Ruang peserta
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Belanja</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {belanja.map(({ href, label, icon: Ikon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={pathname === href}
                    tooltip={label}
                    className="data-active:text-brand-orange"
                    render={<Link href={href} />}
                  >
                    <Ikon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Milik saya</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Pustaka terbuka sejak awal: jenis produk yang sudah dibeli
                  perlu terbaca tanpa diklik dulu. */}
              <Collapsible defaultOpen>
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        tooltip="Pustaka"
                        isActive={diPustaka && !jenisAktif}
                        className="group/pustaka data-active:text-brand-orange"
                      >
                        <BookMarked />
                        <span>Pustaka</span>
                        <ChevronRight className="ml-auto transition-transform duration-300 ease-out group-data-[panel-open]/pustaka:rotate-90" />
                      </SidebarMenuButton>
                    }
                  />

                  {/* Tinggi panel dianimasikan lewat variabel yang disediakan
                      Base UI, jadi buka-tutupnya menggeser isi sidebar dengan
                      halus alih-alih melompat. */}
                  <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-300 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={diPustaka && !jenisAktif}
                          render={<Link href="/peserta/pustaka" />}
                        >
                          <span>Semua</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {jenisProduk.map(({ kunci, label }) => (
                        <SidebarMenuSubItem key={kunci}>
                          <SidebarMenuSubButton
                            isActive={diPustaka && jenisAktif === kunci}
                            render={
                              <Link href={`/peserta/pustaka?jenis=${kunci}`} />
                            }
                          >
                            <span>{label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
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
                      <span className="text-muted-foreground truncate text-xs">
                        Peserta
                      </span>
                    </span>
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem render={<Link href="/peserta/profil" />}>
                  <UserRound />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/lupa-password" />}>
                  <KeyRound />
                  Ganti password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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

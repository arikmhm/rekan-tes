import { ArrowRight, BookOpen, ListChecks, Package, Tags } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { adminStats } from "@/lib/admin";

import { AdminShell, EmptyState } from "./_components/shell";

export const metadata: Metadata = { title: "Dasbor admin" };

export default async function AdminPage() {
  const stat = await adminStats();

  const kartu = [
    {
      href: "/admin/kategori",
      label: "Kategori soal",
      icon: Tags,
      nilai: stat.kategori,
      catatan: "kategori terdaftar",
    },
    {
      href: "/admin/soal",
      label: "Bank soal",
      icon: BookOpen,
      nilai: stat.soal,
      catatan: `${stat.soalTerbit} terbit`,
    },
    {
      href: "/admin/subtes",
      label: "Subtes",
      icon: ListChecks,
      nilai: stat.subtes,
      catatan: "jenis subtes",
    },
    {
      href: "/admin/tes",
      label: "Produk tes",
      icon: Package,
      nilai: stat.tes,
      catatan: `${stat.tesTerbit} terbit`,
    },
  ];

  return (
    <AdminShell
      title="Dasbor"
      description="Ringkasan isi bank konten dan hal yang masih menghalangi publikasi tes."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kartu.map((k) => (
          <Link key={k.href} href={k.href} className="group">
            <Card className="hover:border-primary/40 h-full transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                  <k.icon className="size-4" />
                  {k.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight tabular-nums">{k.nilai}</p>
                <p className="text-muted-foreground mt-1 text-xs">{k.catatan}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Perlu dilengkapi</CardTitle>
            <p className="text-muted-foreground text-sm">
              Subtes yang jumlah soalnya belum memenuhi target. Selama ini ada, tes tidak dapat
              diterbitkan.
            </p>
          </CardHeader>
          <CardContent>
            {stat.kurang.length === 0 ? (
              <EmptyState>
                Semua subtes sudah memenuhi target soalnya. Tidak ada yang menghalangi publikasi.
              </EmptyState>
            ) : (
              <ul className="divide-y">
                {stat.kurang.map((k, i) => (
                  <li
                    key={`${k.testId}-${i}`}
                    className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/tes/${k.testId}`}
                        className="font-medium hover:underline"
                      >
                        {k.testName}
                      </Link>
                      <p className="text-muted-foreground truncate text-sm">{k.subtestName}</p>
                    </div>
                    <Badge variant={k.testStatus === "published" ? "destructive" : "outline"}>
                      {k.assigned}/{k.questionLimit} soal
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alur penyusunan</CardTitle>
            <p className="text-muted-foreground text-sm">
              Urutan kerja dari konten mentah sampai produk siap jual.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              { href: "/admin/kategori", label: "Buat kategori soal" },
              { href: "/admin/soal", label: "Isi bank soal lalu terbitkan" },
              { href: "/admin/subtes", label: "Tentukan subtes per kategori" },
              { href: "/admin/tes", label: "Susun produk tes dan terbitkan" },
            ].map((l, i) => (
              <div key={l.href}>
                {i > 0 && <Separator className="mb-3" />}
                <Link
                  href={l.href}
                  className="group flex items-center gap-3 text-sm hover:text-primary"
                >
                  <span className="bg-muted grid size-6 shrink-0 place-items-center rounded-md font-mono text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span className="flex-1">{l.label}</span>
                  <ArrowRight className="text-muted-foreground size-4 transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            ))}
            <Separator />
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/produk" />}
              className="w-full"
            >
              Lihat halaman produk
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

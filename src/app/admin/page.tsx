import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/authz";

import { AdminShell } from "./_components/shell";

export const metadata: Metadata = { title: "Admin" };

const items = [
  {
    href: "/admin/kategori",
    title: "Kategori soal",
    description: "Kelola kategori seperti Numerik, Verbal, dan Pengetahuan Perbankan.",
  },
  {
    href: "/admin/soal",
    title: "Bank soal",
    description: "Buat dan kelola soal pilihan ganda yang dapat dipakai ulang di banyak tes.",
  },
  {
    href: "/admin/subtes",
    title: "Subtes",
    description: "Tentukan jenis subtes beserta kategori soal yang boleh mengisinya.",
  },
  {
    href: "/admin/tes",
    title: "Produk tes",
    description: "Susun subtes menjadi produk tes, atur durasi dan soalnya, lalu terbitkan.",
  },
];

/** Urutan penyusunan konten, supaya admin baru tahu harus mulai dari mana. */
const urutan = ["Kategori", "Soal", "Subtes", "Produk tes", "Terbitkan"];

export default async function AdminPage() {
  const admin = await requireAdmin();

  return (
    <AdminShell
      title="Ringkasan"
      description={`Masuk sebagai ${admin.username ?? admin.name}.`}
    >
      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="text-base">Alur penyusunan tes</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
            {urutan.map((langkah, i) => (
              <li key={langkah} className="flex items-center gap-2">
                <span className="bg-background rounded-md border px-2.5 py-1 font-medium">
                  {langkah}
                </span>
                {i < urutan.length - 1 && <span className="text-muted-foreground">→</span>}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="group">
            <Card className="hover:border-primary/40 h-full transition">
              <CardHeader>
                <CardTitle className="group-hover:text-primary text-base transition">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm leading-6">
                {item.description}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}

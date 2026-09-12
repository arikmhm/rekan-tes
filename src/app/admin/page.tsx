import type { Metadata } from "next";
import Link from "next/link";

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

export default async function AdminPage() {
  const admin = await requireAdmin();

  return (
    <AdminShell
      title="Panel admin"
      description={`Masuk sebagai ${admin.username ?? admin.name}. Katalog publik dibangun pada RT-007.`}
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-2xl border border-black/8 bg-white p-6 transition hover:border-brand/30"
            >
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}

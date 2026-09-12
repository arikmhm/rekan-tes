import type { Metadata } from "next";

import { requireAdmin } from "@/lib/authz";

export const metadata: Metadata = { title: "Admin" };

/**
 * Landing admin. Pengelolaan kategori dan bank soal dibangun pada RT-005.
 * Halaman ini menegakkan batas otorisasi di server sejak sekarang.
 */
export default async function AdminPage() {
  const admin = await requireAdmin();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Panel admin</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Masuk sebagai <strong className="text-ink">{admin.username ?? admin.name}</strong>.
        Pengelolaan kategori, bank soal, subtes, dan produk tes dibangun pada RT-005 dan RT-006.
      </p>
    </main>
  );
}

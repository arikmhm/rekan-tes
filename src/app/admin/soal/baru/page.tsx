import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { listCategories } from "@/lib/admin";

import { AdminShell, EmptyState } from "../../_components/shell";
import { PembuatSoal } from "../_components/pembuat-soal";

export const metadata: Metadata = { title: "Soal baru" };

export default async function SoalBaruPage() {
  const kategori = await listCategories();

  return (
    <AdminShell
      title="Soal baru"
      description="Impor sekumpulan soal dari JSON atau tulis sendiri, periksa semuanya di satu daftar, lalu simpan sekaligus."
      action={
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/soal" />}>
          Kembali ke bank soal
        </Button>
      }
    >
      {kategori.length === 0 ? (
        <EmptyState>Belum ada kategori. Buat kategori lebih dulu.</EmptyState>
      ) : (
        <PembuatSoal kategori={kategori} />
      )}
    </AdminShell>
  );
}

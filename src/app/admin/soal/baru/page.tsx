import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { listCategories } from "@/lib/admin";

import { AdminShell, EmptyState } from "../../_components/shell";
import { QuestionForm } from "../../_components/question-form";

export const metadata: Metadata = { title: "Soal baru" };

export default async function SoalBaruPage() {
  const kategori = await listCategories();

  return (
    <AdminShell
      title="Soal baru"
      description="Simpan sebagai draft kapan saja. Validasi kelengkapan berlaku saat status diubah ke published."
      action={
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/soal" />}>
          Kembali ke bank soal
        </Button>
      }
    >
      {kategori.length === 0 ? (
        <EmptyState>Belum ada kategori. Buat kategori lebih dulu.</EmptyState>
      ) : (
        <QuestionForm kategori={kategori} />
      )}
    </AdminShell>
  );
}

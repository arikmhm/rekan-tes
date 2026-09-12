import type { Metadata } from "next";

import { listCategories } from "@/lib/admin";

import { AdminShell } from "../../_components/shell";
import { QuestionForm } from "../../_components/question-form";

export const metadata: Metadata = { title: "Soal baru" };

export default async function SoalBaruPage() {
  const kategori = await listCategories();

  return (
    <AdminShell
      title="Soal baru"
      description="Simpan sebagai draft kapan saja. Validasi kelengkapan berlaku saat status diubah ke published."
    >
      {kategori.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-black/12 p-8 text-center text-sm text-muted">
          Belum ada kategori. Buat kategori lebih dulu.
        </p>
      ) : (
        <QuestionForm kategori={kategori} />
      )}
    </AdminShell>
  );
}

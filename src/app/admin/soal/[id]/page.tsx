import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getQuestion, listCategories } from "@/lib/admin";

import { AdminShell, StatusBadge } from "../../_components/shell";
import { QuestionForm } from "../../_components/question-form";

export const metadata: Metadata = { title: "Sunting soal" };

export default async function SoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [soal, kategori] = await Promise.all([getQuestion(id), listCategories()]);

  if (!soal) {
    notFound();
  }

  return (
    <AdminShell
      title="Sunting soal"
      description="Perubahan pada soal yang sudah dikerjakan dibatasi agar hasil attempt lama tetap sah."
      action={<StatusBadge status={soal.status} />}
    >
      <QuestionForm soal={soal} kategori={kategori} />
    </AdminShell>
  );
}

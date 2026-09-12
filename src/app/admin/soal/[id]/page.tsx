import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
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
      action={
        <div className="flex items-center gap-3">
          <StatusBadge status={soal.status} />
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/soal" />}>
            Kembali
          </Button>
        </div>
      }
    >
      <QuestionForm soal={soal} kategori={kategori} />
    </AdminShell>
  );
}

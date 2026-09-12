import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listCategories, listSubtests } from "@/lib/admin";

import { AdminShell, EmptyState } from "../_components/shell";
import { SubtestForm, SubtestRow } from "../_components/subtest-form";

export const metadata: Metadata = { title: "Subtes" };

export default async function SubtesPage() {
  const [kategori, subtes] = await Promise.all([listCategories(), listSubtests()]);

  return (
    <AdminShell
      title="Subtes"
      description="Subtes adalah jenis bagian tes beserta kategori soal utamanya. Satu subtes dapat dipakai di banyak produk tes dengan durasi dan jumlah soal berbeda."
    >
      {kategori.length === 0 ? (
        <EmptyState>Belum ada kategori. Buat kategori lebih dulu.</EmptyState>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tambah subtes</CardTitle>
          </CardHeader>
          <CardContent>
            <SubtestForm kategori={kategori} />
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-2.5">
        {subtes.map((s) => (
          <SubtestRow key={s.id} subtes={s} kategori={kategori} />
        ))}
      </div>

      {subtes.length === 0 && kategori.length > 0 && (
        <div className="mt-6">
          <EmptyState>Belum ada subtes. Tambahkan subtes pertama di formulir atas.</EmptyState>
        </div>
      )}
    </AdminShell>
  );
}

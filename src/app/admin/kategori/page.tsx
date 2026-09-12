import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listCategories } from "@/lib/admin";

import { CategoryForm, CategoryRow } from "../_components/category-form";
import { AdminShell, EmptyState } from "../_components/shell";

export const metadata: Metadata = { title: "Kategori soal" };

export default async function KategoriPage() {
  const kategori = await listCategories();

  return (
    <AdminShell
      title="Kategori soal"
      description="Kategori memfilter bank soal dan menentukan soal mana yang boleh masuk ke sebuah subtes."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-2.5">
        {kategori.map((k) => (
          <CategoryRow key={k.id} kategori={k} />
        ))}
      </div>

      {kategori.length === 0 && (
        <div className="mt-6">
          <EmptyState>Belum ada kategori. Tambahkan kategori pertama di formulir atas.</EmptyState>
        </div>
      )}
    </AdminShell>
  );
}

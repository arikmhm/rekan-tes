import type { Metadata } from "next";

import { listCategories } from "@/lib/admin";

import { CategoryForm, CategoryRow } from "../_components/category-form";
import { AdminShell } from "../_components/shell";

export const metadata: Metadata = { title: "Kategori soal" };

export default async function KategoriPage() {
  const kategori = await listCategories();

  return (
    <AdminShell
      title="Kategori soal"
      description="Kategori memfilter bank soal dan menentukan soal mana yang boleh masuk ke sebuah subtes."
    >
      <div className="rounded-2xl border border-black/8 bg-white p-6">
        <h2 className="font-semibold">Tambah kategori</h2>
        <div className="mt-4">
          <CategoryForm />
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {kategori.map((k) => (
          <li key={k.id}>
            <CategoryRow kategori={k} />
          </li>
        ))}
      </ul>

      {kategori.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-black/12 p-8 text-center text-sm text-muted">
          Belum ada kategori. Tambahkan kategori pertama di formulir atas.
        </p>
      )}
    </AdminShell>
  );
}

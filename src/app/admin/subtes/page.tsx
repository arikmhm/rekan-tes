import type { Metadata } from "next";

import { listCategories, listSubtests } from "@/lib/admin";

import { AdminShell } from "../_components/shell";
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
        <p className="rounded-2xl border border-dashed border-black/12 p-8 text-center text-sm text-muted">
          Belum ada kategori. Buat kategori lebih dulu.
        </p>
      ) : (
        <div className="rounded-2xl border border-black/8 bg-white p-6">
          <h2 className="font-semibold">Tambah subtes</h2>
          <div className="mt-4">
            <SubtestForm kategori={kategori} />
          </div>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {subtes.map((s) => (
          <li key={s.id}>
            <SubtestRow subtes={s} kategori={kategori} />
          </li>
        ))}
      </ul>

      {subtes.length === 0 && kategori.length > 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-black/12 p-8 text-center text-sm text-muted">
          Belum ada subtes. Tambahkan subtes pertama di formulir atas.
        </p>
      )}
    </AdminShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { buttonClass, fieldClass } from "@/app/_components/form";
import { listCategories, listQuestions } from "@/lib/admin";

import { AdminShell, StatusBadge } from "../_components/shell";

export const metadata: Metadata = { title: "Bank soal" };

/** Filter memakai form GET biasa, sehingga hasilnya bisa dibagikan lewat URL. */
export default async function SoalPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; status?: string; difficulty?: string; q?: string }>;
}) {
  const filter = await searchParams;
  const [kategori, soal] = await Promise.all([listCategories(), listQuestions(filter)]);

  return (
    <AdminShell
      title="Bank soal"
      description="Soal berdiri independen dari tes. Satu soal dapat dipakai di banyak tes tanpa diduplikasi."
      action={
        <Link href="/admin/soal/baru" className={buttonClass}>
          Soal baru
        </Link>
      }
    >
      <form method="get" className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-5">
        <label className="flex-1 min-w-45">
          <span className="text-xs font-semibold text-muted">Cari pertanyaan</span>
          <input name="q" defaultValue={filter.q ?? ""} className={fieldClass} />
        </label>
        <label>
          <span className="text-xs font-semibold text-muted">Kategori</span>
          <select name="categoryId" defaultValue={filter.categoryId ?? ""} className={fieldClass}>
            <option value="">Semua</option>
            {kategori.map((k) => (
              <option key={k.id} value={k.id}>
                {k.code}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-xs font-semibold text-muted">Status</span>
          <select name="status" defaultValue={filter.status ?? ""} className={fieldClass}>
            <option value="">Semua</option>
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </label>
        <label>
          <span className="text-xs font-semibold text-muted">Kesulitan</span>
          <select name="difficulty" defaultValue={filter.difficulty ?? ""} className={fieldClass}>
            <option value="">Semua</option>
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
        </label>
        <button type="submit" className={buttonClass}>
          Terapkan
        </button>
      </form>

      {soal.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-black/12 p-8 text-center text-sm text-muted">
          {kategori.length === 0
            ? "Buat kategori lebih dulu sebelum menambah soal."
            : "Tidak ada soal yang cocok dengan filter ini."}
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {soal.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/soal/${s.id}`}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/8 bg-white p-5 transition hover:border-brand/30"
              >
                <code className="rounded-lg bg-cream px-2 py-1 text-xs font-semibold">
                  {s.categoryCode}
                </code>
                <StatusBadge status={s.status} />
                <span className="text-xs text-muted">{s.difficulty}</span>
                <span className="w-full font-medium sm:w-auto sm:flex-1 sm:truncate">
                  {s.prompt}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}

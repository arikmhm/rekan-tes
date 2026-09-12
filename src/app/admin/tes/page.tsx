import type { Metadata } from "next";
import Link from "next/link";

import { listTests } from "@/lib/admin";
import { formatPrice } from "@/lib/format";

import { AdminShell, StatusBadge } from "../_components/shell";
import { TestForm } from "../_components/test-form";

export const metadata: Metadata = { title: "Produk tes" };

export default async function TesPage() {
  const tes = await listTests();

  return (
    <AdminShell
      title="Produk tes"
      description="Produk tes menyusun subtes menjadi satu simulasi yang dijual. Susunan subtes dan soalnya diatur pada halaman detail."
    >
      <div className="rounded-2xl border border-black/8 bg-white p-6">
        <h2 className="font-semibold">Tes baru</h2>
        <p className="mt-1 text-sm text-muted">
          Simpan sebagai draft dulu, lalu susun subtesnya sebelum menerbitkan.
        </p>
        <div className="mt-4">
          <TestForm />
        </div>
      </div>

      {tes.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-black/12 p-8 text-center text-sm text-muted">
          Belum ada produk tes.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {tes.map((t) => (
            <li key={t.id}>
              <Link
                href={`/admin/tes/${t.id}`}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/8 bg-white p-5 transition hover:border-brand/30"
              >
                <StatusBadge status={t.status} />
                <span className="font-medium">{t.name}</span>
                <code className="rounded-lg bg-cream px-2 py-1 text-xs">{t.slug}</code>
                <span className="text-sm text-muted">{formatPrice(t.priceAmount)}</span>
                <span className="text-xs text-muted">{t.subtestCount} subtes</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}

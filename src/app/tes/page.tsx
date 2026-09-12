import type { Metadata } from "next";
import Link from "next/link";

import { listPublishedTests } from "@/lib/catalog";
import { formatDuration, formatPrice } from "@/lib/format";

import { SiteShell } from "../_components/site-shell";

export const metadata: Metadata = {
  title: "Katalog simulasi",
  description: "Daftar simulasi tes kerja yang tersedia beserta subtes, durasi, dan harganya.",
};

// Katalog membaca database pada setiap permintaan. Tanpa ini halaman ikut
// ter-prerender saat build dan daftarnya membeku sampai deploy berikutnya.
export const dynamic = "force-dynamic";

export default async function KatalogPage() {
  const tes = await listPublishedTests();

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Katalog simulasi</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
          Setiap simulasi menampilkan subtes, jumlah soal, durasi, dan harga secara terbuka sebelum
          kamu membayar.
        </p>

        {tes.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-black/12 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">Belum ada simulasi yang terbit.</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
              Produk pertama sedang disusun. Simpan halaman ini dan periksa kembali nanti.
            </p>
          </div>
        ) : (
          <ul className="mt-12 grid gap-5 sm:grid-cols-2">
            {tes.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/tes/${t.slug}`}
                  className="flex h-full flex-col rounded-3xl border border-black/8 bg-white p-7 transition hover:border-brand/30"
                >
                  <h2 className="text-2xl font-semibold tracking-tight">{t.name}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{t.description}</p>

                  <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
                    <div className="rounded-2xl bg-cream p-3">
                      <dt className="text-xs text-muted">Subtes</dt>
                      <dd className="mt-1 font-semibold">{t.subtestCount}</dd>
                    </div>
                    <div className="rounded-2xl bg-cream p-3">
                      <dt className="text-xs text-muted">Soal</dt>
                      <dd className="mt-1 font-semibold">{t.questionCount}</dd>
                    </div>
                    <div className="rounded-2xl bg-cream p-3">
                      <dt className="text-xs text-muted">Durasi</dt>
                      <dd className="mt-1 font-semibold">{formatDuration(t.durationSeconds)}</dd>
                    </div>
                  </dl>

                  <p className="mt-6 text-xl font-semibold text-brand-dark">
                    {formatPrice(t.priceAmount)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SiteShell>
  );
}

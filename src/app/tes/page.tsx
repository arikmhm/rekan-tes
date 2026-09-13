import { ArrowRight } from "lucide-react";
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

const hairline = "border-[#105C78]/20";

export default async function KatalogPage() {
  const tes = await listPublishedTests();

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <h1 className="text-4xl font-bold tracking-[-0.02em] sm:text-5xl">Katalog simulasi</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
          Setiap simulasi menampilkan subtes, jumlah soal, durasi, dan harga secara terbuka sebelum
          kamu membayar.
        </p>

        {tes.length === 0 ? (
          <div className={`mt-12 rounded-md border border-dashed ${hairline} bg-white p-10 text-center`}>
            <h2 className="text-xl font-semibold">Belum ada simulasi yang terbit.</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Produk pertama sedang disusun. Simpan halaman ini dan periksa kembali nanti.
            </p>
          </div>
        ) : (
          <ul className="mt-12 grid gap-5 sm:grid-cols-2">
            {tes.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/tes/${t.slug}`}
                  className={`group flex h-full flex-col rounded-md border ${hairline} bg-white p-7 transition hover:border-brand`}
                >
                  <h2 className="text-2xl font-bold tracking-tight">{t.name}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{t.description}</p>

                  <dl className={`mt-6 grid grid-cols-3 divide-x ${hairline} border-t ${hairline} pt-3 text-sm`}>
                    <div className="pr-3">
                      <dt className="text-xs text-muted-foreground">Subtes</dt>
                      <dd className="mt-1 font-semibold">{t.subtestCount}</dd>
                    </div>
                    <div className="px-3">
                      <dt className="text-xs text-muted-foreground">Soal</dt>
                      <dd className="mt-1 font-semibold">{t.questionCount}</dd>
                    </div>
                    <div className="px-3">
                      <dt className="text-xs text-muted-foreground">Durasi</dt>
                      <dd className="mt-1 font-semibold">{formatDuration(t.durationSeconds)}</dd>
                    </div>
                  </dl>

                  <div className="mt-6 flex flex-1 items-end justify-between gap-3">
                    <p className="text-xl font-bold text-brand-orange">{formatPrice(t.priceAmount)}</p>
                    <ArrowRight
                      className="size-5 shrink-0 text-brand transition group-hover:translate-x-1"
                      aria-hidden
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SiteShell>
  );
}

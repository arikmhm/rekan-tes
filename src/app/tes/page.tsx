import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { listPublishedTests } from "@/lib/catalog";
import { formatDuration, formatPrice } from "@/lib/format";

import { SiteShell } from "../_components/site-shell";

export const metadata: Metadata = {
  title: "Katalog simulasi",
  description:
    "Daftar simulasi tes kerja yang tersedia beserta subtes, durasi, dan harganya.",
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
        <h1 className="max-w-2xl text-4xl leading-[1.2] font-medium tracking-[-0.01em] text-brand sm:text-5xl">
          Katalog simulasi
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 font-normal text-brand/80">
          Subtes, jumlah soal, durasi, dan harga terbuka sejak awal. Bayar
          sekali per simulasi, tanpa langganan.
        </p>
        {/* Pengunjung yang ragu bisa mencicipi dulu tanpa daftar; tautannya
            menunjuk simulasi percobaan di beranda. */}
        <Link
          href="/#coba"
          className="group mt-5 inline-flex items-center gap-2 text-sm font-normal text-brand transition-colors hover:text-brand-orange"
        >
          Coba dulu 10 soal gratis tanpa daftar
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </Link>

        {tes.length === 0 ? (
          <div
            className={`mt-12 rounded-[8px] border border-dashed ${hairline} bg-white p-10 text-center`}
          >
            <h2 className="text-xl font-medium text-brand">
              Belum ada simulasi yang terbit.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 font-normal text-brand/60">
              Produk pertama sedang disusun. Simpan halaman ini dan periksa
              kembali nanti.
            </p>
          </div>
        ) : (
          <ul className="mt-12 grid gap-5 sm:grid-cols-2">
            {tes.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/tes/${t.slug}`}
                  className={`group flex h-full flex-col rounded-[8px] border ${hairline} bg-white p-7 transition-colors hover:border-brand-orange`}
                >
                  <h2 className="text-2xl font-medium tracking-[-0.01em] text-brand">
                    {t.name}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 font-normal text-brand/70">
                    {t.description}
                  </p>

                  <dl
                    className={`mt-6 grid grid-cols-3 divide-x ${hairline} border-t ${hairline} pt-4 text-sm`}
                  >
                    {[
                      ["Subtes", t.subtestCount],
                      ["Soal", t.questionCount],
                      ["Durasi", formatDuration(t.durationSeconds)],
                    ].map(([label, nilai], i) => (
                      <div key={label} className={i === 0 ? "pr-3" : "px-3"}>
                        <dt className="text-xs font-normal text-brand/60">
                          {label}
                        </dt>
                        <dd className="mt-1 font-medium text-brand">{nilai}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-6 flex flex-1 items-end justify-between gap-3">
                    <div>
                      <p className="text-xl font-medium text-brand-orange">
                        {formatPrice(t.priceAmount)}
                      </p>
                      <p className="mt-0.5 text-xs font-normal text-brand/50">
                        sekali bayar
                      </p>
                    </div>
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand text-white transition-colors group-hover:bg-brand-orange">
                      <ArrowRight className="size-4" aria-hidden />
                    </span>
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

import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Clock,
  FileText,
  Layers,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  ACCESS_DAYS,
  JENIS,
  kelompokkanKatalog,
  listKatalog,
  type FaktaProduk,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

import { SiteShell } from "../_components/site-shell";

export const metadata: Metadata = {
  title: "Katalog",
  description:
    "Produk latihan yang tersedia beserta isi, durasi, dan harganya. Bayar satuan, tanpa langganan.",
};

// Katalog membaca database pada setiap permintaan. Tanpa ini halaman ikut
// ter-prerender saat build dan daftarnya membeku sampai deploy berikutnya.
export const dynamic = "force-dynamic";

const hairline = "border-[#105C78]/20";

// Empat label sudah cukup memberi gambaran isi produk; sisanya diringkas jadi
// satu chip agar kartu tidak berubah tinggi mengikuti jumlah labelnya.
const CHIP_TAMPIL = 4;

const IKON: Record<FaktaProduk["ikon"], typeof Layers> = {
  subtes: Layers,
  soal: FileText,
  durasi: Clock,
  akses: CalendarClock,
};

export default async function KatalogPage() {
  const produk = await listKatalog();
  const kelompok = kelompokkanKatalog(produk);

  return (
    <SiteShell>
      <div className="relative overflow-hidden">
        {/* Pola tipis hanya di kepala halaman, lalu lenyap sebelum daftar
            produknya — tekstur secukupnya, bukan latar yang ikut dibaca. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[url('/patterns/jigsaw.svg')] bg-repeat opacity-[0.04] mask-[linear-gradient(to_bottom,black,transparent)]"
        />

        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-orange/12 px-3 py-1.5 text-xs font-medium text-brand-orange">
            <BookOpen className="size-3.5" aria-hidden />
            {produk.length > 0
              ? `${produk.length} produk tersedia`
              : "Katalog sedang disusun"}
          </span>

          <h1 className="mt-5 max-w-2xl text-4xl leading-[1.15] font-medium tracking-[-0.01em] text-brand sm:text-5xl">
            Bahan latihan yang isinya terbuka sejak awal.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 font-normal text-brand/80">
            Semua dijual satuan: bayar sekali, akses {ACCESS_DAYS} hari, tanpa
            langganan. Rincian isi dan harganya terbaca penuh sebelum kamu
            memutuskan.
          </p>

          {kelompok.length === 0 ? (
            <div
              className={`mt-12 rounded-2xl border border-dashed ${hairline} bg-white p-10 text-center`}
            >
              <h2 className="text-xl font-medium text-brand">
                Belum ada produk yang terbit.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 font-normal text-brand/60">
                Produk pertama sedang disusun. Sementara menunggu, simulasi
                gratis sudah bisa dikerjakan.
              </p>
              <Link
                href="/simulasi"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
              >
                Coba simulasi gratis
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          ) : (
            kelompok.map(({ jenis, isi }) => (
              <section key={jenis} className="mt-12">
                <div
                  className={`flex items-baseline gap-3 border-b ${hairline} pb-3`}
                >
                  <h2 className="text-lg font-medium text-brand">
                    {JENIS[jenis].label}
                  </h2>
                  <p className="min-w-0 flex-1 truncate text-sm font-normal text-brand/60">
                    {JENIS[jenis].ringkas}
                  </p>
                  <span className="shrink-0 text-sm font-normal text-brand/50">
                    {isi.length}
                  </span>
                </div>

                <ul className="mt-5 grid gap-5 lg:grid-cols-2">
                  {isi.map((p) => (
                    <li key={p.slug} className="only:lg:col-span-2">
                      <Link
                        href={`/tes/${p.slug}`}
                        className={`group flex h-full flex-col overflow-hidden rounded-2xl border ${hairline} bg-white transition-all hover:-translate-y-0.5 hover:border-brand-orange hover:shadow-[0_10px_30px_rgba(16,92,120,0.10)]`}
                      >
                        {/* Pita tipis yang menyala saat kartu disorot: penanda
                            arah tanpa menambah teks ke dalam kartu. */}
                        <span
                          className="h-1 w-full bg-brand-orange/0 transition-colors group-hover:bg-brand-orange"
                          aria-hidden
                        />

                        <div className="flex flex-1 flex-col p-6 sm:p-7">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-2xl leading-snug font-medium tracking-[-0.01em] text-brand">
                              {p.nama}
                            </h3>
                            <div className="shrink-0 text-right">
                              <p className="text-xl font-medium text-brand-orange">
                                {formatPrice(p.harga)}
                              </p>
                              <p className="mt-0.5 text-xs font-normal text-brand/50">
                                sekali bayar
                              </p>
                            </div>
                          </div>

                          <p className="mt-3 line-clamp-2 text-sm leading-6 font-normal text-brand/70">
                            {p.deskripsi}
                          </p>

                          <ul className="mt-5 flex flex-wrap gap-1.5">
                            {p.label.slice(0, CHIP_TAMPIL).map((nama) => (
                              <li
                                key={nama}
                                className="rounded-full bg-cream px-2.5 py-1 text-xs font-normal text-brand"
                              >
                                {nama}
                              </li>
                            ))}
                            {p.label.length > CHIP_TAMPIL && (
                              <li className="rounded-full bg-cream px-2.5 py-1 text-xs font-normal text-brand/60">
                                +{p.label.length - CHIP_TAMPIL} lainnya
                              </li>
                            )}
                          </ul>

                          <div
                            className={`mt-auto flex flex-wrap items-center justify-between gap-4 border-t ${hairline} pt-5 text-sm`}
                          >
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-normal text-brand/70">
                              {p.fakta.map(({ ikon, teks }) => {
                                const Ikon = IKON[ikon];
                                return (
                                  <span
                                    key={teks}
                                    className="flex items-center gap-1.5"
                                  >
                                    <Ikon
                                      className="size-4 text-brand/40"
                                      aria-hidden
                                    />
                                    {teks}
                                  </span>
                                );
                              })}
                            </div>

                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors group-hover:text-brand-orange">
                              Lihat detail
                              <ArrowRight
                                className="size-4 transition-transform group-hover:translate-x-1"
                                aria-hidden
                              />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}

          {kelompok.length > 0 && (
            <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl bg-brand-orange/12 px-7 py-8 sm:flex-row sm:items-center sm:px-9">
              <div>
                <p className="text-lg font-medium text-brand">
                  Belum yakin yang mana?
                </p>
                <p className="mt-1.5 max-w-lg text-sm leading-6 font-normal text-brand/70">
                  Kerjakan simulasi gratis lebih dulu, lengkap dengan skor dan
                  pembahasannya. Tanpa daftar, tanpa bayar.
                </p>
              </div>
              <Link
                href="/simulasi"
                className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
              >
                Coba simulasi gratis
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}

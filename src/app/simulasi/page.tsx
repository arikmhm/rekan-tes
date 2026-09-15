import { ArrowRight, Clock, FileText, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "../_components/site-shell";

import { daftarSubtes, paketSimulasi } from "./data";

export const metadata: Metadata = {
  title: "Simulasi gratis",
  description:
    "Kerjakan simulasi tes kerja gratis tanpa daftar, lengkap dengan skor, peta kecepatan, dan pembahasan tiap soal.",
};

const hairline = "border-[#105C78]/20";

const menit = (detik: number) => `${Math.round(detik / 60)} menit`;

export default function SimulasiPage() {
  return (
    <SiteShell>
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="relative mx-auto w-full max-w-5xl flex-1 px-5 py-14 sm:px-8 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-orange/12 px-3 py-1.5 text-xs font-medium text-brand-orange">
            <Sparkles className="size-3.5" aria-hidden />
            Gratis, tanpa daftar
          </span>

          <h1 className="mt-5 max-w-2xl text-4xl leading-[1.15] font-medium tracking-[-0.01em] text-brand sm:text-5xl">
            Coba dulu simulasinya sebelum memutuskan.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 font-normal text-brand/80">
            Pilih satu paket, kerjakan sampai selesai, lalu lihat skor, peta
            kecepatan per soal, dan pembahasan tiap jawaban. Tidak perlu akun
            dan tidak ada yang disimpan.
          </p>

          <ul className="mt-12 space-y-4">
            {paketSimulasi.map((paket) => (
              <li key={paket.slug}>
                <Link
                  href={`/simulasi/${paket.slug}`}
                  className={`group flex flex-col gap-5 rounded-2xl border ${hairline} bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-orange hover:shadow-[0_10px_30px_rgba(16,92,120,0.10)] sm:flex-row sm:items-center sm:gap-7 sm:p-7`}
                >
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl leading-snug font-medium tracking-[-0.01em] text-brand">
                      {paket.nama}
                    </h2>
                    <p className="mt-2 text-sm leading-6 font-normal text-brand/70">
                      {paket.ringkas}
                    </p>

                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {daftarSubtes(paket).map((nama) => (
                        <li
                          key={nama}
                          className="rounded-full bg-cream px-2.5 py-1 text-xs font-normal text-brand"
                        >
                          {nama}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-normal text-brand/70">
                      <span className="flex items-center gap-1.5">
                        <FileText
                          className="size-4 text-brand/40"
                          aria-hidden
                        />
                        {paket.soal.length} soal
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-4 text-brand/40" aria-hidden />
                        {menit(paket.durasiDetik)}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-normal text-white transition-colors group-hover:bg-brand-orange">
                    Lihat detail
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl bg-cream px-7 py-8 sm:flex-row sm:items-center sm:px-9">
            <div>
              <p className="text-lg font-medium text-brand">
                Butuh yang sepanjang tes aslinya?
              </p>
              <p className="mt-1.5 max-w-lg text-sm leading-6 font-normal text-brand/70">
                Simulasi berbayar berisi seluruh subtes dengan jumlah soal dan
                durasi penuh, plus riwayat hasil yang tersimpan di akunmu.
              </p>
            </div>
            <Link
              href="/produk"
              className={`group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg border ${hairline} bg-white px-6 text-sm font-normal text-brand transition-colors hover:bg-brand hover:text-white`}
            >
              Lihat produk
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </div>

        {/* Pola yang sama dengan halaman produk dan beranda, duduk di kaki halaman. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[url('/patterns/endless-constellation.svg')] bg-repeat opacity-[0.07] mask-[linear-gradient(to_top,black,transparent)]"
        />
      </div>
    </SiteShell>
  );
}

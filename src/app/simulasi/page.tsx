import { ArrowRight, Clock, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "../_components/site-shell";

import { paketSimulasi } from "./data";

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
          <h1 className="max-w-2xl text-3xl leading-tight font-medium tracking-[-0.01em] text-brand sm:text-4xl">
            Coba dulu simulasinya sebelum memutuskan.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 font-normal text-brand/80">
            Kerjakan satu paket, lalu lihat skor dan pembahasannya. Gratis,
            tanpa akun.
          </p>

          <ul className="mt-10 grid gap-5 md:grid-cols-2">
            {paketSimulasi.map((paket) => (
              <li key={paket.slug}>
                <Link
                  href={`/simulasi/${paket.slug}`}
                  className={`flex h-full flex-col rounded-2xl border ${hairline} bg-white p-5 transition-colors hover:border-brand-orange`}
                >
                  <h2 className="mb-4 text-lg leading-snug font-medium text-brand">
                    {paket.nama}
                  </h2>

                  <div
                    className={`mt-auto flex flex-col gap-3 border-t ${hairline} pt-4`}
                  >
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-normal text-brand/60">
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
                    <p className="text-lg font-medium text-brand-orange">
                      Gratis
                    </p>
                  </div>
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
                Simulasi berbayar berisi subtes dan durasi penuh, hasilnya
                tersimpan di akunmu.
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

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[url('/patterns/endless-constellation.svg')] bg-repeat opacity-[0.07] mask-[linear-gradient(to_top,black,transparent)]"
        />
      </div>
    </SiteShell>
  );
}

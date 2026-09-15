import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EtalaseProduk } from "../_components/etalase-produk";
import { SiteShell } from "../_components/site-shell";
import { Spanduk } from "./_components/spanduk";

export const metadata: Metadata = {
  title: "Produk",
  description:
    "Produk latihan yang tersedia beserta isi dan harganya. Bayar satuan, tanpa langganan.",
};

// Daftar produk membaca database pada setiap permintaan. Tanpa ini halaman ikut
// ter-prerender saat build dan daftarnya membeku sampai deploy berikutnya.
export const dynamic = "force-dynamic";

export default async function ProdukPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string }>;
}) {
  return (
    <SiteShell>
      {/* Mengisi sisa tinggi layar lewat <main>, jadi halaman tetap menjejak
          penuh meski produknya baru sedikit dan pola di kakinya tidak
          terangkat ke tengah layar. */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="relative mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
          {/* Spanduk memegang kepala halaman, jadi judul teks tidak lagi
              diperlukan — dan sorotan bawaan etalase dimatikan supaya tidak
              jadi korsel kedua yang menempel tepat di bawah korsel pertama. */}
          <h1 className="sr-only">Produk</h1>
          <Spanduk />

          <EtalaseProduk
            jenis={(await searchParams).jenis}
            dasar="/produk"
            detail="/produk"
            sorotan={false}
          />

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
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
            >
              Coba simulasi gratis
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Pola ditaruh di kaki halaman: penutup yang terasa, bukan tekstur yang
            harus dilewati sebelum sampai ke daftar produknya. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[url('/patterns/endless-constellation.svg')] bg-repeat opacity-[0.07] mask-[linear-gradient(to_top,black,transparent)]"
        />
      </div>
    </SiteShell>
  );
}

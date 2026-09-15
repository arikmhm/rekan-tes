import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";

import { JENIS, listProduk, type JenisProduk } from "@/lib/produk";

import { KartuProduk } from "../_components/kartu-produk";
import { SiteShell } from "../_components/site-shell";

export const metadata: Metadata = {
  title: "Produk",
  description:
    "Produk latihan yang tersedia beserta isi dan harganya. Bayar satuan, tanpa langganan.",
};

// Daftar produk membaca database pada setiap permintaan. Tanpa ini halaman ikut
// ter-prerender saat build dan daftarnya membeku sampai deploy berikutnya.
export const dynamic = "force-dynamic";

const hairline = "border-[#105C78]/20";

const URUTAN_JENIS = Object.keys(JENIS) as JenisProduk[];

export default async function ProdukPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string }>;
}) {
  const produk = await listProduk();

  // Penyaring hidup di URL, bukan di state peramban: hasilnya bisa ditautkan,
  // dibuka di tab baru, dan tetap jalan tanpa JavaScript.
  const dipilih = (await searchParams).jenis;
  const aktif = URUTAN_JENIS.find((j) => j === dipilih) ?? null;
  const tampil = aktif ? produk.filter((p) => p.jenis === aktif) : produk;

  const saringan = [
    { kunci: null, label: "Semua", jumlah: produk.length },
    ...URUTAN_JENIS.map((j) => ({
      kunci: j,
      label: JENIS[j].label,
      jumlah: produk.filter((p) => p.jenis === j).length,
    })),
  ];

  return (
    <SiteShell>
      {/* Mengisi sisa tinggi layar lewat <main>, jadi halaman tetap menjejak
          penuh meski produknya baru sedikit dan pola di kakinya tidak
          terangkat ke tengah layar. */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="relative mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
          <h1 className="text-3xl font-medium tracking-[-0.01em] text-brand">
            Produk
          </h1>
          <div
            className={`mt-7 flex flex-wrap items-center gap-2 border-b ${hairline} pb-5`}
          >
            {saringan.map(({ kunci, label, jumlah }) => {
              const dipakai = kunci === aktif;

              return (
                <Fragment key={label}>
                  {/* Garis pemisah menandai batas antara "semua" dan penyaring
                      jenis produk. */}
                  {kunci === URUTAN_JENIS[0] && (
                    <span className="mx-1 h-5 w-px bg-brand/20" aria-hidden />
                  )}

                  <Link
                    href={kunci ? `/tes?jenis=${kunci}` : "/tes"}
                    aria-current={dipakai ? "page" : undefined}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-normal transition-colors ${
                      dipakai
                        ? "border-brand bg-brand text-white"
                        : `${hairline} bg-white text-brand hover:border-brand-orange`
                    }`}
                  >
                    {label}
                    <span
                      className={dipakai ? "text-white/60" : "text-brand/40"}
                    >
                      {jumlah}
                    </span>
                  </Link>
                </Fragment>
              );
            })}
          </div>

          {tampil.length === 0 ? (
            <div
              className={`mt-6 rounded-2xl border border-dashed ${hairline} bg-white p-10 text-center`}
            >
              <h2 className="text-lg font-medium text-brand">
                {aktif
                  ? `Belum ada produk ${JENIS[aktif].label.toLowerCase()}.`
                  : "Belum ada produk yang terbit."}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 font-normal text-brand/60">
                {aktif
                  ? JENIS[aktif].ringkas
                  : "Produk pertama sedang disusun. Sementara menunggu, simulasi gratis sudah bisa dikerjakan."}
              </p>
              <Link
                href={aktif ? "/tes" : "/simulasi"}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
              >
                {aktif ? "Lihat semua produk" : "Coba simulasi gratis"}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          ) : (
            <ul className="mt-6 grid gap-5 lg:grid-cols-2">
              {tampil.map((p) => (
                <li key={p.slug} className="only:lg:col-span-2">
                  <KartuProduk produk={p} href={`/tes/${p.slug}`} />
                </li>
              ))}
            </ul>
          )}

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

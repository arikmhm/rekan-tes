import {
  ArrowRight,
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
  listKatalog,
  type FaktaProduk,
  type JenisProduk,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

import { SiteShell } from "../_components/site-shell";

export const metadata: Metadata = {
  title: "Katalog",
  description:
    "Produk latihan yang tersedia beserta isi dan harganya. Bayar satuan, tanpa langganan.",
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

const URUTAN_JENIS = Object.keys(JENIS) as JenisProduk[];

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string }>;
}) {
  const produk = await listKatalog();

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
      <div className="relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <h1 className="text-3xl font-medium tracking-[-0.01em] text-brand">
            Katalog
          </h1>
          <p className="mt-2 text-sm leading-6 font-normal text-brand/60">
            Dijual satuan: bayar sekali, akses {ACCESS_DAYS} hari, tanpa
            langganan.
          </p>

          <div
            className={`mt-7 flex flex-wrap items-center gap-2 border-b ${hairline} pb-5`}
          >
            {saringan.map(({ kunci, label, jumlah }) => {
              const dipakai = kunci === aktif;

              return (
                <Link
                  key={label}
                  href={kunci ? `/tes?jenis=${kunci}` : "/tes"}
                  aria-current={dipakai ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-normal transition-colors ${
                    dipakai
                      ? "border-brand bg-brand text-white"
                      : `${hairline} bg-white text-brand hover:border-brand-orange`
                  }`}
                >
                  {label}
                  <span className={dipakai ? "text-white/60" : "text-brand/40"}>
                    {jumlah}
                  </span>
                </Link>
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
                  <Link
                    href={`/tes/${p.slug}`}
                    className={`group flex h-full flex-col rounded-2xl border ${hairline} bg-white p-6 transition-colors hover:border-brand-orange sm:p-7`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="inline-flex rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-brand/70">
                          {JENIS[p.jenis].label}
                        </span>
                        <h2 className="mt-3 text-2xl leading-snug font-medium tracking-[-0.01em] text-brand">
                          {p.nama}
                        </h2>
                      </div>
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

                      <span
                        className={`inline-flex h-9 items-center gap-1.5 rounded-lg border ${hairline} px-3.5 text-sm font-normal text-brand transition-colors group-hover:border-brand-orange group-hover:bg-brand-orange group-hover:text-white`}
                      >
                        Lihat detail
                        <ArrowRight className="size-4" aria-hidden />
                      </span>
                    </div>
                  </Link>
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
          className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-[url('/patterns/jigsaw.svg')] bg-repeat opacity-[0.05] mask-[linear-gradient(to_top,black,transparent)]"
        />
      </div>
    </SiteShell>
  );
}

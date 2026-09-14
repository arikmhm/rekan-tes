import { ArrowRight, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/authz";
import { JENIS, listKatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

import { KartuProduk } from "../_components/kartu-produk";
import { Korsel } from "./_components/carousel";

export const metadata: Metadata = { title: "Produk" };

// Katalog dibaca ulang tiap permintaan; tanpa ini daftarnya membeku sampai
// deploy berikutnya.
export const dynamic = "force-dynamic";

const hairline = "border-[#105C78]/20";

// Dua produk pertama ikut disorot di korsel. Lebih dari itu korsel berubah jadi
// daftar kedua, padahal daftar aslinya ada tepat di bawahnya.
const SOROTAN = 2;

const slide = "w-full shrink-0 snap-start sm:w-[calc(50%-0.5rem)]";

export default async function PesertaPage() {
  const user = await requireUser();
  const produk = await listKatalog();

  return (
    <div className="mx-auto w-full max-w-6xl p-4 pt-5 sm:p-6 sm:pt-6">
      {!user.emailVerified && (
        <Link
          href="/peserta/profil"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-brand-orange/30 bg-brand-orange/10 px-5 py-4 transition-colors hover:border-brand-orange"
        >
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0 text-brand-orange"
            aria-hidden
          />
          <p className="text-sm leading-6 font-normal text-brand">
            Email belum diverifikasi. Verifikasi dulu sebelum bisa membeli
            produk — kirim ulang tautannya dari halaman profil.
          </p>
        </Link>
      )}

      <Korsel>
        <article
          className={`${slide} relative overflow-hidden rounded-2xl bg-brand p-7 text-white`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[url('/patterns/endless-constellation.svg')] bg-repeat opacity-[0.18] mask-[linear-gradient(to_bottom,black,transparent)]"
          />
          <div className="relative flex h-full flex-col">
            <p className="text-xs font-medium text-brand-orange">Gratis</p>
            <h2 className="mt-2 text-2xl leading-snug font-medium tracking-[-0.01em]">
              Coba simulasi contoh sebelum membeli
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 font-normal text-white/70">
              Sepuluh soal, berwaktu, lengkap dengan skor dan pembahasannya.
            </p>
            <Link
              href="/simulasi"
              className="group mt-auto flex w-fit items-center gap-2 pt-6 text-sm font-normal text-white/90 transition-colors duration-300 ease-out hover:text-white"
            >
              Mulai simulasi gratis
              <ArrowRight
                className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </article>

        {produk.slice(0, SOROTAN).map((p) => (
          <article
            key={p.slug}
            className={`${slide} rounded-2xl bg-brand-orange/15 p-7`}
          >
            <div className="flex h-full flex-col">
              <p className="text-xs font-medium text-brand-orange">
                {JENIS[p.jenis].label}
              </p>
              <h2 className="mt-2 text-2xl leading-snug font-medium tracking-[-0.01em] text-brand">
                {p.nama}
              </h2>
              <p className="mt-2 line-clamp-2 max-w-sm text-sm leading-6 font-normal text-brand/70">
                {p.deskripsi}
              </p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
                <p className="text-lg font-medium text-brand-orange">
                  {formatPrice(p.harga)}
                </p>
                <Link
                  href={`/tes/${p.slug}`}
                  className="group flex items-center gap-2 text-sm font-normal text-brand transition-colors duration-300 ease-out hover:text-brand-orange"
                >
                  Lihat detail
                  <ArrowRight
                    className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </Korsel>

      {produk.length === 0 ? (
        <div
          className={`mt-8 rounded-2xl border border-dashed ${hairline} bg-white p-10 text-center`}
        >
          <h2 className="text-lg font-medium text-brand">
            Belum ada produk yang terbit.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 font-normal text-brand/60">
            Produk pertama sedang disusun. Sementara menunggu, simulasi gratis
            sudah bisa dikerjakan.
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
        <ul className="mt-8 grid gap-5 xl:grid-cols-2">
          {produk.map((p) => (
            <li key={p.slug} className="only:xl:col-span-2">
              <KartuProduk produk={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

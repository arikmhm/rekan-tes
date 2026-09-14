import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { JENIS, listKatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

import { KartuProduk } from "../../../_components/kartu-produk";
import {
  hitungJenis,
  SaringanJenis,
  URUTAN_JENIS,
} from "../../_components/saringan-jenis";
import { Korsel } from "./carousel";

const hairline = "border-[#105C78]/20";

// Tiga produk pertama disorot di korsel: dua muat sekaligus di layar lebar,
// jadi yang ketiga memberi korselnya sesuatu untuk digeser. Lebih dari itu ia
// berubah jadi daftar kedua, padahal daftar aslinya ada tepat di bawahnya.
const SOROTAN = 3;

const slide = "w-full shrink-0 snap-start sm:w-[calc(50%-0.5rem)]";

/**
 * Etalase produk: korsel sorotan, penyaring jenis, lalu daftarnya. Tinggal di
 * bawah produk/ bersama halaman detailnya, dan dipanggil halaman depan ruang
 * peserta — yang memang menampilkan etalase ini sebagai isi bawaannya.
 */
export async function DaftarProduk({ jenis }: { jenis?: string }) {
  const produk = await listKatalog();

  // Penyaring hidup di URL, sama seperti katalog publik: hasilnya bisa
  // ditautkan dan tetap jalan tanpa JavaScript.
  const aktif = URUTAN_JENIS.find((j) => j === jenis) ?? null;
  const tampil = aktif ? produk.filter((p) => p.jenis === aktif) : produk;

  return (
    <>
      {produk.length > 0 && (
        <Korsel>
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
                    href={`/peserta/produk/${p.slug}`}
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
      )}

      <SaringanJenis
        dasar="/peserta"
        aktif={aktif}
        jumlah={hitungJenis(produk)}
        total={produk.length}
      />

      {tampil.length === 0 ? (
        <div
          className={`mt-8 rounded-2xl border border-dashed ${hairline} bg-white p-10 text-center`}
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
            href={aktif ? "/peserta" : "/simulasi"}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
          >
            {aktif ? "Lihat semua produk" : "Coba simulasi gratis"}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      ) : (
        // Lebar kartu mengikuti ruang yang tersisa di sebelah sidebar, bukan
        // lebar jendela: begitu kolomnya muat 768px, daftar pecah jadi dua
        // supaya kartunya tidak melar selebar halaman.
        <div className="@container mt-6">
          <ul className="grid gap-5 @3xl:grid-cols-2">
            {tampil.map((p) => (
              <li key={p.slug}>
                <KartuProduk produk={p} href={`/peserta/produk/${p.slug}`} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

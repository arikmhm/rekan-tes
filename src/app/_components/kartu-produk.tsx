import {
  ArrowRight,
  CalendarClock,
  Clock,
  FileText,
  Layers,
} from "lucide-react";
import Link from "next/link";

import { JENIS, type FaktaProduk, type ProdukKatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

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

/**
 * Satu kartu katalog. Dipakai katalog publik maupun daftar produk di ruang
 * peserta — keduanya menampilkan produk yang sama, jadi tampilannya pun satu.
 */
export function KartuProduk({ produk }: { produk: ProdukKatalog }) {
  return (
    <Link
      href={`/tes/${produk.slug}`}
      className={`group flex h-full flex-col rounded-2xl border ${hairline} bg-white p-6 transition-colors hover:border-brand-orange sm:p-7`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-brand/70">
            {JENIS[produk.jenis].label}
          </span>
          <h2 className="mt-3 text-2xl leading-snug font-medium tracking-[-0.01em] text-brand">
            {produk.nama}
          </h2>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-medium text-brand-orange">
            {formatPrice(produk.harga)}
          </p>
          <p className="mt-0.5 text-xs font-normal text-brand/50">
            sekali bayar
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 font-normal text-brand/70">
        {produk.deskripsi}
      </p>

      <ul className="mt-5 flex flex-wrap gap-1.5">
        {produk.label.slice(0, CHIP_TAMPIL).map((nama) => (
          <li
            key={nama}
            className="rounded-full bg-cream px-2.5 py-1 text-xs font-normal text-brand"
          >
            {nama}
          </li>
        ))}
        {produk.label.length > CHIP_TAMPIL && (
          <li className="rounded-full bg-cream px-2.5 py-1 text-xs font-normal text-brand/60">
            +{produk.label.length - CHIP_TAMPIL} lainnya
          </li>
        )}
      </ul>

      <div
        className={`mt-auto flex flex-wrap items-center justify-between gap-4 border-t ${hairline} pt-5 text-sm`}
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-normal text-brand/70">
          {produk.fakta.map(({ ikon, teks }) => {
            const Ikon = IKON[ikon];
            return (
              <span key={teks} className="flex items-center gap-1.5">
                <Ikon className="size-4 text-brand/40" aria-hidden />
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
  );
}

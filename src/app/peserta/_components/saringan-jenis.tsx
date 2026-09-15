import Link from "next/link";
import { Fragment } from "react";

import { JENIS, type JenisProduk } from "@/lib/produk";

const hairline = "border-[#105C78]/20";

export const URUTAN_JENIS = Object.keys(JENIS) as JenisProduk[];

/**
 * Penyaring jenis produk. Dipakai etalase maupun pustaka: keduanya menyaring
 * hal yang sama, jadi penyaringnya pun satu — tinggal berbeda halaman tujuan
 * dan angka yang dihitung pemanggilnya.
 */
export function SaringanJenis({
  dasar,
  aktif,
  jumlah,
  total,
}: {
  /** Halaman tempat penyaring ini tinggal, tanpa query. */
  dasar: string;
  aktif: JenisProduk | null;
  jumlah: Record<JenisProduk, number>;
  total: number;
}) {
  const saringan = [
    { kunci: null, label: "Semua", angka: total },
    ...URUTAN_JENIS.map((j) => ({
      kunci: j,
      label: JENIS[j].label,
      angka: jumlah[j],
    })),
  ];

  return (
    <div
      className={`mt-8 flex flex-wrap items-center gap-2 border-b ${hairline} pb-5`}
    >
      {saringan.map(({ kunci, label, angka }) => {
        const dipakai = kunci === aktif;

        return (
          <Fragment key={label}>
            {/* Garis pemisah menandai batas antara "semua" dan penyaring
                jenis produk. */}
            {kunci === URUTAN_JENIS[0] && (
              <span className="mx-1 h-5 w-px bg-brand/20" aria-hidden />
            )}

            <Link
              href={kunci ? `${dasar}?jenis=${kunci}` : dasar}
              aria-current={dipakai ? "page" : undefined}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-normal transition-colors ${
                dipakai
                  ? "border-brand bg-brand text-white"
                  : `${hairline} bg-white text-brand hover:border-brand-orange`
              }`}
            >
              {label}
              <span className={dipakai ? "text-white/60" : "text-brand/40"}>
                {angka}
              </span>
            </Link>
          </Fragment>
        );
      })}
    </div>
  );
}

/** Menghitung isi tiap jenis dari daftar apa pun yang punya kolom `jenis`. */
export function hitungJenis(daftar: { jenis: JenisProduk }[]) {
  return Object.fromEntries(
    URUTAN_JENIS.map((j) => [j, daftar.filter((x) => x.jenis === j).length]),
  ) as Record<JenisProduk, number>;
}

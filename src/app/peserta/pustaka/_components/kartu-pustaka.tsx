import { ArrowRight, CalendarClock, Gauge, PlayCircle } from "lucide-react";
import Link from "next/link";

import { JENIS, type JenisProduk } from "@/lib/produk";

import {
  LABEL_ATTEMPT,
  selesai,
  tanggalSingkat,
} from "../../_components/label";

const hairline = "border-[#105C78]/20";

export type MilikPeserta = {
  orderId: string;
  jenis: JenisProduk;
  nama: string;
  attemptId: string | null;
  attemptStatus: string | null;
  attemptScore: number | null;
  accessExpiresAt: Date | null;
};

/**
 * Satu produk milik peserta. Anatominya sengaja sama dengan kartu etalase —
 * chip jenis, judul, fakta berikon, lalu baris aksi di kaki kartu — supaya
 * berpindah dari etalase ke pustaka tidak terasa berpindah aplikasi. Yang
 * berbeda hanya isinya: bukan harga dan isi paket, melainkan keadaan
 * pengerjaan.
 */
export function KartuPustaka({ milik }: { milik: MilikPeserta }) {
  const rampung = selesai(milik.attemptStatus);
  const tujuan = milik.attemptId
    ? rampung
      ? `/peserta/simulasi/${milik.attemptId}/hasil`
      : `/peserta/simulasi/${milik.attemptId}`
    : `/peserta/pesanan/${milik.orderId}`;

  const fakta = [
    {
      Ikon: PlayCircle,
      teks:
        LABEL_ATTEMPT[milik.attemptStatus ?? "not_started"] ??
        milik.attemptStatus ??
        "Belum dikerjakan",
    },
    ...(milik.attemptScore != null
      ? [{ Ikon: Gauge, teks: `Skor ${milik.attemptScore}` }]
      : []),
    ...(milik.accessExpiresAt
      ? [
          {
            Ikon: CalendarClock,
            teks: `Akses sampai ${tanggalSingkat.format(milik.accessExpiresAt)}`,
          },
        ]
      : []),
  ];

  return (
    <div
      className={`group relative flex h-full flex-col rounded-2xl border ${hairline} bg-white p-6 transition-colors hover:border-brand-orange sm:p-7`}
    >
      <span className="inline-flex w-fit rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-brand/70">
        {JENIS[milik.jenis].label}
      </span>

      {/* Tautan utama menutupi seluruh kartu lewat ::after, jadi kartunya bisa
          diklik di mana saja tanpa menyarangkan tautan di dalam tautan —
          "Rincian pesanan" tetap jadi tautan tersendiri di atasnya. */}
      <h2 className="mt-3 text-2xl leading-snug font-medium tracking-[-0.01em] text-brand">
        <Link href={tujuan} className="after:absolute after:inset-0">
          {milik.nama}
        </Link>
      </h2>

      <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-normal text-brand/70">
        {fakta.map(({ Ikon, teks }) => (
          <li key={teks} className="flex items-center gap-1.5">
            <Ikon className="size-4 text-brand/40" aria-hidden />
            {teks}
          </li>
        ))}
      </ul>

      <div
        className={`mt-auto flex flex-wrap items-center justify-between gap-4 border-t ${hairline} pt-5 text-sm`}
      >
        <Link
          href={`/peserta/pesanan/${milik.orderId}`}
          className="relative font-normal text-brand/60 transition-colors hover:text-brand-orange"
        >
          Rincian pesanan
        </Link>

        <span
          className={`inline-flex h-9 items-center gap-1.5 rounded-lg border ${hairline} px-3.5 text-sm font-normal text-brand transition-colors group-hover:border-brand-orange group-hover:bg-brand-orange group-hover:text-white`}
        >
          {milik.attemptId
            ? rampung
              ? "Lihat hasil"
              : "Kerjakan"
            : "Lihat pesanan"}
          <ArrowRight className="size-4" aria-hidden />
        </span>
      </div>
    </div>
  );
}

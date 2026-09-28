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

/** Anatominya sengaja sama dengan kartu produk. */
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
    <Link
      href={tujuan}
      className={`flex h-full flex-col rounded-2xl border ${hairline} bg-white p-5 transition-colors hover:border-brand-orange`}
    >
      <span className="w-fit rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-brand/70">
        {JENIS[milik.jenis].label}
      </span>

      <h2 className="mt-3 mb-4 text-lg leading-snug font-medium text-brand">
        {milik.nama}
      </h2>

      <div className={`mt-auto flex flex-col gap-3 border-t ${hairline} pt-4`}>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-normal text-brand/60">
          {fakta.map(({ Ikon, teks }) => (
            <span key={teks} className="flex items-center gap-1.5">
              <Ikon className="size-4 text-brand/40" aria-hidden />
              {teks}
            </span>
          ))}
        </div>
        <p className="flex items-center gap-1.5 text-lg font-medium text-brand-orange">
          {milik.attemptId
            ? rampung
              ? "Lihat hasil"
              : "Kerjakan"
            : "Lihat pesanan"}
          <ArrowRight className="size-4" aria-hidden />
        </p>
      </div>
    </Link>
  );
}

"use client";

import type { Award } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const hairline = "border-[#105C78]/20";

/**
 * Perkakas layar hasil yang dipakai bersama simulasi percobaan dan sesi
 * berbayar. Keduanya menjawab pertanyaan yang sama dan karena itu harus
 * tampil sama; menyalin markupnya dua kali berarti keduanya pelan-pelan
 * berbeda sendiri.
 */

/** Kartu hasil: judul kecil berikon di atas, isi bebas di bawahnya. */
export function Kartu({
  judul,
  Ikon,
  tanda,
  kelas = "",
  children,
}: {
  judul: string;
  Ikon: typeof Award;
  tanda?: string;
  /** Rentang kolom atau perataan tambahan saat kartu duduk di dalam grid. */
  kelas?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border ${hairline} bg-white p-5 sm:p-6 ${kelas}`}
    >
      <div
        className={`flex items-center justify-between gap-3 border-b ${hairline} pb-4`}
      >
        <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-brand">
          <Ikon className="size-4 shrink-0 text-brand-orange" aria-hidden />
          <span className="truncate">{judul}</span>
        </p>
        {tanda && (
          <span className="shrink-0 rounded-full bg-cream px-2.5 py-1 font-mono text-[11px] font-medium text-brand/70">
            {tanda}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/** Cincin akurasi. Angkanya tetap tertulis, jadi bukan cuma bentuk. */
export function Donat({
  persen,
  angka,
  dari,
}: {
  persen: number;
  angka: number;
  dari: number;
}) {
  const r = 52;
  const keliling = 2 * Math.PI * r;

  return (
    <div className="relative grid size-36 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute size-36 -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          className="stroke-brand/10"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(persen / 100) * keliling} ${keliling}`}
          className="stroke-brand-orange"
        />
      </svg>
      <div className="text-center">
        <p className="text-3xl font-medium text-brand">{persen}%</p>
        <p className="mt-0.5 text-xs font-normal text-brand/60">
          {angka} dari {dari}
        </p>
      </div>
    </div>
  );
}

const konfigSebaran = {
  nilai: { label: "Skor", color: "var(--color-brand-orange)" },
} satisfies ChartConfig;

/**
 * Sebaran nilai per subtes dalam bentuk radar: bagian mana yang sudah aman,
 * bagian mana yang perlu dikejar. Datanya disiapkan pemanggil karena sumbernya
 * berbeda — percobaan menghitung dari jawaban di memori, sesi berbayar dari
 * skor yang dibekukan saat subtes ditutup.
 */
export function Sebaran({
  data,
  keterangan = "Persentase jawaban benar di tiap subtes.",
}: {
  data: { subtes: string; nilai: number }[];
  keterangan?: string;
}) {
  return (
    <>
      <ChartContainer
        config={konfigSebaran}
        className="mx-auto mt-4 aspect-square w-full max-w-72"
      >
        <RadarChart data={data} outerRadius="68%">
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel={false} />}
          />
          <PolarGrid stroke="var(--color-brand)" strokeOpacity={0.2} />
          <PolarAngleAxis
            dataKey="subtes"
            tick={{ fill: "var(--color-brand)", fontSize: 11 }}
          />
          <Radar
            dataKey="nilai"
            // Animasi masuk recharts tidak pernah berjalan di dalam lapisan
            // layar penuh ini dan meninggalkan poligon yang menciut di titik
            // pusat — grafiknya jadi kosong. Digambar langsung di posisi akhir.
            isAnimationActive={false}
            fill="var(--color-nilai)"
            fillOpacity={0.45}
            stroke="var(--color-nilai)"
            strokeWidth={2}
          />
        </RadarChart>
      </ChartContainer>
      <p className="text-center text-xs font-normal text-brand/60">
        {keterangan}
      </p>
    </>
  );
}

/** mm:ss untuk durasi yang masih di bawah satu jam, jam:mm:ss di atasnya. */
export function menitDetik(detik: number) {
  const jam = Math.floor(detik / 3600);
  const menit = Math.floor(detik / 60) % 60;
  const sisa = detik % 60;
  const dua = (n: number) => String(n).padStart(2, "0");

  return jam > 0
    ? `${jam}:${dua(menit)}:${dua(sisa)}`
    : `${dua(menit)}:${dua(sisa)}`;
}

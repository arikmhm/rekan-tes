"use client";

import type { Award } from "lucide-react";

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
  kecil = false,
}: {
  persen: number;
  angka: number;
  dari: number;
  /** Cincin ringkas untuk sebaran subtes: hanya persennya yang muat di dalam. */
  kecil?: boolean;
}) {
  const r = 52;
  const keliling = 2 * Math.PI * r;
  const ukuran = kecil ? "size-24" : "size-36";

  return (
    <div className={`relative grid ${ukuran} place-items-center`}>
      <svg viewBox="0 0 120 120" className={`absolute ${ukuran} -rotate-90`}>
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
        <p
          className={`font-medium text-brand ${kecil ? "text-lg" : "text-3xl"}`}
        >
          {persen}%
        </p>
        {!kecil && (
          <p className="mt-0.5 text-xs font-normal text-brand/60">
            {angka} dari {dari}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Sebaran nilai per subtes: satu cincin untuk tiap subtes, sama seperti cincin
 * akurasi di kartu utama — hanya saja di sini angkanya dipecah per subtes.
 *
 * Dulu radar. Radar butuh minimal tiga sumbu untuk membentuk bidang, jadi tes
 * dua subtes hanya menghasilkan satu garis lurus, dan label sumbunya terlalu
 * sempit untuk nama subtes yang mirip. Cincin terbaca sama jelasnya pada dua
 * subtes maupun enam.
 */
export function Sebaran({
  data,
  keterangan = "Persentase jawaban benar di tiap subtes.",
}: {
  data: { subtes: string; nilai: number; benar: number; total: number }[];
  keterangan?: string;
}) {
  return (
    <>
      <ul className="mt-4 space-y-3">
        {data.map((d) => (
          <li key={d.subtes} className="flex items-center gap-4">
            <Donat kecil persen={d.nilai} angka={d.benar} dari={d.total} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-brand" title={d.subtes}>
                {d.subtes}
              </p>
              <p className="mt-0.5 text-xs font-normal text-brand/60">
                {d.benar} benar dari {d.total} soal
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-center text-xs font-normal text-brand/60">
        {keterangan}
      </p>
    </>
  );
}

/**
 * Pemakaian waktu tiap subtes. Kartu waktu hanya bicara soal waktu — benar dan
 * salahnya sudah punya kartunya sendiri — jadi yang dibandingkan di sini adalah
 * waktu terpakai terhadap jatahnya, bukan terhadap jumlah soal.
 *
 * `jatah` boleh kosong: simulasi percobaan memakai satu jatah untuk seluruh
 * sesi, jadi batangnya dibandingkan terhadap subtes yang paling lama.
 */
export function WaktuSubtes({
  data,
}: {
  data: { nama: string; detik: number | null; jatah?: number }[];
}) {
  const puncak = Math.max(1, ...data.map((d) => d.jatah ?? d.detik ?? 0));

  return (
    <ul className="mt-5 space-y-3">
      {data.map((d) => {
        const dasar = d.jatah ?? puncak;
        const lebar =
          d.detik === null ? 0 : Math.min(100, Math.round((d.detik / dasar) * 100));

        return (
          <li key={d.nama}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-xs font-normal text-brand/70">
                {d.nama}
              </p>
              <p className="shrink-0 font-mono text-xs font-medium tabular-nums text-brand">
                {d.detik === null ? "—" : menitDetik(d.detik)}
                {d.jatah !== undefined && (
                  <span className="font-normal text-brand/50">
                    {" / "}
                    {menitDetik(d.jatah)}
                  </span>
                )}
              </p>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand/10">
              <div
                className="h-full rounded-full bg-brand-orange"
                style={{ width: `${lebar}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
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

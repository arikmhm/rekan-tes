"use client";

import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Expand,
  RotateCcw,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const hairline = "border-[#105C78]/20";

const DURASI = 600; // 10 menit untuk 10 soal, seritme subtes sungguhan.

const soal = [
  {
    subtes: "Numerik",
    singkat: "Numerik",
    prompt:
      "Sebuah nasabah menabung Rp8.000.000 dengan bunga tunggal 6% per tahun. Berapa saldonya setelah 9 bulan?",
    opsi: ["Rp8.240.000", "Rp8.360.000", "Rp8.480.000", "Rp8.720.000"],
    kunci: 1,
    pembahasan:
      "Bunga setahun 6% × 8.000.000 = 480.000. Untuk 9 bulan: 9/12 × 480.000 = 360.000. Saldo = 8.000.000 + 360.000 = Rp8.360.000.",
  },
  {
    subtes: "Verbal",
    singkat: "Verbal",
    prompt: "SANKSI : PELANGGARAN = ... : ...",
    opsi: [
      "Hadiah : Prestasi",
      "Denda : Pajak",
      "Nilai : Ujian",
      "Obat : Dokter",
    ],
    kunci: 0,
    pembahasan:
      "Sanksi adalah konsekuensi yang diberikan atas pelanggaran. Pola yang sama ada pada hadiah sebagai konsekuensi atas prestasi. Pilihan lain bukan hubungan konsekuensi.",
  },
  {
    subtes: "Logika & Figural",
    singkat: "Logika",
    prompt:
      "Semua teller wajib mengikuti pelatihan APU-PPT. Sebagian peserta pelatihan APU-PPT berasal dari kantor pusat. Kesimpulan yang pasti benar:",
    opsi: [
      "Semua teller berasal dari kantor pusat.",
      "Sebagian teller berasal dari kantor pusat.",
      "Semua teller mengikuti pelatihan APU-PPT.",
      "Tidak ada teller di kantor pusat.",
    ],
    kunci: 2,
    pembahasan:
      "Hanya premis pertama yang bisa disimpulkan ulang secara pasti. Kata 'sebagian' pada premis kedua tidak memberi kepastian apa pun tentang asal kantor para teller.",
  },
  {
    subtes: "Ketelitian",
    singkat: "Ketelitian",
    prompt: "Pasangan nomor rekening berikut mana yang TIDAK identik?",
    opsi: [
      "8820-4471-9036  |  8820-4471-9036",
      "1907-3358-2214  |  1907-3358-2214",
      "5043-6619-7782  |  5043-6691-7782",
      "3376-9028-4415  |  3376-9028-4415",
    ],
    kunci: 2,
    pembahasan:
      "Pada pilihan C blok tengah berbeda: 6619 pada kolom kiri menjadi 6691 pada kolom kanan. Pasangan lainnya sama persis digit per digit.",
  },
  {
    subtes: "Bahasa Inggris",
    singkat: "Inggris",
    prompt:
      "The bank ____ its new mobile app three months ago, and customer complaints have dropped since then.",
    opsi: ["has launched", "launched", "launches", "was launching"],
    kunci: 1,
    pembahasan:
      "Keterangan waktu 'three months ago' menunjuk titik waktu lampau yang selesai, jadi yang dipakai simple past: launched. Present perfect tidak dipakai bersama keterangan waktu lampau yang spesifik.",
  },
  {
    subtes: "Numerik",
    singkat: "Numerik",
    prompt:
      "Sebuah cabang menyalurkan kredit Rp450 juta pada Januari dan Rp540 juta pada Februari. Berapa persen kenaikannya?",
    opsi: ["16%", "18%", "20%", "24%"],
    kunci: 2,
    pembahasan:
      "Kenaikannya 540 − 450 = 90 juta. Dibandingkan angka Januari: 90/450 = 0,2 alias 20%. Pembaginya selalu angka periode awal, bukan periode akhir.",
  },
  {
    subtes: "Verbal",
    singkat: "Verbal",
    prompt: 'Kata yang paling berlawanan makna dengan "likuid" adalah?',
    opsi: ["Lancar", "Beku", "Tunai", "Encer"],
    kunci: 1,
    pembahasan:
      "Dalam konteks keuangan, likuid berarti mudah dicairkan. Lawannya beku: dana yang tidak bisa ditarik atau dipakai. Lancar dan tunai justru searti, encer hanya makna harfiahnya.",
  },
  {
    subtes: "Logika & Figural",
    singkat: "Logika",
    prompt: "Lanjutan deret 3, 6, 11, 18, 27, ... adalah?",
    opsi: ["34", "36", "38", "40"],
    kunci: 2,
    pembahasan:
      "Selisih antarsuku naik sebagai bilangan ganjil: 3, 5, 7, 9. Selisih berikutnya 11, jadi 27 + 11 = 38.",
  },
  {
    subtes: "Ketelitian",
    singkat: "Ketelitian",
    prompt: "Mana pasangan nama dan NIK yang penulisannya TIDAK sama persis?",
    opsi: [
      "RAHMAWATI DEWI · 3174026109910004",
      "BAGUS PRASETYO · 3275011204880012",
      "SITI NURHALIZA · 3671054503950007",
      "ANDI SAPUTRA · 7371060810920031",
    ],
    kunci: 1,
    pembahasan:
      "Pada pilihan B nama tertulis BAGUS PRASETYO sementara pasangan datanya BAGUS PRASTEYO — huruf T dan E tertukar. Sisanya sama persis.",
  },
  {
    subtes: "Bahasa Inggris",
    singkat: "Inggris",
    prompt:
      "Please make sure the report is submitted ____ Friday, otherwise the audit team cannot review it.",
    opsi: ["until", "since", "by", "during"],
    kunci: 2,
    pembahasan:
      "'By' menandai batas waktu paling lambat sebuah pekerjaan selesai. 'Until' dipakai untuk keadaan yang berlangsung sampai satu titik, bukan tenggat penyerahan.",
  },
];

const HURUF = ["A", "B", "C", "D"];

/**
 * Simulasi coba-coba untuk pengunjung anonim: lima soal, bisa dikerjakan sampai
 * "dikirim", lalu hasil dan pembahasannya tampil. Semua state hidup di memori
 * peramban — tidak ada attempt, tidak ada jawaban tersimpan, tidak ada apa pun
 * yang menyentuh basis data.
 *
 * Di halaman, komponen ini cuma tampil sebagai potongan gambar produk; sesi
 * baru benar-benar berjalan setelah pengunjung membukanya ke layar penuh.
 */
export function TestPreview() {
  const wadah = useRef<HTMLDivElement>(null);
  const [terbuka, setTerbuka] = useState(false);

  function buka() {
    setTerbuka(true);
    // Fullscreen asli kalau peramban mengizinkan. Kalau ditolak (Safari iOS,
    // izin dicabut), lapisan fixed di bawah tetap menutupi layar, jadi hasil
    // yang dilihat pengunjung sama saja.
    wadah.current?.requestFullscreen?.().catch(() => {});
  }

  function tutup() {
    setTerbuka(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }

  // Keluar dari fullscreen lewat Esc atau tombol peramban harus ikut menutup
  // lapisannya, bukan meninggalkan overlay yang menggantung di layar.
  useEffect(() => {
    const sinkron = () => {
      if (!document.fullscreenElement) setTerbuka(false);
    };
    document.addEventListener("fullscreenchange", sinkron);
    return () => document.removeEventListener("fullscreenchange", sinkron);
  }, []);

  // Esc tetap harus menutup meski fullscreen aslinya tidak pernah aktif.
  useEffect(() => {
    if (!terbuka) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setTerbuka(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [terbuka]);

  return (
    <div ref={wadah}>
      <div
        className={`relative mx-auto max-w-6xl overflow-hidden rounded-2xl border ${hairline} bg-white`}
      >
        <div className="flex items-start justify-between gap-6 px-6 pt-7 sm:px-9 sm:pt-9">
          <h2 className="max-w-md text-2xl leading-tight font-medium tracking-[-0.01em] text-brand sm:text-3xl">
            Coba sepuluh soal simulasinya sekarang — tanpa daftar.
          </h2>
          <span
            aria-hidden
            className={`grid size-11 shrink-0 place-items-center rounded-xl border ${hairline} bg-white text-brand transition-colors group-hover:border-brand-orange group-hover:bg-brand-orange group-hover:text-white`}
          >
            <Expand className="size-4.5" />
          </span>
        </div>

        {/* Potongan produk: kartu sesinya sengaja lebih lebar dari wadahnya dan
            terpotong di kanan, supaya jelas ini cuplikan, bukan tesnya sendiri. */}
        <div className="mt-8 h-64 overflow-hidden pl-6 sm:h-88 sm:pl-9">
          <div className="h-full rounded-tl-2xl bg-brand-orange/15 pt-7 pl-7">
            <div
              inert
              className="pointer-events-none w-280 max-w-none select-none"
            >
              <Sesi statis />
            </div>
          </div>
        </div>

        {/* Seluruh kartu jadi satu tombol: ikon di pojok adalah petunjuk
            visualnya, tapi klik di mana pun tetap membuka sesinya. */}
        <button
          type="button"
          onClick={buka}
          className="group absolute inset-0 cursor-pointer rounded-2xl focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:outline-none"
        >
          <span className="sr-only">Buka simulasi percobaan layar penuh</span>
        </button>
      </div>

      {terbuka && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-cream">
          <Sesi onTutup={tutup} />
        </div>
      )}
    </div>
  );
}

/** Sesi percobaannya sendiri. `statis` dipakai untuk cuplikan di kartu. */
function Sesi({ statis, onTutup }: { statis?: boolean; onTutup?: () => void }) {
  const [nomor, setNomor] = useState(0);
  const [jawaban, setJawaban] = useState<(number | null)[]>(() =>
    Array(soal.length).fill(null),
  );
  const [dikirim, setDikirim] = useState(false);
  const [sisa, setSisa] = useState(DURASI);

  // Waktu habis mengunci sesi sama seperti pengerjaan sungguhan, jadi statusnya
  // diturunkan dari sisa waktu — bukan disalin ke state lain lewat efek.
  const selesai = dikirim || sisa === 0;

  useEffect(() => {
    if (statis || selesai) return;
    const tik = setInterval(() => setSisa((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(tik);
  }, [statis, selesai]);

  function pilih(i: number) {
    setJawaban((j) => j.map((v, k) => (k === nomor ? i : v)));
  }

  function ulangi() {
    setJawaban(Array(soal.length).fill(null));
    setNomor(0);
    setSisa(DURASI);
    setDikirim(false);
  }

  const benar = jawaban.filter((j, i) => j === soal[i].kunci).length;
  const kosong = jawaban.filter((j) => j === null).length;
  const s = soal[nomor];

  return (
    <div
      className={`flex min-h-full flex-col px-5 py-6 sm:px-8 sm:py-8 ${
        statis ? "w-full" : "mx-auto w-full max-w-6xl"
      }`}
    >
      <div
        className={`mb-4 flex items-center justify-between gap-4 rounded-xl border ${hairline} bg-white px-4 py-3 sm:px-5`}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-brand">
            Simulasi percobaan · Tes masuk bank
          </p>
          <p className="mt-0.5 truncate text-xs font-normal text-brand/60">
            Mode coba-coba. Jawaban tidak disimpan.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            role="timer"
            aria-live="off"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 font-mono text-sm font-medium tabular-nums text-white"
          >
            <Clock className="size-4" aria-hidden />
            {menitDetik(sisa)}
          </span>
          {onTutup && <TombolTutup onTutup={onTutup} />}
        </div>
      </div>

      {selesai ? (
        <Hasil
          jawaban={jawaban}
          benar={benar}
          kosong={kosong}
          onUlangi={ulangi}
        />
      ) : (
        <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-start">
          <div
            className={`flex-1 rounded-xl border ${hairline} bg-white p-5 sm:p-7`}
          >
            <p className="text-xs font-medium text-brand/60">
              Soal {nomor + 1} dari {soal.length} · {s.subtes}
            </p>
            <p className="mt-3 text-base leading-7 font-normal text-brand sm:text-lg sm:leading-8">
              {s.prompt}
            </p>

            <div className="mt-6 space-y-2.5">
              {s.opsi.map((teks, i) => {
                const aktif = jawaban[nomor] === i;
                return (
                  <button
                    key={teks}
                    type="button"
                    onClick={() => pilih(i)}
                    aria-pressed={aktif}
                    className={`flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-colors ${
                      aktif
                        ? "border-brand bg-brand/5"
                        : `${hairline} bg-white hover:border-brand/40`
                    }`}
                  >
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium ${
                        aktif
                          ? "bg-brand text-white"
                          : "border border-brand/30 text-brand/50"
                      }`}
                    >
                      {HURUF[i]}
                    </span>
                    <span className="text-sm leading-6 font-normal text-brand">
                      {teks}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className={`mt-7 flex items-center justify-between border-t ${hairline} pt-5`}
            >
              <button
                type="button"
                onClick={() => setNomor((n) => n - 1)}
                disabled={nomor === 0}
                className={`inline-flex h-10 items-center gap-2 rounded-lg border ${hairline} px-4 text-sm font-normal text-brand transition-colors hover:bg-brand hover:text-white disabled:pointer-events-none disabled:opacity-40`}
              >
                <ArrowLeft className="size-4" aria-hidden />
                Sebelumnya
              </button>
              <button
                type="button"
                onClick={() => setNomor((n) => n + 1)}
                disabled={nomor === soal.length - 1}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors hover:bg-brand-orange disabled:pointer-events-none disabled:opacity-40"
              >
                Berikutnya
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>

          <Navigasi
            jawaban={jawaban}
            nomor={nomor}
            onPilihSoal={setNomor}
            onKirim={() => setDikirim(true)}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Peta soal di sisi kanan: nomor mana yang sudah dijawab, mana yang dilewati,
 * dan mana yang sedang dibuka — plus jalan pintas melompat ke soal mana pun.
 * Statusnya tidak hanya dibedakan lewat warna, karena warna saja tak terbaca
 * pembaca layar maupun mata yang sulit membedakannya.
 */
function Navigasi({
  jawaban,
  nomor,
  onPilihSoal,
  onKirim,
}: {
  jawaban: (number | null)[];
  nomor: number;
  onPilihSoal: (i: number) => void;
  onKirim: () => void;
}) {
  const terjawab = jawaban.filter((j) => j !== null).length;

  return (
    <aside
      aria-label="Navigasi soal"
      className={`shrink-0 rounded-xl border ${hairline} bg-white p-5 lg:sticky lg:top-8 lg:w-72`}
    >
      <p className="text-xs font-medium text-brand/60">Navigasi soal</p>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {jawaban.map((j, i) => {
          const aktif = i === nomor;
          const dijawab = j !== null;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onPilihSoal(i)}
              aria-current={aktif ? "step" : undefined}
              aria-label={`Soal ${i + 1}, ${dijawab ? "sudah dijawab" : "belum dijawab"}`}
              className={`grid aspect-square place-items-center rounded-lg border text-sm font-medium transition-colors ${
                aktif
                  ? "border-brand-orange bg-brand-orange text-white"
                  : dijawab
                    ? "border-brand bg-brand text-white hover:bg-brand-dark"
                    : `${hairline} bg-white text-brand/50 hover:border-brand/40`
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs font-normal text-brand/60">
        <span className="font-medium text-brand">{terjawab}</span> dari{" "}
        {jawaban.length} soal terjawab
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand/12">
        <div
          className="h-full rounded-full bg-brand transition-[width]"
          style={{ width: `${(terjawab / jawaban.length) * 100}%` }}
        />
      </div>

      <ul className={`mt-4 space-y-1.5 border-t ${hairline} pt-4`}>
        {[
          ["bg-brand-orange", "Sedang dibuka"],
          ["bg-brand", "Sudah dijawab"],
          [`border ${hairline} bg-white`, "Belum dijawab"],
        ].map(([kelas, teks]) => (
          <li
            key={teks}
            className="flex items-center gap-2 text-xs font-normal text-brand/60"
          >
            <span
              className={`size-3 shrink-0 rounded-sm ${kelas}`}
              aria-hidden
            />
            {teks}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onKirim}
        className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-orange text-sm font-normal text-white transition-colors hover:bg-brand"
      >
        Kirim jawaban
        <ArrowRight className="size-4" aria-hidden />
      </button>
      <p className="mt-2 text-center text-xs font-normal text-brand/50">
        Soal kosong dihitung nol.
      </p>
    </aside>
  );
}

function Hasil({
  jawaban,
  benar,
  kosong,
  onUlangi,
}: {
  jawaban: (number | null)[];
  benar: number;
  kosong: number;
  onUlangi: () => void;
}) {
  return (
    <div className="max-w-4xl space-y-4 pb-4">
      <div className={`rounded-xl border ${hairline} bg-white p-5 sm:p-7`}>
        <p className="text-sm font-medium text-brand">Hasil percobaan</p>

        <SebaranSubtes jawaban={jawaban} />

        <p
          className={`mt-6 border-t ${hairline} pt-6 text-4xl font-medium tracking-[-0.01em] text-brand`}
        >
          {benar}
          <span className="text-xl text-brand/50"> / {soal.length}</span>
        </p>
        <dl className="mt-5 grid grid-cols-3 gap-2.5">
          {[
            ["Benar", benar],
            ["Salah", soal.length - benar - kosong],
            ["Kosong", kosong],
          ].map(([label, nilai]) => (
            <div key={label} className="rounded-lg bg-cream p-3 text-center">
              <dt className="text-xs font-normal text-brand/60">{label}</dt>
              <dd className="mt-0.5 text-lg font-medium text-brand">{nilai}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs leading-5 font-normal text-brand/60">
          Ini contoh tampilan hasil. Pada simulasi sungguhan skor dihitung per
          subtes dengan bobot soal, dan riwayatnya tersimpan di akunmu.
        </p>
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href="/tes"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
          >
            Lihat katalog simulasi
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={onUlangi}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border ${hairline} px-5 text-sm font-normal text-brand transition-colors hover:bg-brand hover:text-white`}
          >
            <RotateCcw className="size-4" aria-hidden />
            Ulangi
          </button>
        </div>
      </div>

      {/* Hasil dan pembahasan sengaja lebih sempit dari area tes: baris teks
          selebar 6xl terlalu panjang untuk dibaca. */}
      <div className="space-y-4">
        <p className="px-1 pt-2 text-sm font-medium text-brand">Pembahasan</p>

        {soal.map((s, i) => {
          const pilihan = jawaban[i];
          const tepat = pilihan === s.kunci;
          return (
            <div
              key={s.prompt}
              className={`rounded-xl border ${hairline} bg-white p-5 sm:p-6`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-brand/60">
                  Soal {i + 1} · {s.subtes}
                </p>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    pilihan === null
                      ? "bg-cream text-brand/60"
                      : tepat
                        ? "bg-mint text-brand-dark"
                        : "bg-red-50 text-red-700"
                  }`}
                >
                  {pilihan === null ? "Kosong" : tepat ? "Benar" : "Salah"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 font-normal text-brand">
                {s.prompt}
              </p>
              <ul className="mt-4 space-y-2">
                {s.opsi.map((teks, k) => {
                  const dipilih = k === pilihan;
                  const kunci = k === s.kunci;
                  return (
                    <li
                      key={teks}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${
                        kunci
                          ? "border-brand/40 bg-mint/60"
                          : dipilih
                            ? "border-red-200 bg-red-50"
                            : hairline
                      }`}
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-cream text-xs font-medium text-brand">
                        {HURUF[k]}
                      </span>
                      <span className="flex-1 leading-6 font-normal text-brand">
                        {teks}
                      </span>
                      <span className="shrink-0 text-xs font-medium text-brand/60">
                        {kunci && "kunci"}
                        {dipilih && !kunci && "pilihanmu"}
                        {dipilih && kunci && " · pilihanmu"}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 rounded-lg bg-cream/70 p-4">
                <p className="text-xs font-medium text-brand/60">Pembahasan</p>
                <p className="mt-1.5 text-sm leading-7 font-normal text-brand">
                  {s.pembahasan}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const konfigSebaran = {
  nilai: { label: "Skor", color: "var(--color-brand-orange)" },
} satisfies ChartConfig;

/**
 * Sebaran nilai per subtes: persentase soal yang benar di tiap subtes. Grafiknya
 * jadi bagian atas kartu hasil karena keduanya menjawab pertanyaan yang sama —
 * bagian mana yang sudah aman, bagian mana yang perlu dikejar.
 */
function SebaranSubtes({ jawaban }: { jawaban: (number | null)[] }) {
  const perSubtes = new Map<string, { benar: number; total: number }>();

  soal.forEach((s, i) => {
    const catatan = perSubtes.get(s.singkat) ?? { benar: 0, total: 0 };
    catatan.total += 1;
    if (jawaban[i] === s.kunci) catatan.benar += 1;
    perSubtes.set(s.singkat, catatan);
  });

  const data = [...perSubtes].map(([subtes, { benar, total }]) => ({
    subtes,
    nilai: Math.round((benar / total) * 100),
  }));

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
        Persentase jawaban benar di tiap subtes.
      </p>
    </>
  );
}

/** Satu-satunya jalan keluar dari layar penuh, jadi selalu ikut dirender. */
function TombolTutup({ onTutup }: { onTutup: () => void }) {
  return (
    <button
      type="button"
      onClick={onTutup}
      aria-label="Tutup simulasi percobaan"
      className={`grid size-8 shrink-0 place-items-center rounded-lg border ${hairline} text-brand transition-colors hover:bg-brand hover:text-white`}
    >
      <X className="size-4" aria-hidden />
    </button>
  );
}

function menitDetik(detik: number) {
  return `${String(Math.floor(detik / 60)).padStart(2, "0")}:${String(detik % 60).padStart(2, "0")}`;
}

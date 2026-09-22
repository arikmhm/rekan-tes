"use client";

import {
  ArrowRight,
  Award,
  CircleCheck,
  CircleDashed,
  CircleX,
  ClipboardList,
  Clock,
  Grid2x2Check,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  Donat,
  Kartu,
  menitDetik,
  Sebaran,
  WaktuSubtes,
} from "../../_components/hasil-ui";

const hairline = "border-[#105C78]/20";

type Opsi = {
  id: string;
  label: string;
  content: string;
  isCorrect: boolean;
};

export type SoalHasil = {
  assignmentId: string;
  /** Nomor berurut di seluruh sesi, bukan di dalam subtesnya sendiri. */
  nomor: number;
  subtes: string;
  prompt: string;
  weight: number;
  dijawab: boolean;
  isCorrect: boolean | null;
  /** Lama soal ini dibuka peserta, dalam detik. */
  detik: number;
  selectedOptionId: string | null;
  options: Opsi[];
  explanation: string;
};

export type SubtesHasil = {
  testSubtestId: string;
  nama: string;
  singkat: string;
  benar: number;
  salah: number;
  kosong: number;
  skor: number;
  maksimal: number;
  /** Waktu terpakai subtes ini, atau null bila jamnya tidak tercatat. */
  detik: number | null;
  /** Jatah waktu subtes ini, dalam detik. */
  jatah: number;
  soal: SoalHasil[];
};

/**
 * Jatah waktu wajar satu soal: durasi subtesnya dibagi rata jumlah soalnya.
 * Per subtes, bukan per sesi, karena tiap subtes punya jatah dan jumlah soal
 * yang berbeda — rata-rata sesi akan menghukum subtes yang soalnya padat.
 */
function idealSoal(subtes: SubtesHasil[], soal: SoalHasil) {
  const milik = subtes.find((x) => x.soal.some((q) => q.assignmentId === soal.assignmentId));
  if (!milik || milik.soal.length === 0) return 0;

  return Math.round(milik.jatah / milik.soal.length);
}

/** Warna satu kotak di peta jawaban. */
function rupaSoal(s: SoalHasil) {
  if (!s.dijawab)
    return { label: "kosong", kelas: `${hairline} bg-white text-brand/40` };
  if (s.isCorrect)
    return { label: "benar", kelas: "border-brand bg-brand text-white" };
  return {
    label: "salah",
    kelas: "border-brand-orange bg-brand-orange text-white",
  };
}

const KETERANGAN: [string, string][] = [
  ["border-brand bg-brand", "Benar"],
  ["border-brand-orange bg-brand-orange", "Salah"],
  [`${hairline} bg-white`, "Kosong"],
];

/**
 * Layar hasil sesi berbayar. Tata letaknya sengaja sama persis dengan hasil
 * simulasi percobaan — perkakas kartunya pun dipakai bersama — supaya peserta
 * yang sudah mencoba versi gratis menemukan bacaan yang sama di sini.
 */
export function PapanHasil({
  subtes,
  total,
  durasi,
  terpakai,
}: {
  subtes: SubtesHasil[];
  total: {
    skor: number;
    maksimal: number;
    benar: number;
    salah: number;
    kosong: number;
  };
  /** Jatah waktu seluruh subtes, dalam detik. */
  durasi: number;
  /** Waktu yang benar-benar terpakai, atau null bila jamnya tidak tercatat. */
  terpakai: number | null;
}) {
  const [dilihat, setDilihat] = useState(0);

  const semua = subtes.flatMap((s) => s.soal);
  const jumlah = semua.length;
  const akurasi = jumlah === 0 ? 0 : Math.round((total.benar / jumlah) * 100);

  const perSubtes = subtes.map((s) => ({
    ...s,
    persen:
      s.benar + s.salah + s.kosong === 0
        ? 0
        : Math.round((s.benar / (s.benar + s.salah + s.kosong)) * 100),
  }));
  // Subtes dengan persentase terendah jadi bahan rekomendasi. Kalau seri, yang
  // pertama muncul di urutan subtes yang dipilih — bukan hasil acak.
  const terlemah = perSubtes.reduce(
    (a, b) => (b.persen < a.persen ? b : a),
    perSubtes[0],
  );

  const s = semua[dilihat];

  return (
    <div className="space-y-4 pb-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu
          judul="Skor akurasi"
          Ikon={Award}
          tanda={`${total.skor} / ${total.maksimal}`}
        >
          <div className="mt-6 flex flex-col items-center">
            <Donat persen={akurasi} angka={total.benar} dari={jumlah} />
          </div>

          <dl className={`mt-6 divide-y ${hairline} border-y ${hairline}`}>
            {(
              [
                [CircleCheck, "Benar", total.benar, "text-brand"],
                [CircleX, "Salah", total.salah, "text-brand-orange"],
                [CircleDashed, "Kosong", total.kosong, "text-brand/40"],
              ] as const
            ).map(([Ikon, label, nilai, warna]) => (
              <div key={label} className="flex items-center gap-3 py-3">
                <Ikon className={`size-5 shrink-0 ${warna}`} aria-hidden />
                <dt className="flex-1 text-sm font-normal text-brand/60">
                  {label}
                </dt>
                <dd className="text-lg font-medium text-brand">{nilai}</dd>
              </div>
            ))}
          </dl>

          <p
            className={`mt-6 rounded-xl px-4 py-3 text-center text-xs leading-5 font-normal ${
              akurasi >= 70
                ? "bg-mint text-brand-dark"
                : "bg-brand-orange/12 text-brand-orange"
            }`}
          >
            <span className="block font-medium">
              {akurasi >= 70 ? "Sudah kuat" : "Butuh latihan"}
            </span>
            {akurasi >= 70
              ? "Pertahankan ritmenya dan rapikan subtes yang masih tertinggal."
              : "Peluang berkembang masih lebar. Mulai dari pembahasan soal yang salah."}
          </p>

          <p className="mt-4 text-xs leading-5 font-normal text-brand/50">
            Skor adalah jumlah bobot soal yang dijawab benar. Salah dan kosong
            bernilai nol, tanpa pengurangan nilai.
          </p>
        </Kartu>

        <Kartu
          judul="Waktu & efisiensi"
          Ikon={Clock}
          tanda={`dari ${menitDetik(durasi)}`}
        >
          {terpakai === null ? (
            <p className="mt-6 rounded-xl bg-cream px-4 py-3 text-xs leading-5 font-normal text-brand/70">
              Waktu pengerjaan sesi ini tidak tercatat lengkap.
            </p>
          ) : (
            <p className="mt-6 text-center font-mono text-4xl font-medium tabular-nums text-brand">
              {menitDetik(terpakai)}
            </p>
          )}

          <WaktuSubtes
            data={subtes.map((s) => ({
              nama: s.nama,
              detik: s.detik,
              jatah: s.jatah,
            }))}
          />
        </Kartu>

        <Kartu judul="Analisis subtes" Ikon={TrendingUp} tanda="Saran">
          <Sebaran
            data={perSubtes.map((x) => ({
              subtes: x.singkat,
              nilai: x.persen,
              benar: x.benar,
              total: x.benar + x.salah + x.kosong,
            }))}
          />
          {terlemah && (
            <p className="mt-4 rounded-xl bg-cream px-4 py-3 text-xs leading-5 font-normal text-brand/70">
              <span className="block font-medium text-brand">
                Fokus berikutnya
              </span>
              Nilai terendah ada di{" "}
              <strong className="font-medium">{terlemah.nama}</strong> (
              {terlemah.benar}/
              {terlemah.benar + terlemah.salah + terlemah.kosong} ·{" "}
              {terlemah.persen}%). Mulai dari pembahasan subtes tersebut.
            </p>
          )}
        </Kartu>

        <Kartu judul="Peta jawaban" Ikon={Grid2x2Check} kelas="lg:self-start">
          <p className="mt-4 text-xs leading-5 font-normal text-brand/60">
            Klik nomor soal untuk membuka pembahasannya. Warna menunjukkan
            ketepatan jawabanmu, angka di bawahnya lama pengerjaan.
          </p>

          {subtes.map((x) => (
            <div key={x.testSubtestId} className="mt-5">
              <p className="text-xs font-medium text-brand/60">{x.nama}</p>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {x.soal.map((q) => {
                  const rupa = rupaSoal(q);

                  return (
                    <button
                      key={q.assignmentId}
                      type="button"
                      onClick={() => setDilihat(q.nomor - 1)}
                      aria-current={
                        q.nomor - 1 === dilihat ? "true" : undefined
                      }
                      aria-label={`Soal ${q.nomor}, ${rupa.label}, ${q.detik} detik`}
                      className={`cursor-pointer rounded-lg border py-1.5 text-center transition-colors ${rupa.kelas} ${
                        q.nomor - 1 === dilihat
                          ? "ring-2 ring-brand-orange ring-offset-1"
                          : ""
                      }`}
                    >
                      <span className="block text-sm font-medium">
                        {q.nomor}
                      </span>
                      <span className="block font-mono text-[10px] opacity-70">
                        {q.detik}s
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <ul
            className={`mt-6 grid grid-cols-2 gap-2 border-t ${hairline} pt-5`}
          >
            {KETERANGAN.map(([kelas, teks]) => (
              <li
                key={teks}
                className="flex items-center gap-2 text-xs font-normal text-brand/60"
              >
                <span
                  className={`size-3 shrink-0 rounded-sm border ${kelas}`}
                  aria-hidden
                />
                {teks}
              </li>
            ))}
          </ul>
        </Kartu>

        {s && (
          <Kartu
            judul={`Pembahasan soal ${s.nomor}`}
            Ikon={ClipboardList}
            tanda={`${s.detik} detik · ideal ${idealSoal(subtes, s)} detik · bobot ${s.weight}`}
            kelas="lg:col-span-2"
          >
            <p className="mt-4 text-xs font-medium text-brand/60">
              {s.subtes} ·{" "}
              {!s.dijawab
                ? "tidak dijawab"
                : s.isCorrect
                  ? "jawabanmu benar"
                  : "jawabanmu salah"}
            </p>
            <div
              className={`mt-3 rounded-xl border ${hairline} bg-cream/60 p-5`}
            >
              <p className="text-base leading-7 font-normal whitespace-pre-line text-brand">
                {s.prompt}
              </p>
            </div>

            <ul className="mt-4 space-y-2">
              {s.options.map((o) => {
                const dipilih = o.id === s.selectedOptionId;

                return (
                  <li
                    key={o.id}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm ${
                      o.isCorrect
                        ? "border-brand/40 bg-mint/60"
                        : dipilih
                          ? "border-red-200 bg-red-50"
                          : hairline
                    }`}
                  >
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-md text-xs font-medium ${
                        o.isCorrect
                          ? "bg-brand text-white"
                          : dipilih
                            ? "bg-red-100 text-red-700"
                            : "bg-cream text-brand/60"
                      }`}
                    >
                      {o.label}
                    </span>
                    <span className="flex-1 leading-6 font-normal text-brand">
                      {o.content}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-brand/60">
                      {o.isCorrect && "kunci"}
                      {dipilih && !o.isCorrect && "pilihanmu"}
                      {dipilih && o.isCorrect && " · pilihanmu"}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className={`mt-5 rounded-xl border ${hairline} bg-white p-5`}>
              <p className="text-xs font-medium text-brand/60">Pembahasan</p>
              <p className="mt-2 text-sm leading-7 font-normal whitespace-pre-line text-brand">
                {s.explanation}
              </p>
            </div>
          </Kartu>
        )}
      </div>

      <div
        className={`flex flex-col gap-2.5 border-t ${hairline} pt-5 sm:flex-row`}
      >
        <Link
          href="/peserta/pustaka"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
        >
          Kembali ke pustaka
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link
          href="/peserta"
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border ${hairline} px-5 text-sm font-normal text-brand transition-colors hover:bg-brand hover:text-white`}
        >
          Lihat produk lain
        </Link>
      </div>
    </div>
  );
}

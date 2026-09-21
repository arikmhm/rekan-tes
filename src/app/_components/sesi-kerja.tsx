"use client";

import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { saveAnswers } from "@/lib/attempt";
import { jawabanPulih } from "@/lib/attempt-flow";

import { SubmitSubtestButton } from "./attempt-buttons";
import { Countdown } from "./countdown";

const hairline = "border-[#105C78]/20";

/** Jeda antar setoran otomatis. Cukup rapat agar yang hilang selalu sedikit. */
const JEDA_SIMPAN = 10_000;

type Opsi = { id: string; label: string; content: string };

type Soal = {
  assignmentId: string;
  nomor: number;
  prompt: string;
  options: Opsi[];
  selectedOptionId: string | null;
};

type Status = "diam" | "antre" | "menyimpan" | "tersimpan" | "gagal";

/**
 * Layar kerja satu subtes: bilah sesi, soal yang sedang dibuka, dan peta nomor.
 *
 * Seluruh soal subtes sudah ikut terkirim dari server, jadi berpindah nomor
 * tidak menyentuh jaringan sama sekali — itu yang membuat sesi terasa ringan.
 * Jawaban ditahan di memori, disetor berkelompok tiap {@link JEDA_SIMPAN}, dan
 * dicadangkan ke `localStorage` untuk menutup celah antar setoran.
 *
 * Waktu tetap milik server: `remainingSeconds` dihitung dari `started_at`
 * server, dan server pula yang menolak jawaban setelah subtesnya ditutup.
 */
export function SesiKerja({
  attemptId,
  subtesId,
  subtesNama,
  posisi,
  jumlahSubtes,
  soal,
  remainingSeconds,
  deadlineLabel,
}: {
  attemptId: string;
  subtesId: string;
  subtesNama: string;
  posisi: number;
  jumlahSubtes: number;
  soal: Soal[];
  remainingSeconds: number | null;
  /** Jam deadline, sudah diformat server agar zona waktunya tidak berselisih. */
  deadlineLabel: string | null;
}) {
  const kunci = `rekan-tes:jawaban:${subtesId}`;

  const awal = Object.fromEntries(
    soal.flatMap((s) => (s.selectedOptionId ? [[s.assignmentId, s.selectedOptionId]] : [])),
  );
  const [jawaban, setJawaban] = useState<Record<string, string>>(awal);
  // Cermin sinkron dari state: penyetor perlu nilai terbaru saat itu juga,
  // sementara state baru terbaca pada render berikutnya.
  const jawabanRef = useRef(jawaban);
  const antre = useRef(new Set<string>());
  const sedangKirim = useRef(false);

  const [nomor, setNomor] = useState(1);
  const [status, setStatus] = useState<Status>("diam");
  const [galat, setGalat] = useState<string | null>(null);

  const kirim = useCallback(async () => {
    if (antre.current.size === 0 || sedangKirim.current) return;

    const kelompok = [...antre.current].map((assignmentId) => ({
      assignmentId,
      optionId: jawabanRef.current[assignmentId],
    }));
    // Dikosongkan sebelum menunggu supaya jawaban yang dipilih selagi request
    // berjalan ikut antrean berikutnya, bukan hilang tertimpa.
    antre.current.clear();
    sedangKirim.current = true;
    setStatus("menyimpan");

    let pesan: string | null = null;
    try {
      pesan = await saveAnswers(attemptId, kelompok);
    } catch {
      // Aksi gagal terkirim sama sekali (koneksi putus, server mati).
      pesan = "Jawaban belum tersimpan karena koneksi bermasalah. Akan dicoba lagi.";
    } finally {
      sedangKirim.current = false;
    }

    if (pesan) {
      for (const k of kelompok) antre.current.add(k.assignmentId);
      setGalat(pesan);
      setStatus("gagal");
      return;
    }

    setGalat(null);
    setStatus(antre.current.size === 0 ? "tersimpan" : "antre");
    // Cadangan lokal hanya menutup jawaban yang belum sampai di server.
    if (antre.current.size === 0) localStorage.removeItem(kunci);
  }, [attemptId, kunci]);

  function pilih(assignmentId: string, optionId: string) {
    jawabanRef.current = { ...jawabanRef.current, [assignmentId]: optionId };
    setJawaban(jawabanRef.current);
    antre.current.add(assignmentId);
    setStatus("antre");
    localStorage.setItem(kunci, JSON.stringify(jawabanRef.current));
  }

  // Jawaban yang sempat tercatat di peramban tetapi belum sampai ke server —
  // sesi yang tabnya dibuang atau HP-nya mati sebelum setoran berikutnya.
  useEffect(() => {
    let tersimpan: Record<string, string>;
    try {
      tersimpan = JSON.parse(localStorage.getItem(kunci) ?? "{}");
    } catch {
      return;
    }

    const pulih = jawabanPulih(tersimpan, soal);
    if (pulih.length === 0) return;

    jawabanRef.current = { ...jawabanRef.current, ...Object.fromEntries(pulih) };
    setJawaban(jawabanRef.current);
    for (const [assignmentId] of pulih) antre.current.add(assignmentId);
    void kirim();
  }, [kunci, soal, kirim]);

  useEffect(() => {
    const jam = setInterval(() => void kirim(), JEDA_SIMPAN);
    return () => clearInterval(jam);
  }, [kirim]);

  // Setoran terakhir tepat sebelum deadline. Jawaban di detik-detik akhir tetap
  // sah, tetapi begitu server menutup subtesnya antrean tidak lagi diterima —
  // tanpa ini, satu jeda simpan terakhir bisa hangus.
  useEffect(() => {
    if (remainingSeconds === null) return;

    const jeda = setTimeout(
      () => void kirim(),
      Math.max(0, remainingSeconds * 1000 - 2_000),
    );
    return () => clearTimeout(jeda);
  }, [remainingSeconds, kirim]);

  // Berpindah tab atau mengunci layar adalah saat paling rawan tab dibuang
  // sistem, jadi antrean disetor saat itu juga — tidak menunggu jedanya habis.
  useEffect(() => {
    const saatSembunyi = () => {
      if (document.visibilityState === "hidden") void kirim();
    };

    document.addEventListener("visibilitychange", saatSembunyi);
    return () => document.removeEventListener("visibilitychange", saatSembunyi);
  }, [kirim]);

  const s = soal[nomor - 1];
  const terjawab = soal.filter((q) => jawaban[q.assignmentId]).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Bilah sesi menempel di puncak layar seperti aplikasi ujian: subtes
          yang berjalan dan sisa waktunya tidak boleh ikut tergulir. */}
      <div
        className={`sticky top-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b ${hairline} bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6`}
      >
        <div className="min-w-0">
          <p className="text-xs font-medium text-brand/60">
            Subtes {posisi} dari {jumlahSubtes}
          </p>
          <p className="mt-0.5 truncate font-medium text-brand">{subtesNama}</p>
        </div>

        {remainingSeconds !== null && deadlineLabel && (
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-xs font-normal text-brand/50 sm:block">
              sampai pukul {deadlineLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 font-mono text-sm font-medium text-white tabular-nums">
              <Clock className="size-4" aria-hidden />
              <Countdown remainingSeconds={remainingSeconds} />
            </span>
          </div>
        )}
      </div>

      {!s ? (
        <div
          className={`rounded-xl border border-dashed ${hairline} bg-white p-7`}
        >
          <p className="text-sm leading-6 font-normal text-brand/70">
            Subtes ini belum memiliki soal. Kumpulkan saja untuk melanjutkan ke
            subtes berikutnya.
          </p>
          <div className="mt-5">
            <SubmitSubtestButton
              attemptId={attemptId}
              subtestId={subtesId}
              terjawab={0}
              total={0}
              subtesTerakhir={posisi === jumlahSubtes}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div
            className={`flex-1 rounded-xl border ${hairline} bg-white p-5 sm:p-7`}
          >
            <p className="text-xs font-medium text-brand/60">
              Soal {s.nomor} dari {soal.length} · {subtesNama}
            </p>
            <p className="mt-3 text-base leading-7 font-normal whitespace-pre-line text-brand sm:text-lg sm:leading-8">
              {s.prompt}
            </p>

            <div className="mt-6 space-y-2.5">
              {s.options.map((o) => {
                const aktif = jawaban[s.assignmentId] === o.id;

                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={aktif}
                    onClick={() => pilih(s.assignmentId, o.id)}
                    className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3.5 text-left transition-colors ${
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
                      {o.label}
                    </span>
                    <span className="text-sm leading-6 font-normal text-brand">
                      {o.content}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Kendali perpindahan menempel di bawah soalnya sendiri, sejalan
                dengan arah baca: baca soal, pilih jawaban, lanjut. */}
            <div
              className={`mt-7 flex items-center justify-between border-t ${hairline} pt-5`}
            >
              {nomor > 1 ? (
                <button
                  type="button"
                  onClick={() => setNomor(nomor - 1)}
                  className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border ${hairline} px-4 text-sm font-normal text-brand transition-colors hover:bg-brand hover:text-white`}
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Sebelumnya
                </button>
              ) : (
                <span />
              )}
              {nomor < soal.length && (
                <button
                  type="button"
                  onClick={() => setNomor(nomor + 1)}
                  className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
                >
                  Berikutnya
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              )}
            </div>
          </div>

          <Navigasi
            soal={soal}
            jawaban={jawaban}
            nomor={nomor}
            terjawab={terjawab}
            status={status}
            galat={galat}
            onPindah={setNomor}
            attemptId={attemptId}
            subtesId={subtesId}
            subtesTerakhir={posisi === jumlahSubtes}
            onSebelumKumpul={kirim}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Peta soal di sisi kanan: nomor mana yang sudah dijawab, mana yang dilewati,
 * dan mana yang sedang dibuka. Statusnya tidak hanya dibedakan lewat warna,
 * karena warna saja tak terbaca pembaca layar maupun mata yang sulit
 * membedakannya.
 */
function Navigasi({
  soal,
  jawaban,
  nomor,
  terjawab,
  status,
  galat,
  onPindah,
  attemptId,
  subtesId,
  subtesTerakhir,
  onSebelumKumpul,
}: {
  soal: Soal[];
  jawaban: Record<string, string>;
  nomor: number;
  terjawab: number;
  status: Status;
  galat: string | null;
  onPindah: (n: number) => void;
  attemptId: string;
  subtesId: string;
  subtesTerakhir: boolean;
  onSebelumKumpul: () => Promise<void>;
}) {
  const jumlah = soal.length;

  return (
    <aside
      aria-label="Navigasi soal"
      className={`shrink-0 rounded-xl border ${hairline} bg-white p-5 lg:sticky lg:top-24 lg:w-72`}
    >
      <p className="text-xs font-medium text-brand/60">Navigasi soal</p>
      <p className="mt-1 text-sm font-medium text-brand">
        Soal {nomor} dari {jumlah}
      </p>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {soal.map((q) => {
          const dibuka = q.nomor === nomor;
          const dijawab = Boolean(jawaban[q.assignmentId]);

          return (
            <button
              key={q.assignmentId}
              type="button"
              onClick={() => onPindah(q.nomor)}
              aria-current={dibuka ? "step" : undefined}
              aria-label={`Soal ${q.nomor}, ${dijawab ? "sudah dijawab" : "belum dijawab"}`}
              className={`grid aspect-square cursor-pointer place-items-center rounded-lg border text-sm font-medium transition-colors ${
                dibuka
                  ? "border-brand-orange bg-brand-orange text-white"
                  : dijawab
                    ? "border-brand bg-brand text-white hover:bg-brand-dark"
                    : `${hairline} bg-white text-brand/50 hover:border-brand/40`
              }`}
            >
              {q.nomor}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs font-normal text-brand/60">
        <span className="font-medium text-brand">{terjawab}</span> dari {jumlah}{" "}
        soal terjawab
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand/12">
        <div
          className="h-full rounded-full bg-brand transition-[width]"
          style={{ width: `${jumlah === 0 ? 0 : (terjawab / jumlah) * 100}%` }}
        />
      </div>

      <StatusSimpan status={status} galat={galat} />

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

      <div className={`mt-5 border-t ${hairline} pt-5`}>
        <SubmitSubtestButton
          attemptId={attemptId}
          subtestId={subtesId}
          terjawab={terjawab}
          total={jumlah}
          subtesTerakhir={subtesTerakhir}
          onSebelumKirim={onSebelumKumpul}
        />
      </div>
      <p className="mt-2 text-center text-xs font-normal text-brand/50">
        Soal kosong dihitung nol.
      </p>
    </aside>
  );
}

/**
 * Kabar penyimpanan. Peserta tidak perlu tahu soal antrean dan jeda, tetapi
 * kegagalan harus terlihat — itu satu-satunya keadaan yang menuntut tindakan.
 */
function StatusSimpan({
  status,
  galat,
}: {
  status: Status;
  galat: string | null;
}) {
  if (status === "gagal" && galat) {
    return (
      <p
        role="alert"
        className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-700"
      >
        {galat}
      </p>
    );
  }

  return (
    // Ruangnya tetap ada agar teks status tidak menggeser peta nomor.
    <p role="status" className="mt-3 min-h-5 text-xs font-normal text-brand/50">
      {status === "menyimpan"
        ? "Menyimpan…"
        : status === "antre"
          ? "Menyimpan otomatis…"
          : status === "tersimpan"
            ? "Tersimpan"
            : ""}
    </p>
  );
}

import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Clock,
  TriangleAlert,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAttempt } from "@/lib/attempt";
import {
  activeSubtest,
  attemptAccessProblem,
  isDone,
} from "@/lib/attempt-flow";
import { formatDuration } from "@/lib/format";

import { AnswerOptions } from "../../../_components/answer-options";
import {
  StartAttemptButton,
  SubmitSubtestButton,
} from "../../../_components/attempt-buttons";
import { Countdown } from "../../../_components/countdown";

export const metadata: Metadata = { title: "Sesi pengerjaan" };

// Status attempt berubah lewat Server Action dan waktu server; halaman selalu
// dibaca ulang dari database agar tidak ada deadline basi yang tercache.
export const dynamic = "force-dynamic";

const hairline = "border-[#105C78]/20";

const tanggal = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
});
const jam = new Intl.DateTimeFormat("id-ID", { timeStyle: "short" });

type Attempt = NonNullable<Awaited<ReturnType<typeof getAttempt>>>;

export default async function SesiPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ soal?: string }>;
}) {
  const attempt = await getAttempt((await params).id);

  if (!attempt) {
    notFound();
  }

  const masalah = attemptAccessProblem(
    { status: attempt.orderStatus, accessExpiresAt: attempt.accessExpiresAt },
    new Date(),
  );
  const aktif = masalah ? null : activeSubtest(attempt.subtests);
  const totalDurasi = attempt.subtests.reduce(
    (n, s) => n + s.durationSeconds,
    0,
  );
  const sedangKerja = Boolean(aktif) && attempt.status !== "not_started";

  return (
    <div className="mx-auto w-full max-w-6xl p-4 pt-5 sm:p-6 sm:pt-6">
      {/* Di layar kerja identitas sesi dan sisa waktu pindah ke bilah sesi,
          jadi judul besar hanya tampil saat sesi belum atau sudah tidak
          berjalan — persis seperti simulasi percobaan. */}
      {!sedangKerja && (
        <>
          <p className="text-xs font-medium text-brand/60">Sesi pengerjaan</p>
          <h1 className="mt-1 text-2xl leading-snug font-medium tracking-[-0.01em] text-brand">
            {attempt.testName}
          </h1>
        </>
      )}

      {masalah ? (
        <div
          className={`mt-6 rounded-2xl border border-dashed ${hairline} bg-white p-7`}
        >
          <TriangleAlert className="size-5 text-brand-orange" aria-hidden />
          <p className="mt-3 text-sm leading-6 font-normal text-brand/70">
            {masalah}{" "}
            <Link
              className="font-medium text-brand transition-colors hover:text-brand-orange"
              href={`/peserta/pesanan/${attempt.orderId}`}
            >
              Lihat status pesanan
            </Link>
            .
          </p>
        </div>
      ) : !aktif ? (
        <div className={`mt-6 rounded-2xl border ${hairline} bg-mint/60 p-7`}>
          <CircleCheck className="size-5 text-brand" aria-hidden />
          <h2 className="mt-3 text-lg font-medium text-brand">
            Seluruh subtes selesai
          </h2>
          <p className="mt-2 text-sm leading-6 font-normal text-brand/70">
            Semua subtes sudah dikumpulkan
            {attempt.submittedAt
              ? ` pada ${tanggal.format(attempt.submittedAt)}`
              : ""}
            . Skor, rincian per subtes, dan pembahasan setiap soal sudah dapat
            dibuka.
          </p>
          <Link
            href={`/peserta/simulasi/${attempt.id}/hasil`}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
          >
            Lihat hasil dan pembahasan
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      ) : attempt.status === "not_started" ? (
        <Petunjuk
          attemptId={attempt.id}
          accessExpiresAt={attempt.accessExpiresAt}
          totalDurasi={totalDurasi}
          jumlahSubtes={attempt.subtests.length}
        />
      ) : (
        <Kerja
          attempt={attempt}
          aktif={aktif}
          nomor={nomorSoal((await searchParams).soal, attempt.questions.length)}
        />
      )}

      {/* Daftar subtes hanya menemani layar yang bukan layar kerja: saat soal
          terbuka, yang dibutuhkan cuma soal dan navigasinya. */}
      {!sedangKerja && (
        <>
          <h2 className="mt-10 text-lg font-medium text-brand">
            Urutan subtes
          </h2>
          <ol className="mt-4 space-y-3">
            {attempt.subtests.map((s) => (
              <li
                key={s.testSubtestId}
                className={`flex flex-wrap items-center gap-4 rounded-2xl border ${hairline} bg-white p-5`}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand font-mono text-xs font-medium text-white">
                  {String(s.position).padStart(2, "0")}
                </span>
                <div className="min-w-45 flex-1">
                  <p className="font-medium text-brand">{s.name}</p>
                  <p className="mt-1 text-sm font-normal text-brand/60">
                    {s.questionLimit} soal · {formatDuration(s.durationSeconds)}
                  </p>
                </div>
                <span className="rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-brand/70">
                  {isDone(s.status)
                    ? "selesai"
                    : s.testSubtestId === aktif?.testSubtestId &&
                        attempt.status === "in_progress"
                      ? "sedang dikerjakan"
                      : "belum dibuka"}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

/** Nomor soal dari query string, dijepit ke rentang yang benar-benar ada. */
function nomorSoal(raw: string | undefined, jumlah: number) {
  const n = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || jumlah === 0) return 1;
  return Math.min(Math.max(n, 1), jumlah);
}

/** Layar kerja: bilah sesi, satu soal, lalu peta nomor di sisi kanan. */
function Kerja({
  attempt,
  aktif,
  nomor,
}: {
  attempt: Attempt;
  aktif: Attempt["subtests"][number];
  nomor: number;
}) {
  const soal = attempt.questions[nomor - 1];
  const terjawab = attempt.questions.filter((q) => q.selectedOptionId).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Bilah sesi menempel di puncak layar seperti aplikasi ujian: subtes
          yang berjalan dan sisa waktunya tidak boleh ikut tergulir. */}
      <div
        className={`sticky top-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b ${hairline} bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6`}
      >
        <div className="min-w-0">
          <p className="text-xs font-medium text-brand/60">
            Subtes {aktif.position} dari {attempt.subtests.length}
          </p>
          <p className="mt-0.5 truncate font-medium text-brand">{aktif.name}</p>
        </div>

        {attempt.remainingSeconds !== null && attempt.deadline && (
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-xs font-normal text-brand/50 sm:block">
              sampai pukul {jam.format(attempt.deadline)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 font-mono text-sm font-medium text-white tabular-nums">
              <Clock className="size-4" aria-hidden />
              <Countdown remainingSeconds={attempt.remainingSeconds} />
            </span>
          </div>
        )}
      </div>

      {!soal ? (
        <div
          className={`rounded-xl border border-dashed ${hairline} bg-white p-7`}
        >
          <p className="text-sm leading-6 font-normal text-brand/70">
            Subtes ini belum memiliki soal. Kumpulkan saja untuk melanjutkan ke
            subtes berikutnya.
          </p>
          <div className="mt-5">
            <SubmitSubtestButton
              attemptId={attempt.id}
              subtestId={aktif.id ?? ""}
              terjawab={0}
              total={0}
              subtesTerakhir={aktif.position === attempt.subtests.length}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div
            className={`flex-1 rounded-xl border ${hairline} bg-white p-5 sm:p-7`}
          >
            <p className="text-xs font-medium text-brand/60">
              Soal {soal.nomor} dari {attempt.questions.length} · {aktif.name}
            </p>
            <p className="mt-3 text-base leading-7 font-normal whitespace-pre-line text-brand sm:text-lg sm:leading-8">
              {soal.prompt}
            </p>

            <AnswerOptions
              attemptId={attempt.id}
              assignmentId={soal.assignmentId}
              options={soal.options}
              selectedOptionId={soal.selectedOptionId}
            />

            {/* Kendali perpindahan menempel di bawah soalnya sendiri, sejalan
                dengan arah baca: baca soal, pilih jawaban, lanjut. */}
            <div
              className={`mt-7 flex items-center justify-between border-t ${hairline} pt-5`}
            >
              {nomor > 1 ? (
                <Link
                  href={`/peserta/simulasi/${attempt.id}?soal=${nomor - 1}`}
                  className={`inline-flex h-10 items-center gap-2 rounded-lg border ${hairline} px-4 text-sm font-normal text-brand transition-colors hover:bg-brand hover:text-white`}
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Sebelumnya
                </Link>
              ) : (
                <span />
              )}
              {nomor < attempt.questions.length && (
                <Link
                  href={`/peserta/simulasi/${attempt.id}?soal=${nomor + 1}`}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
                >
                  Berikutnya
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              )}
            </div>
          </div>

          <Navigasi
            attempt={attempt}
            aktif={aktif}
            nomor={nomor}
            terjawab={terjawab}
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
  attempt,
  aktif,
  nomor,
  terjawab,
}: {
  attempt: Attempt;
  aktif: Attempt["subtests"][number];
  nomor: number;
  terjawab: number;
}) {
  const jumlah = attempt.questions.length;

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
        {attempt.questions.map((q) => {
          const dibuka = q.nomor === nomor;
          const dijawab = Boolean(q.selectedOptionId);

          return (
            <Link
              key={q.assignmentId}
              href={`/peserta/simulasi/${attempt.id}?soal=${q.nomor}`}
              aria-current={dibuka ? "step" : undefined}
              aria-label={`Soal ${q.nomor}, ${dijawab ? "sudah dijawab" : "belum dijawab"}`}
              className={`grid aspect-square place-items-center rounded-lg border text-sm font-medium transition-colors ${
                dibuka
                  ? "border-brand-orange bg-brand-orange text-white"
                  : dijawab
                    ? "border-brand bg-brand text-white hover:bg-brand-dark"
                    : `${hairline} bg-white text-brand/50 hover:border-brand/40`
              }`}
            >
              {q.nomor}
            </Link>
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
          attemptId={attempt.id}
          subtestId={aktif.id ?? ""}
          terjawab={terjawab}
          total={jumlah}
          subtesTerakhir={aktif.position === attempt.subtests.length}
        />
      </div>
      <p className="mt-2 text-center text-xs font-normal text-brand/50">
        Soal kosong dihitung nol.
      </p>
    </aside>
  );
}

/** Petunjuk wajib tampil sebelum timer subtes pertama berjalan. */
function Petunjuk({
  attemptId,
  accessExpiresAt,
  totalDurasi,
  jumlahSubtes,
}: {
  attemptId: string;
  accessExpiresAt: Date | null;
  totalDurasi: number;
  jumlahSubtes: number;
}) {
  return (
    <div className={`mt-6 rounded-2xl border ${hairline} bg-white p-6 sm:p-7`}>
      <h2 className="text-lg font-medium text-brand">Petunjuk pengerjaan</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 font-normal text-brand/70 marker:text-brand-orange">
        <li>
          Sesi terdiri dari {jumlahSubtes} subtes dengan total durasi{" "}
          {formatDuration(totalDurasi)}, dikerjakan berurutan.
        </li>
        <li>
          Setiap subtes punya batas waktunya sendiri yang mulai berjalan saat
          subtes dibuka dan dihitung oleh server, bukan peramban. Menutup
          halaman tidak menghentikannya.
        </li>
        <li>Subtes yang sudah dikumpulkan tidak dapat dibuka kembali.</li>
        <li>Setiap soal berupa pilihan ganda dengan satu jawaban benar.</li>
        <li>
          Jawaban tersimpan begitu dipilih dan masih dapat diganti selama
          waktunya belum habis.
        </li>
        <li>Satu pesanan memberi satu kali kesempatan mengerjakan.</li>
        {accessExpiresAt && (
          <li>Masa akses berakhir {tanggal.format(accessExpiresAt)}.</li>
        )}
      </ul>

      <div className={`mt-6 border-t ${hairline} pt-6`}>
        <StartAttemptButton attemptId={attemptId} />
        <p className="mt-3 text-xs leading-5 font-normal text-brand/50">
          Waktu subtes pertama mulai berjalan begitu tombol ini ditekan.
        </p>
      </div>
    </div>
  );
}

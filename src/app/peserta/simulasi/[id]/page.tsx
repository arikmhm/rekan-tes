import { ArrowRight, CircleCheck, TriangleAlert } from "lucide-react";
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

import { StartAttemptButton } from "../../../_components/attempt-buttons";
import { SesiKerja } from "../../../_components/sesi-kerja";

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

export default async function SesiPage({
  params,
}: {
  params: Promise<{ id: string }>;
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
        <SesiKerja
          // Subtes berganti berarti sesi kerja baru: nomor dan antrean simpan
          // milik subtes sebelumnya tidak boleh ikut terbawa.
          key={aktif.id}
          attemptId={attempt.id}
          subtesId={aktif.id ?? ""}
          subtesNama={aktif.name}
          posisi={aktif.position}
          jumlahSubtes={attempt.subtests.length}
          // Hanya yang dibutuhkan layar kerja yang menyeberang ke klien; bobot
          // penilaian tetap tinggal di server.
          soal={attempt.questions.map((q) => ({
            assignmentId: q.assignmentId,
            nomor: q.nomor,
            prompt: q.prompt,
            options: q.options,
            selectedOptionId: q.selectedOptionId,
          }))}
          remainingSeconds={attempt.remainingSeconds}
          deadlineLabel={attempt.deadline ? jam.format(attempt.deadline) : null}
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

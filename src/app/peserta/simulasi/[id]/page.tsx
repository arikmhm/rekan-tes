import { ArrowRight } from "lucide-react";
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
import { tanggalSingkat } from "../../_components/label";

export const metadata: Metadata = { title: "Sesi pengerjaan" };

export const dynamic = "force-dynamic";

const hairline = "border-[#105C78]/20";

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
      {!sedangKerja && (
        <h1 className="text-2xl leading-snug font-medium tracking-[-0.01em] text-brand">
          {attempt.testName}
        </h1>
      )}

      {masalah ? (
        <div
          className={`mt-6 rounded-2xl border border-dashed ${hairline} bg-white p-7`}
        >
          <p className="text-sm leading-6 font-normal text-brand/70">
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
          <h2 className="text-lg font-medium text-brand">
            Semua subtes selesai
          </h2>
          {attempt.submittedAt && (
            <p className="mt-1 text-sm font-normal text-brand/70">
              Dikumpulkan {tanggalSingkat.format(attempt.submittedAt)}
            </p>
          )}
          <Link
            href={`/peserta/simulasi/${attempt.id}/hasil`}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
          >
            Lihat hasil
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
          // Subtes baru = state kerja baru; antrean lama tidak terbawa.
          key={aktif.id}
          attemptId={attempt.id}
          subtesId={aktif.id ?? ""}
          subtesNama={aktif.name}
          posisi={aktif.position}
          jumlahSubtes={attempt.subtests.length}
          // Bobot tetap di server.
          soal={attempt.questions.map((q) => ({
            assignmentId: q.assignmentId,
            nomor: q.nomor,
            prompt: q.prompt,
            options: q.options,
            selectedOptionId: q.selectedOptionId,
            secondsSpent: q.secondsSpent,
          }))}
          remainingSeconds={attempt.remainingSeconds}
          deadlineLabel={attempt.deadline ? jam.format(attempt.deadline) : null}
        />
      )}

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
          {jumlahSubtes} subtes, total {formatDuration(totalDurasi)},
          dikerjakan berurutan.
        </li>
        <li>Waktu tiap subtes tetap berjalan walau halaman ditutup.</li>
        <li>Subtes yang sudah dikumpulkan tidak bisa dibuka lagi.</li>
        <li>Jawaban tersimpan otomatis dan bisa diganti selama waktu ada.</li>
        {accessExpiresAt && (
          <li>Akses berakhir {tanggalSingkat.format(accessExpiresAt)}.</li>
        )}
      </ul>

      <div className={`mt-6 border-t ${hairline} pt-6`}>
        <StartAttemptButton attemptId={attemptId} />
      </div>
    </div>
  );
}

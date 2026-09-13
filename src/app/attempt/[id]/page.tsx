import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAttempt } from "@/lib/attempt";
import { activeSubtest, attemptAccessProblem, isDone } from "@/lib/attempt-flow";
import { formatDuration } from "@/lib/format";

import { AnswerOptions } from "../../_components/answer-options";
import { StartAttemptButton, SubmitSubtestButton } from "../../_components/attempt-buttons";
import { Countdown } from "../../_components/countdown";
import { SiteShell } from "../../_components/site-shell";

export const metadata: Metadata = { title: "Sesi pengerjaan" };

// Status attempt berubah lewat Server Action dan waktu server; halaman selalu
// dibaca ulang dari database agar tidak ada deadline basi yang tercache.
export const dynamic = "force-dynamic";

const tanggal = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" });
const jam = new Intl.DateTimeFormat("id-ID", { timeStyle: "short" });

type Attempt = NonNullable<Awaited<ReturnType<typeof getAttempt>>>;

export default async function AttemptPage({
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
  const totalDurasi = attempt.subtests.reduce((n, s) => n + s.durationSeconds, 0);

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-sm font-bold text-brand">Sesi pengerjaan</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {attempt.testName}
        </h1>

        {masalah ? (
          <p className="mt-8 rounded-3xl border border-dashed border-black/12 p-7 text-sm leading-6 text-muted-foreground">
            {masalah}{" "}
            <Link className="font-semibold hover:underline" href={`/order/${attempt.orderId}`}>
              Lihat status pesanan
            </Link>
            .
          </p>
        ) : !aktif ? (
          <div className="mt-8 rounded-3xl border border-brand/15 bg-mint/60 p-7">
            <h2 className="text-lg font-semibold text-brand-dark">Seluruh subtes selesai</h2>
            <p className="mt-2 text-sm leading-6 text-brand-dark/80">
              Semua subtes sudah dikumpulkan
              {attempt.submittedAt ? ` pada ${tanggal.format(attempt.submittedAt)}` : ""}. Hasil dan
              pembahasan akan tampil di sini setelah penilaian tersedia.
            </p>
            <Link
              href="/akun"
              className="mt-5 inline-block text-sm font-semibold text-brand hover:text-brand-dark"
            >
              Kembali ke akun saya
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
          <Engine
            attempt={attempt}
            aktif={aktif}
            nomor={nomorSoal((await searchParams).soal, attempt.questions.length)}
          />
        )}

        <h2 className="mt-12 text-lg font-semibold">Urutan subtes</h2>
        <ol className="mt-4 space-y-3">
          {attempt.subtests.map((s) => (
            <li
              key={s.testSubtestId}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-black/8 bg-white p-5"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint font-mono text-xs font-semibold text-brand-dark">
                {String(s.position).padStart(2, "0")}
              </span>
              <div className="min-w-45 flex-1">
                <p className="font-semibold">{s.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s.questionLimit} soal · {formatDuration(s.durationSeconds)}
                </p>
              </div>
              <span className="rounded-full bg-cream px-3 py-1.5 text-xs font-semibold">
                {isDone(s.status)
                  ? "selesai"
                  : s.testSubtestId === aktif?.testSubtestId && attempt.status === "in_progress"
                    ? "sedang dikerjakan"
                    : "belum dibuka"}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </SiteShell>
  );
}

/** Nomor soal dari query string, dijepit ke rentang yang benar-benar ada. */
function nomorSoal(raw: string | undefined, jumlah: number) {
  const n = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || jumlah === 0) return 1;
  return Math.min(Math.max(n, 1), jumlah);
}

/** Soal, navigasi nomor, dan sisa waktu subtes yang sedang berjalan. */
function Engine({
  attempt,
  aktif,
  nomor,
}: {
  attempt: Attempt;
  aktif: Attempt["subtests"][number];
  nomor: number;
}) {
  const soal = attempt.questions[nomor - 1];

  return (
    <div className="mt-8 rounded-3xl border border-brand/15 bg-mint/60 p-6 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-dark">
            Subtes {aktif.position} dari {attempt.subtests.length}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-brand-dark">
            {aktif.name}
          </h2>
        </div>
        {attempt.remainingSeconds !== null && attempt.deadline && (
          <p className="text-right text-sm text-brand-dark/80">
            Sisa waktu{" "}
            <strong className="text-base text-brand-dark">
              <Countdown remainingSeconds={attempt.remainingSeconds} />
            </strong>
            <br />
            <span className="text-xs">sampai pukul {jam.format(attempt.deadline)}</span>
          </p>
        )}
      </div>

      {!soal ? (
        <p className="mt-6 rounded-2xl border border-dashed border-brand/25 bg-white/70 p-6 text-sm leading-6 text-brand-dark/80">
          Subtes ini belum memiliki soal. Kumpulkan saja untuk melanjutkan ke subtes berikutnya.
        </p>
      ) : (
        <>
          <nav aria-label="Navigasi nomor soal" className="mt-6 flex flex-wrap gap-2">
            {attempt.questions.map((q) => (
              <Link
                key={q.assignmentId}
                href={`/attempt/${attempt.id}?soal=${q.nomor}`}
                aria-current={q.nomor === nomor ? "page" : undefined}
                className={`grid size-10 place-items-center rounded-xl text-sm font-semibold transition ${
                  q.nomor === nomor
                    ? "bg-brand text-white"
                    : q.selectedOptionId
                      ? "bg-white text-brand-dark ring-1 ring-brand/40"
                      : "bg-white/70 text-muted-foreground hover:bg-white"
                }`}
              >
                {q.nomor}
              </Link>
            ))}
          </nav>

          <div className="mt-6 rounded-2xl bg-white p-5 sm:p-6">
            <p className="text-xs font-semibold text-muted-foreground">
              Soal {soal.nomor} dari {attempt.questions.length}
            </p>
            <p className="mt-3 text-base leading-7 whitespace-pre-line">{soal.prompt}</p>

            <AnswerOptions
              attemptId={attempt.id}
              assignmentId={soal.assignmentId}
              options={soal.options}
              selectedOptionId={soal.selectedOptionId}
            />

            <div className="mt-6 flex items-center justify-between gap-3 text-sm font-semibold">
              {nomor > 1 ? (
                <Link className="text-brand hover:text-brand-dark" href={`/attempt/${attempt.id}?soal=${nomor - 1}`}>
                  ← Sebelumnya
                </Link>
              ) : (
                <span />
              )}
              {nomor < attempt.questions.length && (
                <Link className="text-brand hover:text-brand-dark" href={`/attempt/${attempt.id}?soal=${nomor + 1}`}>
                  Berikutnya →
                </Link>
              )}
            </div>
          </div>
        </>
      )}

      <div className="mt-6">
        <SubmitSubtestButton attemptId={attempt.id} subtestId={aktif.id ?? ""} />
      </div>
      <p className="mt-3 text-xs leading-5 text-brand-dark/70">
        Subtes yang sudah dikumpulkan tidak dapat dibuka kembali. Waktu tetap berjalan walau halaman
        ditutup; subtes dikumpulkan otomatis begitu batas waktunya lewat.
      </p>
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
    <div className="mt-8 rounded-3xl border border-black/8 bg-white p-7">
      <h2 className="text-lg font-semibold">Petunjuk pengerjaan</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
        <li>
          Sesi terdiri dari {jumlahSubtes} subtes dengan total durasi{" "}
          {formatDuration(totalDurasi)}, dikerjakan berurutan.
        </li>
        <li>
          Setiap subtes punya batas waktunya sendiri yang mulai berjalan saat subtes dibuka dan
          dihitung oleh server, bukan peramban. Menutup halaman tidak menghentikannya.
        </li>
        <li>Subtes yang sudah dikumpulkan tidak dapat dibuka kembali.</li>
        <li>Setiap soal berupa pilihan ganda dengan satu jawaban benar.</li>
        <li>Jawaban tersimpan begitu dipilih dan masih dapat diganti selama waktunya belum habis.</li>
        <li>Satu pesanan memberi satu kali kesempatan mengerjakan.</li>
        {accessExpiresAt && <li>Masa akses berakhir {tanggal.format(accessExpiresAt)}.</li>}
      </ul>

      <div className="mt-7">
        <StartAttemptButton attemptId={attemptId} />
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        Waktu subtes pertama mulai berjalan begitu tombol ini ditekan.
      </p>
    </div>
  );
}

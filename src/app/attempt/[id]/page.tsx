import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAttempt } from "@/lib/attempt";
import { activeSubtest, attemptAccessProblem, isDone, subtestDeadline } from "@/lib/attempt-flow";
import { formatDuration } from "@/lib/format";

import { StartAttemptButton, SubmitSubtestButton } from "../../_components/attempt-buttons";
import { SiteShell } from "../../_components/site-shell";

export const metadata: Metadata = { title: "Sesi pengerjaan" };

// Status attempt berubah lewat Server Action dan waktu server; halaman selalu
// dibaca ulang dari database agar tidak ada deadline basi yang tercache.
export const dynamic = "force-dynamic";

const tanggal = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" });
const jam = new Intl.DateTimeFormat("id-ID", { timeStyle: "short" });

export default async function AttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const attempt = await getAttempt((await params).id);

  if (!attempt) {
    notFound();
  }

  const masalah = attemptAccessProblem(
    { status: attempt.orderStatus, accessExpiresAt: attempt.accessExpiresAt },
    new Date(),
  );
  const aktif = masalah ? null : activeSubtest(attempt.subtests);
  const deadline = aktif && aktif.startedAt ? subtestDeadline(aktif) : null;
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
          <div className="mt-8 rounded-3xl border border-brand/15 bg-mint/60 p-7">
            <p className="text-sm font-semibold text-brand-dark">
              Subtes {aktif.position} dari {attempt.subtests.length}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-brand-dark">
              {aktif.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand-dark/80">
              {aktif.questionLimit} soal · {formatDuration(aktif.durationSeconds)}
              {deadline && ` · batas waktu pukul ${jam.format(deadline)}`}
            </p>

            {/* Mesin soal, navigasi nomor, dan hitung mundur menyusul bersama
                timer server. Halaman ini sudah menjadi satu-satunya pintu ke
                subtes yang sedang berjalan. */}
            <p className="mt-6 rounded-2xl border border-dashed border-brand/25 bg-white/70 p-6 text-sm leading-6 text-brand-dark/80">
              Daftar soal subtes ini akan tampil di halaman yang sama. Batas waktunya sudah berjalan
              sejak subtes dibuka dan dihitung server, jadi menutup peramban tidak menghentikannya.
            </p>

            <div className="mt-6">
              <SubmitSubtestButton attemptId={attempt.id} />
            </div>
            <p className="mt-3 text-xs leading-5 text-brand-dark/70">
              Subtes yang sudah dikumpulkan tidak dapat dibuka kembali.
            </p>
          </div>
        )}

        <h2 className="mt-12 text-lg font-semibold">Urutan subtes</h2>
        <ol className="mt-4 space-y-3">
          {attempt.subtests.map((s) => (
            <li
              key={s.testSubtestId}
              className={`flex flex-wrap items-center gap-4 rounded-2xl border p-5 ${
                s.testSubtestId === aktif?.testSubtestId
                  ? "border-brand/30 bg-white"
                  : "border-black/8 bg-white"
              }`}
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

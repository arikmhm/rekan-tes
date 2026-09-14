"use client";

import { ArrowRight, TriangleAlert } from "lucide-react";
import { useActionState, useRef } from "react";

import { startAttempt, submitSubtest } from "@/lib/attempt";

const hairline = "border-[#105C78]/20";

/** Memulai attempt; timer subtes pertama baru berjalan setelah ini ditekan. */
export function StartAttemptButton({ attemptId }: { attemptId: string }) {
  const [pesan, action, pending] = useActionState(startAttempt, null);

  return (
    <form action={action}>
      <input type="hidden" name="attemptId" value={attemptId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors hover:bg-brand-orange disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Memulai…" : "Mulai mengerjakan"}
        <ArrowRight className="size-4" aria-hidden />
      </button>
      <Pesan pesan={pesan} />
    </form>
  );
}

/**
 * Menyubmit subtes berjalan dan melanjutkan ke subtes berikutnya. Konfirmasinya
 * memakai <dialog> bawaan peramban, sama seperti simulasi percobaan: modalitas,
 * jebakan fokus, dan tombol Esc datang dari platform.
 */
export function SubmitSubtestButton({
  attemptId,
  subtestId,
  terjawab,
  total,
  subtesTerakhir,
}: {
  attemptId: string;
  /** Subtes yang sedang dilihat; server menolak bila sudah berpindah. */
  subtestId: string;
  terjawab: number;
  total: number;
  subtesTerakhir: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pesan, action, pending] = useActionState(submitSubtest, null);
  const kosong = total - terjawab;

  return (
    <form action={action}>
      <input type="hidden" name="attemptId" value={attemptId} />
      <input type="hidden" name="subtestId" value={subtestId} />

      <dialog
        ref={dialog}
        aria-labelledby="judul-kumpul"
        className={`m-auto w-[min(26rem,calc(100vw-2.5rem))] rounded-2xl border ${hairline} bg-white p-0 text-brand shadow-[0_24px_60px_rgba(16,92,120,0.22)] backdrop:bg-brand/40`}
      >
        <div className="p-6 sm:p-7">
          <h2
            id="judul-kumpul"
            className="text-xl font-medium tracking-[-0.01em] text-brand"
          >
            Kumpulkan subtes sekarang?
          </h2>
          <p className="mt-2 text-sm leading-6 font-normal text-brand/70">
            Subtes yang sudah dikumpulkan tidak dapat dibuka kembali.{" "}
            {subtesTerakhir
              ? "Ini subtes terakhir, jadi skor dan pembahasannya langsung terbuka setelah ini."
              : "Waktu subtes berikutnya mulai berjalan begitu subtes ini ditutup."}
          </p>

          <dl
            className={`mt-5 flex flex-wrap gap-x-6 gap-y-2 border-y ${hairline} py-4 text-sm font-normal text-brand/70`}
          >
            <div className="flex items-center gap-2">
              <dt>Terjawab</dt>
              <dd className="font-medium text-brand">
                {terjawab} dari {total}
              </dd>
            </div>
          </dl>

          {kosong > 0 && (
            <p className="mt-4 flex items-start gap-2 text-xs leading-5 font-normal text-brand/60">
              <TriangleAlert
                className="mt-0.5 size-4 shrink-0 text-brand-orange"
                aria-hidden
              />
              Masih ada {kosong} soal kosong. Soal kosong dihitung nol.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row-reverse">
            {/* Tombol kirim milik form di luar dialog: menutup dialognya lebih
                dulu supaya fokus kembali ke halaman sebelum aksi berjalan. */}
            <button
              type="submit"
              onClick={() => dialog.current?.close()}
              className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-orange px-5 text-sm font-normal text-white transition-colors hover:bg-brand"
            >
              Ya, kumpulkan
              <ArrowRight className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className={`h-11 flex-1 cursor-pointer rounded-lg border ${hairline} text-sm font-normal text-brand transition-colors hover:bg-brand hover:text-white`}
            >
              Periksa lagi
            </button>
          </div>
        </div>
      </dialog>

      <button
        type="button"
        disabled={pending}
        onClick={() => dialog.current?.showModal()}
        className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-orange text-sm font-normal text-white transition-colors hover:bg-brand disabled:opacity-60"
      >
        {pending ? "Mengumpulkan…" : "Kumpulkan subtes"}
        <ArrowRight className="size-4" aria-hidden />
      </button>
      <Pesan pesan={pesan} />
    </form>
  );
}

function Pesan({ pesan }: { pesan: string | null }) {
  if (!pesan) return null;

  return (
    <p
      role="status"
      className="mt-3 text-sm leading-6 font-normal text-brand/70"
    >
      {pesan}
    </p>
  );
}

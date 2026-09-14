"use client";

import { useActionState, useOptimistic, useState } from "react";

import { saveAnswer } from "@/lib/attempt";

type Option = { id: string; label: string; content: string };

/**
 * Pilihan jawaban satu soal: pilihan tampil seketika (optimistis) sementara
 * penyimpanan berjalan di latar, dan status simpan selalu terlihat — menyimpan,
 * tersimpan, atau gagal.
 *
 * Aksi dibungkus closure klien supaya kegagalan pengiriman dapat ditangkap.
 * Konsekuensinya form ini tidak lagi bisa di-progressive-enhance: tanpa
 * JavaScript, menjawab tidak jalan. Ditukar sadar — halaman pengerjaan sudah
 * butuh JavaScript untuk hitung mundur, dan error pengiriman yang tak
 * tertangkap akan melempar peserta keluar dari sesi yang waktunya berjalan.
 */
export function AnswerOptions({
  attemptId,
  assignmentId,
  options,
  selectedOptionId,
}: {
  attemptId: string;
  assignmentId: string;
  options: Option[];
  selectedOptionId: string | null;
}) {
  // Nilai optimistis kembali sendiri ke nilai server begitu aksi selesai, jadi
  // penyimpanan yang gagal terlihat sebagai pilihan yang batal — bukan centang
  // yang menipu peserta seolah jawabannya sudah tersimpan.
  const [terpilih, pilihOptimistis] = useOptimistic(selectedOptionId);
  const [pernahKirim, setPernahKirim] = useState(false);

  const [galat, action, pending] = useActionState(
    async (_prev: string | null, form: FormData) => {
      pilihOptimistis(String(form.get("optionId") ?? ""));
      setPernahKirim(true);

      try {
        return await saveAnswer(null, form);
      } catch {
        // Aksi gagal terkirim sama sekali (koneksi putus, server mati). Tanpa
        // tangkapan ini React melempar ke error boundary dan seluruh halaman
        // pengerjaan hilang bersama sisa waktu yang sedang berjalan.
        return "Jawaban belum tersimpan karena koneksi bermasalah. Pilih lagi setelah koneksi pulih.";
      }
    },
    null,
  );

  return (
    <form action={action} className="mt-6 space-y-2.5">
      <input type="hidden" name="attemptId" value={attemptId} />
      <input type="hidden" name="assignmentId" value={assignmentId} />

      {options.map((o) => {
        const aktif = o.id === terpilih;

        return (
          <button
            key={o.id}
            type="submit"
            name="optionId"
            value={o.id}
            aria-pressed={aktif}
            className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3.5 text-left transition-colors ${
              aktif
                ? "border-brand bg-brand/5"
                : "border-[#105C78]/20 bg-white hover:border-brand/40"
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

      {/* `pending` diperiksa lebih dulu: selagi percobaan baru berjalan,
          `galat` masih berisi hasil percobaan sebelumnya — menampilkannya akan
          mengabarkan kegagalan yang sedang dicoba ulang saat itu juga. */}
      {!pending && galat ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {galat}
        </p>
      ) : (
        // Ruangnya tetap ada agar teks status tidak menggeser daftar opsi.
        <p role="status" className="min-h-5 text-xs font-medium text-brand/50">
          {pending ? "Menyimpan…" : pernahKirim ? "Tersimpan" : ""}
        </p>
      )}
    </form>
  );
}

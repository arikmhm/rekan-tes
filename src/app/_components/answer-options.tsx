"use client";

import { useActionState } from "react";

import { saveAnswer } from "@/lib/attempt";

type Option = { id: string; label: string; content: string };

/**
 * Pilihan jawaban satu soal. Setiap opsi adalah tombol submit, jadi menjawab
 * tetap berjalan tanpa JavaScript dan tanpa state klien yang bisa melenceng
 * dari server. Indikator "menyimpan/tersimpan" menyusul di RT-013.
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
  const [pesan, action, pending] = useActionState(saveAnswer, null);

  return (
    <form action={action} className="mt-6 space-y-3">
      <input type="hidden" name="attemptId" value={attemptId} />
      <input type="hidden" name="assignmentId" value={assignmentId} />

      {options.map((o) => {
        const terpilih = o.id === selectedOptionId;

        return (
          <button
            key={o.id}
            type="submit"
            name="optionId"
            value={o.id}
            disabled={pending}
            aria-pressed={terpilih}
            className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition disabled:opacity-60 ${
              terpilih ? "border-brand bg-mint/60" : "border-black/12 bg-white hover:border-brand/30"
            }`}
          >
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                terpilih ? "bg-brand text-white" : "bg-cream text-ink"
              }`}
            >
              {o.label}
            </span>
            <span className="text-sm leading-6">{o.content}</span>
          </button>
        );
      })}

      {pesan && (
        <p role="status" className="text-sm leading-6 text-muted-foreground">
          {pesan}
        </p>
      )}
    </form>
  );
}

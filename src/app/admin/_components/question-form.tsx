"use client";

import { useActionState } from "react";

import { buttonClass, fieldClass, labelClass, submitClass } from "@/app/_components/form";
import { duplicateQuestion, saveQuestion } from "@/lib/admin";
import { OPTION_LABELS, OPTION_SLOTS } from "@/lib/question-input";

import { FormError } from "./shell";

type Opsi = { content: string; isCorrect: boolean; position: number };

type Soal = {
  id: string;
  categoryId: string;
  prompt: string;
  explanation: string;
  difficulty: string;
  status: string;
  options: Opsi[];
  /** Sudah pernah dijawab peserta: pilihan dan kunci jawaban dibekukan. */
  locked: boolean;
};

export function QuestionForm({
  soal,
  kategori,
}: {
  soal?: Soal;
  kategori: { id: string; code: string; name: string }[];
}) {
  const [error, action, pending] = useActionState(saveQuestion, null);
  const locked = soal?.locked ?? false;
  const benarAwal = soal?.options.find((o) => o.isCorrect)?.position;

  return (
    <div className="space-y-6">
      {locked && <LockedNotice id={soal!.id} />}

      <form action={action} className="space-y-5">
        {soal && <input type="hidden" name="id" value={soal.id} />}

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="categoryId">
              Kategori
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={soal?.categoryId ?? ""}
              className={fieldClass}
            >
              <option value="" disabled>
                Pilih kategori
              </option>
              {kategori.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.code} — {k.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="difficulty">
              Tingkat kesulitan
            </label>
            <select
              id="difficulty"
              name="difficulty"
              defaultValue={soal?.difficulty ?? "medium"}
              className={fieldClass}
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={soal?.status ?? "draft"}
              className={fieldClass}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="prompt">
            Pertanyaan
          </label>
          <textarea
            id="prompt"
            name="prompt"
            required
            rows={3}
            defaultValue={soal?.prompt}
            className={fieldClass}
          />
        </div>

        <fieldset disabled={locked}>
          <legend className={labelClass}>Pilihan jawaban</legend>
          <p className="mt-1 text-xs leading-5 text-muted">
            Isi minimal dua pilihan, lalu tandai satu jawaban benar. Slot kosong diabaikan.
          </p>
          <div className="mt-3 space-y-2">
            {Array.from({ length: OPTION_SLOTS }, (_, i) => {
              const slot = i + 1;
              const isi = soal?.options.find((o) => o.position === slot);

              return (
                <div key={slot} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="benar"
                    value={slot}
                    defaultChecked={benarAwal === slot}
                    aria-label={`Tandai pilihan ${OPTION_LABELS[i]} sebagai jawaban benar`}
                    className="size-5 shrink-0 accent-brand"
                  />
                  <span className="w-6 shrink-0 font-mono text-sm font-semibold text-muted">
                    {OPTION_LABELS[i]}
                  </span>
                  <input
                    name={`opsi${slot}`}
                    defaultValue={isi?.content ?? ""}
                    placeholder={slot <= 2 ? "Wajib untuk soal terbit" : "Opsional"}
                    className={`${fieldClass} mt-0`}
                  />
                </div>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label className={labelClass} htmlFor="explanation">
            Pembahasan
          </label>
          <textarea
            id="explanation"
            name="explanation"
            required
            rows={3}
            defaultValue={soal?.explanation}
            className={fieldClass}
          />
        </div>

        <FormError message={error} />

        <button type="submit" disabled={pending} className={submitClass}>
          {pending ? "Menyimpan…" : soal ? "Simpan soal" : "Buat soal"}
        </button>
      </form>
    </div>
  );
}

/** Soal yang sudah dikerjakan: tawarkan duplikasi, bukan perubahan kunci. */
function LockedNotice({ id }: { id: string }) {
  const [error, action, pending] = useActionState(duplicateQuestion, null);

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <h2 className="text-sm font-bold text-amber-900">Soal ini sudah pernah dikerjakan</h2>
      <p className="mt-2 text-sm leading-6 text-amber-900/80">
        Pilihan jawaban dan kuncinya dibekukan agar hasil attempt lama tetap dapat dipercaya.
        Pertanyaan dan pembahasan masih bisa diperbaiki untuk salah tulis. Untuk perubahan
        substantif, duplikasi soal ini; salinan menjadi draft baru dan versi ini diarsipkan.
      </p>
      <form action={action} className="mt-4 space-y-3">
        <input type="hidden" name="id" value={id} />
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Menduplikasi…" : "Duplikasi jadi draft baru"}
        </button>
        <FormError message={error} />
      </form>
    </div>
  );
}

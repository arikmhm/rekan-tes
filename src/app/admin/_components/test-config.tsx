"use client";

import { useActionState } from "react";

import { buttonClass, fieldClass } from "@/app/_components/form";
import { addAssignment, addTestSubtest, updateTestSubtest } from "@/lib/admin";

import { FormError } from "./shell";

const smallField = `${fieldClass} mt-1 py-2`;
const smallLabel = "text-xs font-semibold text-muted";

/** Memasukkan satu subtes ke dalam tes. Posisi ditentukan server di urutan akhir. */
export function AddSubtestForm({
  testId,
  pilihan,
}: {
  testId: string;
  pilihan: { id: string; code: string; name: string }[];
}) {
  const [error, action, pending] = useActionState(addTestSubtest, null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="testId" value={testId} />
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-55 flex-1">
          <span className={smallLabel}>Subtes</span>
          <select name="subtestId" required defaultValue="" className={smallField}>
            <option value="" disabled>
              Pilih subtes
            </option>
            {pilihan.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={smallLabel}>Durasi (menit)</span>
          <input
            name="durationMinutes"
            type="number"
            min={1}
            defaultValue={30}
            required
            className={`${smallField} w-32`}
          />
        </label>
        <label>
          <span className={smallLabel}>Jumlah soal</span>
          <input
            name="questionLimit"
            type="number"
            min={1}
            defaultValue={10}
            required
            className={`${smallField} w-32`}
          />
        </label>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Menambahkan…" : "Tambah subtes"}
        </button>
      </div>
      <FormError message={error} />
    </form>
  );
}

/** Durasi dan jumlah soal satu subtes di dalam tes. */
export function SubtestConfigForm({
  id,
  durationSeconds,
  questionLimit,
}: {
  id: string;
  durationSeconds: number;
  questionLimit: number;
}) {
  const [error, action, pending] = useActionState(updateTestSubtest, null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap items-end gap-3">
        <label>
          <span className={smallLabel}>Durasi (menit)</span>
          <input
            name="durationMinutes"
            type="number"
            min={1}
            defaultValue={Math.round(durationSeconds / 60)}
            required
            className={`${smallField} w-32`}
          />
        </label>
        <label>
          <span className={smallLabel}>Jumlah soal</span>
          <input
            name="questionLimit"
            type="number"
            min={1}
            defaultValue={questionLimit}
            required
            className={`${smallField} w-32`}
          />
        </label>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Menyimpan…" : "Simpan konfigurasi"}
        </button>
      </div>
      <FormError message={error} />
    </form>
  );
}

/**
 * Menugaskan satu soal ke subtes. Daftar pilihan sudah dibatasi ke soal terbit
 * yang sekategori dengan subtes; server memeriksa ulang keduanya.
 */
export function AddAssignmentForm({
  testSubtestId,
  candidates,
}: {
  testSubtestId: string;
  candidates: { id: string; prompt: string }[];
}) {
  const [error, action, pending] = useActionState(addAssignment, null);

  if (candidates.length === 0) {
    return (
      <p className="text-sm text-muted">
        Tidak ada soal terbit lain pada kategori subtes ini. Terbitkan soal baru di bank soal.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="testSubtestId" value={testSubtestId} />
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-55 flex-1">
          <span className={smallLabel}>Soal</span>
          <select name="questionId" required defaultValue="" className={smallField}>
            <option value="" disabled>
              Pilih soal
            </option>
            {candidates.map((q) => (
              <option key={q.id} value={q.id}>
                {q.prompt.length > 80 ? `${q.prompt.slice(0, 80)}…` : q.prompt}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={smallLabel}>Bobot</span>
          <input
            name="weight"
            type="number"
            min={1}
            defaultValue={1}
            required
            className={`${smallField} w-24`}
          />
        </label>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Menugaskan…" : "Tugaskan soal"}
        </button>
      </div>
      <FormError message={error} />
    </form>
  );
}

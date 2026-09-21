"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Pilihan } from "./pilihan";
import { addAssignment, addTestSubtest, updateTestSubtest } from "@/lib/admin";

import { FormError } from "./shell";

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
    <form action={action} className="grid gap-3">
      <input type="hidden" name="testId" value={testId} />
      <div className="flex flex-wrap items-end gap-3">
        <Field className="min-w-56 flex-1">
          <FieldLabel htmlFor={`add-sub-${testId}`}>Subtes</FieldLabel>
          <Pilihan
            id={`add-sub-${testId}`}
            name="subtestId"
            required
            placeholder="Pilih subtes"
            opsi={pilihan.map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` }))}
          />
        </Field>
        <Field className="w-32">
          <FieldLabel htmlFor={`add-dur-${testId}`}>Durasi (menit)</FieldLabel>
          <Input id={`add-dur-${testId}`} name="durationMinutes" type="number" min={1} defaultValue={30} required />
        </Field>
        <Field className="w-32">
          <FieldLabel htmlFor={`add-lim-${testId}`}>Jumlah soal</FieldLabel>
          <Input id={`add-lim-${testId}`} name="questionLimit" type="number" min={1} defaultValue={10} required />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Menambahkan…" : "Tambah subtes"}
        </Button>
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
    <form action={action} className="grid gap-3">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap items-end gap-3">
        <Field className="w-32">
          <FieldLabel htmlFor={`dur-${id}`}>Durasi (menit)</FieldLabel>
          <Input
            id={`dur-${id}`}
            name="durationMinutes"
            type="number"
            min={1}
            defaultValue={Math.round(durationSeconds / 60)}
            required
          />
        </Field>
        <Field className="w-32">
          <FieldLabel htmlFor={`lim-${id}`}>Jumlah soal</FieldLabel>
          <Input
            id={`lim-${id}`}
            name="questionLimit"
            type="number"
            min={1}
            defaultValue={questionLimit}
            required
          />
        </Field>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan konfigurasi"}
        </Button>
      </div>
      <FormError message={error} />
    </form>
  );
}

/**
 * Menugaskan soal ke subtes. Daftar sudah dibatasi ke soal terbit yang
 * sekategori dengan subtes; server memeriksa ulang keduanya. Dicentang banyak
 * sekaligus karena mengisi satu subtes bisa berarti puluhan soal.
 */
export function AddAssignmentForm({
  testSubtestId,
  candidates,
  kurang,
}: {
  testSubtestId: string;
  candidates: { id: string; prompt: string; difficulty: string }[];
  kurang: number;
}) {
  const [error, action, pending] = useActionState(addAssignment, null);

  if (candidates.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Tidak ada soal terbit lain pada kategori subtes ini. Terbitkan soal baru di bank soal.
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="testSubtestId" value={testSubtestId} />
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">Tugaskan soal</p>
        <p className="text-muted-foreground text-xs">
          {kurang > 0 ? `kurang ${kurang} soal` : "target sudah terpenuhi"} &middot;{" "}
          {candidates.length} kandidat
        </p>
      </div>
      <div className="max-h-72 divide-y overflow-y-auto rounded-lg border">
        {candidates.map((q) => (
          <label
            key={q.id}
            className="hover:bg-muted/40 flex cursor-pointer items-start gap-3 p-2.5 text-sm"
          >
            <input
              type="checkbox"
              name="questionId"
              value={q.id}
              className="accent-primary mt-0.5 size-4 shrink-0"
            />
            <span className="line-clamp-2 min-w-0 flex-1">{q.prompt}</span>
            <span className="text-muted-foreground shrink-0 font-mono text-xs">{q.difficulty}</span>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <Field className="w-24">
          <FieldLabel htmlFor={`w-${testSubtestId}`}>Bobot</FieldLabel>
          <Input id={`w-${testSubtestId}`} name="weight" type="number" min={1} defaultValue={1} required />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Menugaskan…" : "Tugaskan soal terpilih"}
        </Button>
      </div>
      <FormError message={error} />
    </form>
  );
}

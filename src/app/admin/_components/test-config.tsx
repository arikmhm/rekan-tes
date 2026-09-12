"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
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
        <div className="grid min-w-56 flex-1 gap-2">
          <Label htmlFor={`add-sub-${testId}`}>Subtes</Label>
          <SelectNative id={`add-sub-${testId}`} name="subtestId" required defaultValue="">
            <option value="" disabled>
              Pilih subtes
            </option>
            {pilihan.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </SelectNative>
        </div>
        <div className="grid w-32 gap-2">
          <Label htmlFor={`add-dur-${testId}`}>Durasi (menit)</Label>
          <Input id={`add-dur-${testId}`} name="durationMinutes" type="number" min={1} defaultValue={30} required />
        </div>
        <div className="grid w-32 gap-2">
          <Label htmlFor={`add-lim-${testId}`}>Jumlah soal</Label>
          <Input id={`add-lim-${testId}`} name="questionLimit" type="number" min={1} defaultValue={10} required />
        </div>
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
        <div className="grid w-32 gap-2">
          <Label htmlFor={`dur-${id}`}>Durasi (menit)</Label>
          <Input
            id={`dur-${id}`}
            name="durationMinutes"
            type="number"
            min={1}
            defaultValue={Math.round(durationSeconds / 60)}
            required
          />
        </div>
        <div className="grid w-32 gap-2">
          <Label htmlFor={`lim-${id}`}>Jumlah soal</Label>
          <Input
            id={`lim-${id}`}
            name="questionLimit"
            type="number"
            min={1}
            defaultValue={questionLimit}
            required
          />
        </div>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan konfigurasi"}
        </Button>
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
      <p className="text-muted-foreground text-sm">
        Tidak ada soal terbit lain pada kategori subtes ini. Terbitkan soal baru di bank soal.
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="testSubtestId" value={testSubtestId} />
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid min-w-56 flex-1 gap-2">
          <Label htmlFor={`q-${testSubtestId}`}>Soal</Label>
          <SelectNative id={`q-${testSubtestId}`} name="questionId" required defaultValue="">
            <option value="" disabled>
              Pilih soal
            </option>
            {candidates.map((q) => (
              <option key={q.id} value={q.id}>
                {q.prompt.length > 80 ? `${q.prompt.slice(0, 80)}…` : q.prompt}
              </option>
            ))}
          </SelectNative>
        </div>
        <div className="grid w-24 gap-2">
          <Label htmlFor={`w-${testSubtestId}`}>Bobot</Label>
          <Input id={`w-${testSubtestId}`} name="weight" type="number" min={1} defaultValue={1} required />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Menugaskan…" : "Tugaskan soal"}
        </Button>
      </div>
      <FormError message={error} />
    </form>
  );
}

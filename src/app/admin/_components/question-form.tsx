"use client";

import { useActionState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pilihan } from "./pilihan";
import { Textarea } from "@/components/ui/textarea";
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

const STATUS = ["draft", "published", "archived"];
const DIFFICULTY = ["easy", "medium", "hard"];

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
    <div className="grid gap-6">
      {locked && <LockedNotice id={soal!.id} />}

      <form action={action} className="grid gap-6">
        {soal && <input type="hidden" name="id" value={soal.id} />}

        <Card>
          <CardHeader>
            <CardTitle>Pertanyaan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="categoryId">Kategori</Label>
                <Pilihan
                  id="categoryId"
                  name="categoryId"
                  required
                  placeholder="Pilih kategori"
                  defaultValue={soal?.categoryId ?? ""}
                  opsi={kategori.map((k) => ({ value: k.id, label: `${k.code} — ${k.name}` }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="difficulty">Tingkat kesulitan</Label>
                <Pilihan
                  id="difficulty"
                  name="difficulty"
                  defaultValue={soal?.difficulty ?? "medium"}
                  opsi={DIFFICULTY.map((d) => ({ value: d, label: d }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Pilihan
                  id="status"
                  name="status"
                  defaultValue={soal?.status ?? "draft"}
                  opsi={STATUS.map((s) => ({ value: s, label: s }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prompt">Isi pertanyaan</Label>
              <Textarea id="prompt" name="prompt" required rows={4} defaultValue={soal?.prompt} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pilihan jawaban</CardTitle>
            <p className="text-muted-foreground text-sm">
              Isi minimal dua pilihan lalu tandai satu jawaban benar. Slot kosong diabaikan.
            </p>
          </CardHeader>
          <CardContent>
            <fieldset disabled={locked} className="grid gap-2.5">
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
                      className="accent-primary size-4 shrink-0"
                    />
                    <span className="text-muted-foreground w-5 shrink-0 font-mono text-sm font-semibold">
                      {OPTION_LABELS[i]}
                    </span>
                    <Input
                      name={`opsi${slot}`}
                      defaultValue={isi?.content ?? ""}
                      placeholder={slot <= 2 ? "Wajib untuk soal terbit" : "Opsional"}
                    />
                  </div>
                );
              })}
            </fieldset>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pembahasan</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="explanation"
              name="explanation"
              required
              rows={4}
              defaultValue={soal?.explanation}
              aria-label="Pembahasan"
            />
          </CardContent>
        </Card>

        <FormError message={error} />

        <div>
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Menyimpan…" : soal ? "Simpan soal" : "Buat soal"}
          </Button>
        </div>
      </form>
    </div>
  );
}

/** Soal yang sudah dikerjakan: tawarkan duplikasi, bukan perubahan kunci. */
function LockedNotice({ id }: { id: string }) {
  const [error, action, pending] = useActionState(duplicateQuestion, null);

  return (
    <Alert className="border-amber-300 bg-amber-50 text-amber-900">
      <AlertTitle>Soal ini sudah pernah dikerjakan</AlertTitle>
      <AlertDescription className="text-amber-900/80">
        <p>
          Pilihan jawaban dan kuncinya dibekukan agar hasil attempt lama tetap dapat dipercaya.
          Pertanyaan dan pembahasan masih bisa diperbaiki untuk salah tulis. Untuk perubahan
          substantif, duplikasi soal ini; salinan menjadi draft baru dan versi ini diarsipkan.
        </p>
        <form action={action} className="mt-3 grid gap-3">
          <input type="hidden" name="id" value={id} />
          <Button type="submit" variant="outline" disabled={pending} className="w-fit">
            {pending ? "Menduplikasi…" : "Duplikasi jadi draft baru"}
          </Button>
          <FormError message={error} />
        </form>
      </AlertDescription>
    </Alert>
  );
}

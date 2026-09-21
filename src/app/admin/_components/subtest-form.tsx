"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Pilihan } from "./pilihan";
import { saveSubtest } from "@/lib/admin";

import { FormError, StatusBadge } from "./shell";

type Subtes = {
  id: string;
  categoryId: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
  categoryCode: string;
};

type Kategori = { id: string; code: string; name: string };

const STATUS = ["draft", "published", "archived"];

/** Formulir satu subtes: dipakai untuk membuat maupun menyunting. */
export function SubtestForm({ subtes, kategori }: { subtes?: Subtes; kategori: Kategori[] }) {
  const [error, action, pending] = useActionState(saveSubtest, null);
  const uid = subtes?.id ?? "baru";

  return (
    <form action={action} className="grid gap-4">
      {subtes && <input type="hidden" name="id" value={subtes.id} />}

      <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
        <Field>
          <FieldLabel htmlFor={`st-code-${uid}`}>Kode</FieldLabel>
          <Input
            id={`st-code-${uid}`}
            name="code"
            required
            defaultValue={subtes?.code}
            placeholder="TIU_NUM"
            className="uppercase"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`st-name-${uid}`}>Nama</FieldLabel>
          <Input
            id={`st-name-${uid}`}
            name="name"
            required
            defaultValue={subtes?.name}
            placeholder="Kemampuan Numerik"
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor={`st-desc-${uid}`}>Deskripsi</FieldLabel>
        <Input
          id={`st-desc-${uid}`}
          name="description"
          defaultValue={subtes?.description ?? ""}
          placeholder="Opsional, tampil pada detail tes"
        />
      </Field>

      <div className="flex flex-wrap items-end gap-3">
        <Field className="min-w-56 flex-1">
          <FieldLabel htmlFor={`st-cat-${uid}`}>Kategori soal</FieldLabel>
          <Pilihan
            id={`st-cat-${uid}`}
            name="categoryId"
            required
            placeholder="Pilih kategori"
            defaultValue={subtes?.categoryId ?? ""}
            opsi={kategori.map((k) => ({ value: k.id, label: `${k.code} — ${k.name}` }))}
          />
        </Field>
        <Field className="w-40">
          <FieldLabel htmlFor={`st-status-${uid}`}>Status</FieldLabel>
          <Pilihan
            id={`st-status-${uid}`}
            name="status"
            defaultValue={subtes?.status ?? "draft"}
            opsi={STATUS.map((s) => ({ value: s, label: s }))}
          />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : subtes ? "Simpan perubahan" : "Tambah subtes"}
        </Button>
      </div>

      <FormError message={error} />
    </form>
  );
}

export function SubtestRow({ subtes, kategori }: { subtes: Subtes; kategori: Kategori[] }) {
  return (
    <details className="group bg-card rounded-xl border">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4 hover:bg-muted/40">
        <code className="bg-muted rounded px-2 py-1 font-mono text-xs font-semibold">
          {subtes.code}
        </code>
        <span className="font-medium">{subtes.name}</span>
        <span className="text-muted-foreground text-xs">kategori {subtes.categoryCode}</span>
        <StatusBadge status={subtes.status} />
        <span className="text-muted-foreground ml-auto text-xs group-open:hidden">Sunting</span>
      </summary>
      <div className="border-t p-4">
        <SubtestForm subtes={subtes} kategori={kategori} />
      </div>
    </details>
  );
}

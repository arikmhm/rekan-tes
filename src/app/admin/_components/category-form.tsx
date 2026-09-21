"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Pilihan } from "./pilihan";
import { saveCategory } from "@/lib/admin";

import { FormError, StatusBadge } from "./shell";

type Kategori = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
};

const STATUS = ["draft", "published", "archived"];

/** Formulir satu kategori: dipakai untuk membuat maupun menyunting. */
export function CategoryForm({ kategori }: { kategori?: Kategori }) {
  const [error, action, pending] = useActionState(saveCategory, null);
  const uid = kategori?.id ?? "baru";

  return (
    <form action={action} className="grid gap-4">
      {kategori && <input type="hidden" name="id" value={kategori.id} />}

      <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
        <Field>
          <FieldLabel htmlFor={`code-${uid}`}>Kode</FieldLabel>
          <Input
            id={`code-${uid}`}
            name="code"
            required
            defaultValue={kategori?.code}
            placeholder="NUM"
            className="uppercase"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`name-${uid}`}>Nama</FieldLabel>
          <Input
            id={`name-${uid}`}
            name="name"
            required
            defaultValue={kategori?.name}
            placeholder="Numerik"
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor={`desc-${uid}`}>Deskripsi</FieldLabel>
        <Input
          id={`desc-${uid}`}
          name="description"
          defaultValue={kategori?.description ?? ""}
          placeholder="Opsional"
        />
      </Field>

      <div className="flex flex-wrap items-end gap-3">
        <Field className="w-40">
          <FieldLabel htmlFor={`status-${uid}`}>Status</FieldLabel>
          <Pilihan
            id={`status-${uid}`}
            name="status"
            defaultValue={kategori?.status ?? "draft"}
            opsi={STATUS.map((s) => ({ value: s, label: s }))}
          />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : kategori ? "Simpan perubahan" : "Tambah kategori"}
        </Button>
      </div>

      <FormError message={error} />
    </form>
  );
}

export function CategoryRow({ kategori }: { kategori: Kategori }) {
  return (
    <details className="group bg-card rounded-xl border">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4 hover:bg-muted/40">
        <code className="bg-muted rounded px-2 py-1 font-mono text-xs font-semibold">
          {kategori.code}
        </code>
        <span className="font-medium">{kategori.name}</span>
        <StatusBadge status={kategori.status} />
        <span className="text-muted-foreground ml-auto text-xs group-open:hidden">Sunting</span>
      </summary>
      <div className="border-t p-4">
        <CategoryForm kategori={kategori} />
      </div>
    </details>
  );
}

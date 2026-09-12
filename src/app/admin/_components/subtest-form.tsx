"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
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
        <div className="grid gap-2">
          <Label htmlFor={`st-code-${uid}`}>Kode</Label>
          <Input
            id={`st-code-${uid}`}
            name="code"
            required
            defaultValue={subtes?.code}
            placeholder="TIU_NUM"
            className="uppercase"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`st-name-${uid}`}>Nama</Label>
          <Input
            id={`st-name-${uid}`}
            name="name"
            required
            defaultValue={subtes?.name}
            placeholder="Kemampuan Numerik"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`st-desc-${uid}`}>Deskripsi</Label>
        <Input
          id={`st-desc-${uid}`}
          name="description"
          defaultValue={subtes?.description ?? ""}
          placeholder="Opsional, tampil pada detail tes"
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="grid min-w-56 flex-1 gap-2">
          <Label htmlFor={`st-cat-${uid}`}>Kategori soal</Label>
          <SelectNative
            id={`st-cat-${uid}`}
            name="categoryId"
            required
            defaultValue={subtes?.categoryId ?? ""}
          >
            <option value="" disabled>
              Pilih kategori
            </option>
            {kategori.map((k) => (
              <option key={k.id} value={k.id}>
                {k.code} — {k.name}
              </option>
            ))}
          </SelectNative>
        </div>
        <div className="grid w-40 gap-2">
          <Label htmlFor={`st-status-${uid}`}>Status</Label>
          <SelectNative id={`st-status-${uid}`} name="status" defaultValue={subtes?.status ?? "draft"}>
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectNative>
        </div>
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

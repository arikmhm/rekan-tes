"use client";

import { useActionState } from "react";

import { buttonClass, fieldClass, labelClass } from "@/app/_components/form";
import { saveCategory } from "@/lib/admin";

import { FormError, StatusBadge } from "../_components/shell";

type Kategori = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
};

/** Formulir satu kategori: dipakai untuk membuat maupun menyunting. */
export function CategoryForm({ kategori }: { kategori?: Kategori }) {
  const [error, action, pending] = useActionState(saveCategory, null);

  return (
    <form action={action} className="space-y-4">
      {kategori && <input type="hidden" name="id" value={kategori.id} />}

      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        <div>
          <label className={labelClass} htmlFor={`code-${kategori?.id ?? "baru"}`}>
            Kode
          </label>
          <input
            id={`code-${kategori?.id ?? "baru"}`}
            name="code"
            required
            defaultValue={kategori?.code}
            placeholder="NUM"
            className={`${fieldClass} uppercase`}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`name-${kategori?.id ?? "baru"}`}>
            Nama
          </label>
          <input
            id={`name-${kategori?.id ?? "baru"}`}
            name="name"
            required
            defaultValue={kategori?.name}
            placeholder="Numerik"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor={`desc-${kategori?.id ?? "baru"}`}>
          Deskripsi
        </label>
        <input
          id={`desc-${kategori?.id ?? "baru"}`}
          name="description"
          defaultValue={kategori?.description ?? ""}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className={labelClass} htmlFor={`status-${kategori?.id ?? "baru"}`}>
            Status
          </label>
          <select
            id={`status-${kategori?.id ?? "baru"}`}
            name="status"
            defaultValue={kategori?.status ?? "draft"}
            className={fieldClass}
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </div>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Menyimpan…" : kategori ? "Simpan perubahan" : "Tambah kategori"}
        </button>
      </div>

      <FormError message={error} />
    </form>
  );
}

export function CategoryRow({ kategori }: { kategori: Kategori }) {
  return (
    <details className="rounded-2xl border border-black/8 bg-white">
      <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-5">
        <code className="rounded-lg bg-cream px-2 py-1 text-xs font-semibold">{kategori.code}</code>
        <span className="font-semibold">{kategori.name}</span>
        <StatusBadge status={kategori.status} />
      </summary>
      <div className="border-t border-black/8 p-5">
        <CategoryForm kategori={kategori} />
      </div>
    </details>
  );
}

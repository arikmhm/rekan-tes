"use client";

import { useActionState } from "react";

import { buttonClass, fieldClass, labelClass } from "@/app/_components/form";
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

/** Formulir satu subtes: dipakai untuk membuat maupun menyunting. */
export function SubtestForm({
  subtes,
  kategori,
}: {
  subtes?: Subtes;
  kategori: { id: string; code: string; name: string }[];
}) {
  const [error, action, pending] = useActionState(saveSubtest, null);
  const suffix = subtes?.id ?? "baru";

  return (
    <form action={action} className="space-y-4">
      {subtes && <input type="hidden" name="id" value={subtes.id} />}

      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        <div>
          <label className={labelClass} htmlFor={`st-code-${suffix}`}>
            Kode
          </label>
          <input
            id={`st-code-${suffix}`}
            name="code"
            required
            defaultValue={subtes?.code}
            placeholder="TIU_NUM"
            className={`${fieldClass} uppercase`}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`st-name-${suffix}`}>
            Nama
          </label>
          <input
            id={`st-name-${suffix}`}
            name="name"
            required
            defaultValue={subtes?.name}
            placeholder="Kemampuan Numerik"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor={`st-desc-${suffix}`}>
          Deskripsi
        </label>
        <input
          id={`st-desc-${suffix}`}
          name="description"
          defaultValue={subtes?.description ?? ""}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className={labelClass} htmlFor={`st-cat-${suffix}`}>
            Kategori soal
          </label>
          <select
            id={`st-cat-${suffix}`}
            name="categoryId"
            required
            defaultValue={subtes?.categoryId ?? ""}
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
          <label className={labelClass} htmlFor={`st-status-${suffix}`}>
            Status
          </label>
          <select
            id={`st-status-${suffix}`}
            name="status"
            defaultValue={subtes?.status ?? "draft"}
            className={fieldClass}
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </div>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Menyimpan…" : subtes ? "Simpan perubahan" : "Tambah subtes"}
        </button>
      </div>

      <FormError message={error} />
    </form>
  );
}

export function SubtestRow({
  subtes,
  kategori,
}: {
  subtes: Subtes;
  kategori: { id: string; code: string; name: string }[];
}) {
  return (
    <details className="rounded-2xl border border-black/8 bg-white">
      <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-5">
        <code className="rounded-lg bg-cream px-2 py-1 text-xs font-semibold">{subtes.code}</code>
        <span className="font-semibold">{subtes.name}</span>
        <span className="text-xs text-muted">kategori {subtes.categoryCode}</span>
        <StatusBadge status={subtes.status} />
      </summary>
      <div className="border-t border-black/8 p-5">
        <SubtestForm subtes={subtes} kategori={kategori} />
      </div>
    </details>
  );
}

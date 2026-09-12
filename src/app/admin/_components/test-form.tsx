"use client";

import { useActionState } from "react";

import { fieldClass, labelClass, submitClass } from "@/app/_components/form";
import { saveTest } from "@/lib/admin";

import { FormError } from "./shell";

type Tes = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceAmount: number;
  status: string;
};

/**
 * Formulir produk tes. Status `published` hanya diterima server bila seluruh
 * subtes sudah lengkap, jadi tombol ini juga berfungsi sebagai tombol terbit.
 */
export function TestForm({ tes }: { tes?: Tes }) {
  const [error, action, pending] = useActionState(saveTest, null);
  const suffix = tes?.id ?? "baru";

  return (
    <form action={action} className="space-y-5">
      {tes && <input type="hidden" name="id" value={tes.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor={`tes-name-${suffix}`}>
            Nama tes
          </label>
          <input
            id={`tes-name-${suffix}`}
            name="name"
            required
            defaultValue={tes?.name}
            placeholder="Simulasi Tes Masuk Bank"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`tes-slug-${suffix}`}>
            Slug
          </label>
          <input
            id={`tes-slug-${suffix}`}
            name="slug"
            required
            defaultValue={tes?.slug}
            placeholder="simulasi-tes-masuk-bank"
            className={`${fieldClass} lowercase`}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor={`tes-desc-${suffix}`}>
          Deskripsi
        </label>
        <textarea
          id={`tes-desc-${suffix}`}
          name="description"
          required
          rows={3}
          defaultValue={tes?.description}
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor={`tes-price-${suffix}`}>
            Harga (rupiah)
          </label>
          <input
            id={`tes-price-${suffix}`}
            name="priceAmount"
            type="number"
            min={0}
            step={1000}
            required
            defaultValue={tes?.priceAmount ?? 0}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`tes-status-${suffix}`}>
            Status
          </label>
          <select
            id={`tes-status-${suffix}`}
            name="status"
            defaultValue={tes?.status ?? "draft"}
            className={fieldClass}
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </div>
      </div>

      <FormError message={error} />

      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? "Menyimpan…" : tes ? "Simpan tes" : "Buat tes"}
      </button>
    </form>
  );
}

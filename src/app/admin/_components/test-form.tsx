"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Pilihan } from "./pilihan";
import { Textarea } from "@/components/ui/textarea";
import { saveTest } from "@/lib/admin";

import { FormError } from "./shell";

type Tes = {
  id: string;
  name: string;
  description: string;
  priceAmount: number;
  status: string;
};

const STATUS = ["draft", "published", "archived"];

/**
 * Formulir produk tes. Status `published` hanya diterima server bila seluruh
 * subtes sudah lengkap, jadi tombol ini juga berfungsi sebagai tombol terbit.
 */
export function TestForm({ tes }: { tes?: Tes }) {
  const [error, action, pending] = useActionState(saveTest, null);
  const uid = tes?.id ?? "baru";

  return (
    <form action={action} className="grid gap-5">
      {tes && <input type="hidden" name="id" value={tes.id} />}

      <Field>
        <FieldLabel htmlFor={`tes-name-${uid}`}>Nama tes</FieldLabel>
        <Input
          id={`tes-name-${uid}`}
          name="name"
          required
          defaultValue={tes?.name}
          placeholder="Simulasi Tes Masuk Bank"
        />
        {!tes && (
          <FieldDescription>
            Alamat halaman dibuat otomatis dari nama ini, lalu tidak berubah lagi.
          </FieldDescription>
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor={`tes-desc-${uid}`}>Deskripsi</FieldLabel>
        <Textarea
          id={`tes-desc-${uid}`}
          name="description"
          required
          rows={3}
          defaultValue={tes?.description}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`tes-price-${uid}`}>Harga (rupiah)</FieldLabel>
          <Input
            id={`tes-price-${uid}`}
            name="priceAmount"
            type="number"
            min={0}
            step={1000}
            required
            defaultValue={tes?.priceAmount ?? 0}
          />
        </Field>
        {/* Produk baru selalu lahir sebagai draft — server menolak status lain
            sebelum subtes dan soalnya lengkap — jadi pilihannya baru muncul
            saat menyunting. Penerbitan sendiri dilakukan di langkah terakhir. */}
        {tes && (
          <Field>
            <FieldLabel htmlFor={`tes-status-${uid}`}>Status</FieldLabel>
            <Pilihan
              id={`tes-status-${uid}`}
              name="status"
              defaultValue={tes.status}
              opsi={STATUS.map((s) => ({ value: s, label: s }))}
            />
          </Field>
        )}
      </div>

      <FormError message={error} />

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : tes ? "Simpan tes" : "Buat tes"}
        </Button>
      </div>
    </form>
  );
}

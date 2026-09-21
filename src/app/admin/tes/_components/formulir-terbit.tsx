"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { saveTest } from "@/lib/admin";

import { FormError } from "../../_components/shell";

type Tes = {
  id: string;
  name: string;
  description: string;
  priceAmount: number;
  status: string;
};

/**
 * Langkah terakhir: satu ceklis yang menentukan produk terbit atau tetap draft.
 * `saveTest` menyimpan seluruh kolom produk, jadi nilai yang tidak diubah
 * dikirim ulang apa adanya — dan pemeriksaan kelengkapan sebelum terbit tetap
 * berjalan di dalam transaksi yang sama seperti dari formulir informasi.
 *
 * Ceklis yang dilepas pada produk yang sudah terbit berarti menariknya kembali
 * dari etalase; satu kendali untuk dua arah, bukan dua tombol berbeda.
 */
export function FormulirTerbit({ tes }: { tes: Tes }) {
  const [error, action, pending] = useActionState(saveTest, null);
  const [terbit, setTerbit] = useState(tes.status === "published");

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="id" value={tes.id} />
      <input type="hidden" name="name" value={tes.name} />
      <input type="hidden" name="description" value={tes.description} />
      <input type="hidden" name="priceAmount" value={tes.priceAmount} />
      <input type="hidden" name="status" value={terbit ? "published" : "draft"} />

      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={terbit}
          onChange={(e) => setTerbit(e.target.checked)}
          className="accent-primary mt-0.5 size-4"
        />
        <span>
          Terbitkan produk sekarang
          <span className="text-muted-foreground block text-xs">
            Tanpa ceklis, produk tersimpan sebagai draft dan belum tampil di etalase.
          </span>
        </span>
      </label>

      <FormError message={error} />

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan status"}
        </Button>
      </div>
    </form>
  );
}

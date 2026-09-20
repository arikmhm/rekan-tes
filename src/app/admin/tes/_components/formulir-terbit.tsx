"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { saveTest } from "@/lib/admin";

import { FormError } from "../../_components/shell";

type Tes = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceAmount: number;
};

/**
 * Mengubah status produk tanpa meninggalkan langkah terakhir. `saveTest`
 * menyimpan seluruh kolom produk, jadi nilai yang tidak diubah dikirim ulang
 * apa adanya — dan pemeriksaan kelengkapan sebelum terbit tetap berjalan di
 * dalam transaksi yang sama seperti dari formulir informasi.
 */
export function FormulirTerbit({
  tes,
  tujuan,
  label,
  variant,
}: {
  tes: Tes;
  tujuan: string;
  label: string;
  variant?: "outline";
}) {
  const [error, action, pending] = useActionState(saveTest, null);

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="id" value={tes.id} />
      <input type="hidden" name="name" value={tes.name} />
      <input type="hidden" name="slug" value={tes.slug} />
      <input type="hidden" name="description" value={tes.description} />
      <input type="hidden" name="priceAmount" value={tes.priceAmount} />
      <input type="hidden" name="status" value={tujuan} />

      <FormError message={error} />

      <div>
        <Button type="submit" variant={variant} disabled={pending}>
          {pending ? "Menyimpan…" : label}
        </Button>
      </div>
    </form>
  );
}

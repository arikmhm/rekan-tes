"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { grantReplacementAccess } from "@/lib/admin-order";

import { FormError } from "./shell";

/**
 * Memberi akses pengganti. Alasannya wajib dan tersimpan permanen pada order
 * baru, jadi formulir ini menyebutkan konsekuensinya sebelum ditekan, bukan
 * sesudah.
 */
export function GrantAccessForm({ orderId }: { orderId: string }) {
  const [error, action, pending] = useActionState(grantReplacementAccess, null);

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="orderId" value={orderId} />

      <Field>
        <FieldLabel htmlFor="reason">Alasan penggantian</FieldLabel>
        <Textarea
          id="reason"
          name="reason"
          required
          minLength={10}
          maxLength={500}
          rows={3}
          placeholder="Contoh: server tidak dapat diakses saat peserta mengerjakan subtes kedua, dilaporkan lewat email 13 September."
        />
        <FieldDescription className="leading-5">
          Alasan tersimpan permanen pada pesanan pengganti bersama nama admin pemberinya. Pesanan
          lama beserta hasilnya tidak diubah maupun dihapus.
        </FieldDescription>
      </Field>

      <FormError message={error} />

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Memberikan…" : "Beri akses pengganti"}
        </Button>
      </div>
    </form>
  );
}

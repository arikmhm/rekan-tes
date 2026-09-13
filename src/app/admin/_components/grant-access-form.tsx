"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

      <div className="grid gap-2">
        <Label htmlFor="reason">Alasan penggantian</Label>
        <Textarea
          id="reason"
          name="reason"
          required
          minLength={10}
          maxLength={500}
          rows={3}
          placeholder="Contoh: server tidak dapat diakses saat peserta mengerjakan subtes kedua, dilaporkan lewat email 13 September."
        />
        <p className="text-muted-foreground text-xs leading-5">
          Alasan tersimpan permanen pada pesanan pengganti bersama nama admin pemberinya. Pesanan
          lama beserta hasilnya tidak diubah maupun dihapus.
        </p>
      </div>

      <FormError message={error} />

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Memberikan…" : "Beri akses pengganti"}
        </Button>
      </div>
    </form>
  );
}

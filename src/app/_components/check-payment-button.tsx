"use client";

import { useActionState } from "react";

import { checkPaymentStatus } from "@/lib/order";

/**
 * Backup manual selain webhook. Peserta menekan tombol ini untuk menanyakan
 * status transaksi langsung ke DOKU, dipakai bila status belum berubah
 * padahal pembayaran sudah selesai.
 */
export function CheckPaymentButton({ orderId }: { orderId: string }) {
  const [pesan, action, pending] = useActionState(checkPaymentStatus, null);

  return (
    <form action={action} className="mt-4">
      <input type="hidden" name="orderId" value={orderId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full border border-brand/30 bg-white px-6 py-3 text-sm font-bold text-brand-dark transition hover:bg-mint disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Memeriksa…" : "Cek status pembayaran"}
      </button>
      {pesan && (
        <p role="status" className="mt-3 text-sm leading-6 text-muted-foreground">
          {pesan}
        </p>
      )}
    </form>
  );
}

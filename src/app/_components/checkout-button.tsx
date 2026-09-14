"use client";

import { useActionState } from "react";

import { startCheckout } from "@/lib/order";

/**
 * Tombol beli. Harga tidak ikut dikirim: server membacanya sendiri dari slug,
 * sehingga nilai apa pun dari peramban tidak dapat memengaruhi order.
 */
export function CheckoutButton({ slug }: { slug: string }) {
  const [error, action, pending] = useActionState(startCheckout, null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-lg bg-brand px-6 text-sm font-normal text-white transition-colors hover:bg-brand-orange disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Menyiapkan QRIS…" : "Bayar dengan QRIS"}
      </button>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
    </form>
  );
}

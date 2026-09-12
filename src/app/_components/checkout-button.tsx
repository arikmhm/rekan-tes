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
        className="w-full rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Menyiapkan pembayaran…" : "Beli sesi ini"}
      </button>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}

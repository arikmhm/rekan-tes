import "server-only";

import { and, eq, ne } from "drizzle-orm";

import { db, schema } from "@/db";

import { ACCESS_DAYS } from "./catalog";
import type { QrisNotification } from "./doku";

export type ActivationResult =
  | { result: "activated" }
  | { result: "already_paid" }
  | { result: "not_found" }
  | { result: "amount_mismatch"; expected: number };

/**
 * Mengaktifkan order dan memberi satu attempt setelah notifikasi QRIS `SUCCESS`
 * tervalidasi tanda tangannya. Invoice dan nominal dicocokkan sebelum
 * perubahan apa pun; keduanya sumber kebenaran, bukan yang dikirim notifikasi.
 */
export async function activatePayment(notif: QrisNotification): Promise<ActivationResult> {
  return db.transaction(async (tx) => {
    const [payment] = await tx
      .select({ id: schema.payments.id, orderId: schema.payments.orderId, amount: schema.payments.amount })
      .from(schema.payments)
      .where(and(eq(schema.payments.provider, "doku"), eq(schema.payments.externalId, notif.invoiceNumber)));

    if (!payment) return { result: "not_found" };
    if (payment.amount !== notif.amount) return { result: "amount_mismatch", expected: payment.amount };

    // Guard idempotency yang sebenarnya: baris hanya berubah bila belum
    // `paid`. Notifikasi duplikat atau yang datang bersamaan akan kalah di
    // kunci baris ini dan tidak pernah memberi attempt kedua.
    const diperbarui = await tx
      .update(schema.payments)
      .set({ status: "paid", paidAt: new Date(), updatedAt: new Date() })
      .where(and(eq(schema.payments.id, payment.id), ne(schema.payments.status, "paid")))
      .returning({ id: schema.payments.id });

    if (diperbarui.length === 0) return { result: "already_paid" };

    await tx
      .update(schema.orders)
      .set({
        status: "paid",
        accessExpiresAt: new Date(Date.now() + ACCESS_DAYS * 24 * 60 * 60_000),
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, payment.orderId));

    await tx.insert(schema.testAttempts).values({ orderId: payment.orderId }).onConflictDoNothing();

    return { result: "activated" };
  });
}

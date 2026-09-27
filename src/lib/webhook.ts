import "server-only";

import { and, eq, ne } from "drizzle-orm";

import { db, schema } from "@/db";

import { ACCESS_DAYS } from "./produk";
import { queryQris, type DokuCredentials, type QrisNotification } from "./doku";

export type ActivationResult =
  | { result: "activated" }
  | { result: "already_paid" }
  | { result: "not_found" }
  | { result: "amount_mismatch"; expected: number }
  | { result: "still_pending" };

/** Invoice dan nominal dicocokkan dengan database sebelum perubahan apa pun. */
export async function activatePayment(notif: QrisNotification): Promise<ActivationResult> {
  return db.transaction(async (tx) => {
    const [payment] = await tx
      .select({ id: schema.payments.id, orderId: schema.payments.orderId, amount: schema.payments.amount })
      .from(schema.payments)
      .where(and(eq(schema.payments.provider, "doku"), eq(schema.payments.externalId, notif.invoiceNumber)));

    if (!payment) return { result: "not_found" };
    if (payment.amount !== notif.amount) return { result: "amount_mismatch", expected: payment.amount };

    // Guard idempotency: notifikasi duplikat atau bersamaan kalah di kunci baris
    // ini dan tidak pernah memberi attempt kedua.
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

/**
 * Cadangan webhook: Query QRIS lalu fungsi aktivasi yang sama.
 *
 * ponytail: tanpa rate limit, setiap tekan tombol memanggil DOKU. Beri jeda
 * minimum antar panggilan bila mulai disalahgunakan.
 */
export async function pollPaymentStatus(
  credentials: DokuCredentials,
  payment: { externalId: string; referenceNo: string },
): Promise<ActivationResult> {
  const notif = await queryQris(credentials, {
    originalReferenceNo: payment.referenceNo,
    originalPartnerReferenceNo: payment.externalId,
  });

  if (notif.status !== "SUCCESS") return { result: "still_pending" };

  return activatePayment(notif);
}

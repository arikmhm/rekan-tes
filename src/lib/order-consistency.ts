/** Aturan murni panel operasional, terpisah agar teruji tanpa database. */

const ALASAN_MIN = 10;

export type PaymentRingkas = { status: string; paidAt: Date | null };

/** Ditandai untuk admin, tidak diperbaiki otomatis agar kasusnya tetap diperiksa manusia. */
export function orderPaymentMismatch(
  order: { status: string; accessExpiresAt: Date | null; grantedBy?: string | null },
  payments: PaymentRingkas[],
): string | null {
  const lunas = payments.some((p) => p.status === "paid");

  // Order penggantian memang lunas tanpa pembayaran.
  if (order.status === "paid" && !lunas && !order.grantedBy) {
    return "Order berstatus paid tetapi tidak ada pembayaran yang lunas.";
  }
  if (order.status !== "paid" && order.status !== "refunded" && lunas) {
    return `Ada pembayaran lunas tetapi order masih ${order.status}.`;
  }
  if (order.status === "paid" && !order.accessExpiresAt) {
    return "Order paid tanpa masa akses; peserta tidak akan bisa mengerjakan.";
  }
  if (order.status === "refunded" && payments.some((p) => p.status === "paid")) {
    return "Order refunded tetapi pembayarannya masih tercatat paid.";
  }
  return null;
}

export function grantReasonProblem(reason: string): string | null {
  const bersih = reason.trim();

  if (bersih.length < ALASAN_MIN) {
    return `Alasan minimal ${ALASAN_MIN} karakter; jejak audit tanpa alasan yang jelas tidak berguna.`;
  }
  if (bersih.length > 500) return "Alasan maksimal 500 karakter.";

  return null;
}

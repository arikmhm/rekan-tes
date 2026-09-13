/**
 * Aturan yang dipakai panel operasional admin (RT-015). Dipisahkan dari query
 * dengan alasan yang sama seperti `test-publish.ts`: file `"use server"` hanya
 * boleh mengekspor fungsi async, dan aturan ini harus dapat diuji tanpa
 * database.
 */

/** Panjang minimum alasan; cukup untuk kalimat, bukan sekadar "ok". */
const ALASAN_MIN = 10;

export type PaymentRingkas = { status: string; paidAt: Date | null };

/**
 * Ketidakcocokan antara status order dan pembayarannya, atau null bila
 * konsisten. Status order tidak dihitung ulang dari payment secara otomatis —
 * memperbaikinya diam-diam akan menyembunyikan justru kasus yang perlu
 * diperiksa manusia — jadi yang dilakukan adalah menamainya untuk admin.
 */
export function orderPaymentMismatch(
  order: { status: string; accessExpiresAt: Date | null; grantedBy?: string | null },
  payments: PaymentRingkas[],
): string | null {
  const lunas = payments.some((p) => p.status === "paid");

  // Order penggantian memang lunas tanpa pembayaran — itu justru bentuk yang
  // benar. Menandainya sebagai janggal akan melatih admin mengabaikan
  // peringatan ini, sehingga yang sungguhan janggal ikut terlewat.
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

/** Alasan penggantian akses yang tidak layak disimpan, atau null bila layak. */
export function grantReasonProblem(reason: string): string | null {
  const bersih = reason.trim();

  if (bersih.length < ALASAN_MIN) {
    return `Alasan minimal ${ALASAN_MIN} karakter; jejak audit tanpa alasan yang jelas tidak berguna.`;
  }
  if (bersih.length > 500) return "Alasan maksimal 500 karakter.";

  return null;
}

"use server";

import { and, desc, eq, gt, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db, schema } from "@/db";

import { assertOwner, requireVerifiedUser } from "./authz";
import { getPublishedTest } from "./catalog";
import { externalId, generateQris, invoiceNumber } from "./doku";
import { parseDokuEnv } from "./env-schema";
import { pollPaymentStatus } from "./webhook";

const PROVIDER = "doku";

/** Umur QRIS. Sama dengan default DOKU dan cukup untuk sekali bayar. */
const QRIS_VALID_MINUTES = 60;

/**
 * Membuat order lalu menerbitkan QRIS lewat DOKU SNAP.
 *
 * Harga diambil dari database, tidak pernah dari formulir, dan disalin ke order
 * sebagai snapshot. Order pending yang sudah ada dipakai ulang agar satu
 * peserta tidak menumpuk order untuk tes yang sama, dan QRIS yang masih hidup
 * dipakai kembali ketimbang menerbitkan QR baru.
 */
export async function startCheckout(_prev: string | null, form: FormData) {
  const user = await requireVerifiedUser();

  const tes = await getPublishedTest(String(form.get("slug") ?? ""));
  if (!tes) return "Tes tidak ditemukan atau sudah tidak terbit.";

  const [pending] = await db
    .select()
    .from(schema.orders)
    .where(
      and(
        eq(schema.orders.userId, user.id),
        eq(schema.orders.testId, tes.id),
        eq(schema.orders.status, "pending"),
      ),
    )
    .orderBy(desc(schema.orders.createdAt))
    .limit(1);

  if (pending) {
    const [hidup] = await db
      .select()
      .from(schema.payments)
      .where(
        and(
          eq(schema.payments.orderId, pending.id),
          eq(schema.payments.status, "pending"),
          isNotNull(schema.payments.qrContent),
          gt(schema.payments.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(schema.payments.createdAt))
      .limit(1);

    if (hidup?.qrContent) redirect(`/peserta/pesanan/${pending.id}`);
  }

  // Order lama mempertahankan harganya; katalog boleh berubah setelahnya.
  const amount = pending?.amount ?? tes.priceAmount;
  const orderId =
    pending?.id ??
    (
      await db
        .insert(schema.orders)
        .values({ userId: user.id, testId: tes.id, amount })
        .returning()
    )[0].id;

  // `X-EXTERNAL-ID` DOKU harus numerik, jadi bukan UUID seperti primary key
  // aplikasi. Disimpan sebelum DOKU dipanggil agar notifikasi yang datang tetap
  // dapat dicocokkan meski balasan generate gagal kami proses.
  const requestId = externalId();
  const [payment] = await db
    .insert(schema.payments)
    .values({
      orderId,
      provider: PROVIDER,
      externalId: invoiceNumber(),
      requestId,
      amount,
    })
    .returning();

  let qris;
  try {
    qris = await generateQris(parseDokuEnv(process.env), {
      partnerReferenceNo: payment.externalId,
      externalId: requestId,
      amount,
      validMinutes: QRIS_VALID_MINUTES,
    });
  } catch (error) {
    // Pesan asli berisi detail konfigurasi dan balasan DOKU; cukup untuk log.
    console.error("Generate QRIS DOKU gagal:", error);
    return "Pembayaran belum dapat dimulai. Coba beberapa saat lagi atau hubungi kami.";
  }

  await db
    .update(schema.payments)
    .set({
      qrContent: qris.qrContent,
      referenceNo: qris.referenceNo,
      expiresAt: qris.expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(schema.payments.id, payment.id));

  // QR ditampilkan di halaman kami sendiri; peserta tidak pernah keluar dari
  // aplikasi, jadi tidak ada redirect yang perlu dipercaya sebagai bukti bayar.
  redirect(`/peserta/pesanan/${orderId}`);
}

/**
 * Backup selain webhook: peserta menekan tombol untuk menanyakan status
 * transaksi langsung ke DOKU, dipakai saat notifikasi belum atau tidak pernah
 * sampai. Dipicu manual, bukan otomatis di setiap render, supaya tidak
 * memanggil DOKU tanpa alasan selama halaman dibuka.
 */
export async function checkPaymentStatus(_prev: string | null, form: FormData) {
  const orderId = String(form.get("orderId") ?? "");

  // `getOrder` sudah memverifikasi kepemilikan lewat `assertOwner`; dipakai
  // ulang di sini agar tidak ada jalur kedua yang memeriksa hal yang sama.
  const order = await getOrder(orderId);
  if (!order) return "Pesanan tidak ditemukan.";

  if (order.status !== "pending") {
    revalidatePath(`/peserta/pesanan/${orderId}`);
    return null;
  }

  const pembayaran = order.payments.find((p) => p.status === "pending" && p.referenceNo);
  if (!pembayaran?.referenceNo) {
    return "Tidak ada QRIS aktif untuk pesanan ini. Buat pembayaran baru dari halaman tes.";
  }

  let hasil;
  try {
    hasil = await pollPaymentStatus(parseDokuEnv(process.env), {
      externalId: pembayaran.externalId,
      referenceNo: pembayaran.referenceNo,
    });
  } catch (error) {
    console.error("Cek status QRIS gagal:", error);
    return "Gagal menghubungi DOKU. Coba lagi beberapa saat.";
  }

  revalidatePath(`/peserta/pesanan/${orderId}`);

  if (hasil.result === "still_pending") {
    return "Belum terbaca sebagai lunas. Pastikan pembayaran sudah selesai, lalu coba lagi.";
  }
  if (hasil.result === "not_found" || hasil.result === "amount_mismatch") {
    // Seharusnya tidak terjadi karena `pembayaran` sudah dicocokkan lewat
    // invoice miliknya sendiri; ditangani agar tidak diam-diam gagal.
    return "Status pembayaran tidak dapat diverifikasi. Hubungi kami bila ini berulang.";
  }

  // "activated" atau "already_paid": halaman menampilkan status baru begitu
  // `revalidatePath` di atas membuat render berikutnya membaca ulang database.
  return null;
}

/** Satu order beserta percobaan pembayarannya, hanya untuk pemiliknya. */
export async function getOrder(id: string) {
  const [order] = await db
    .select({
      id: schema.orders.id,
      userId: schema.orders.userId,
      amount: schema.orders.amount,
      status: schema.orders.status,
      accessExpiresAt: schema.orders.accessExpiresAt,
      createdAt: schema.orders.createdAt,
      testName: schema.tests.name,
      testSlug: schema.tests.slug,
      // Attempt lahir dari notifikasi pembayaran; halaman pesanan memakainya
      // sebagai pintu masuk ke sesi pengerjaan.
      attemptId: schema.testAttempts.id,
    })
    .from(schema.orders)
    .innerJoin(schema.tests, eq(schema.tests.id, schema.orders.testId))
    .leftJoin(schema.testAttempts, eq(schema.testAttempts.orderId, schema.orders.id))
    .where(eq(schema.orders.id, id));

  if (!order) return null;

  await assertOwner(order.userId);

  const payments = await db
    .select({
      id: schema.payments.id,
      externalId: schema.payments.externalId,
      referenceNo: schema.payments.referenceNo,
      status: schema.payments.status,
      qrContent: schema.payments.qrContent,
      expiresAt: schema.payments.expiresAt,
      createdAt: schema.payments.createdAt,
    })
    .from(schema.payments)
    .where(eq(schema.payments.orderId, id))
    .orderBy(desc(schema.payments.createdAt));

  return { ...order, payments };
}

/** Riwayat pesanan milik satu user, terbaru dulu. Dipakai di ruang peserta. */
export async function listOrdersForUser(userId: string) {
  return db
    .select({
      id: schema.orders.id,
      amount: schema.orders.amount,
      status: schema.orders.status,
      accessExpiresAt: schema.orders.accessExpiresAt,
      createdAt: schema.orders.createdAt,
      testName: schema.tests.name,
      testSlug: schema.tests.slug,
      // Ikut ditampilkan di pustaka supaya peserta melihat status
      // pengerjaannya tanpa perlu buka satu per satu halaman pesanan.
      attemptId: schema.testAttempts.id,
      attemptStatus: schema.testAttempts.status,
      attemptScore: schema.testAttempts.finalScore,
    })
    .from(schema.orders)
    .innerJoin(schema.tests, eq(schema.tests.id, schema.orders.testId))
    .leftJoin(schema.testAttempts, eq(schema.testAttempts.orderId, schema.orders.id))
    .where(eq(schema.orders.userId, userId))
    .orderBy(desc(schema.orders.createdAt));
}

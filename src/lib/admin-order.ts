"use server";

import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db, schema } from "@/db";

import { requireAdmin, requireAdminMutation } from "./authz";
import { ACCESS_DAYS } from "./produk";
import { grantReasonProblem } from "./order-consistency";

const ORDER_STATUS = ["pending", "paid", "expired", "cancelled", "refunded"] as const;

/**
 * Daftar order untuk panel operasional. Pencarian menyasar hal yang benar-benar
 * dipegang peserta saat mengeluh: username, email, nomor invoice, atau id order
 * yang mereka salin dari URL.
 */
export async function listOrdersForAdmin(filter: { q?: string; status?: string }) {
  await requireAdmin();

  const q = filter.q?.trim();
  const cocokInvoice = q
    ? db
        .select({ orderId: schema.payments.orderId })
        .from(schema.payments)
        .where(ilike(schema.payments.externalId, `%${q}%`))
    : null;

  // Dicocokkan ke daftar status yang sah, bukan di-cast: nilainya datang dari
  // query string dan bisa berisi apa saja.
  const status = ORDER_STATUS.find((s) => s === filter.status);

  const where = [
    status ? eq(schema.orders.status, status) : undefined,
    q
      ? or(
          eq(schema.orders.id, q),
          ilike(schema.user.username, `%${q}%`),
          ilike(schema.user.email, `%${q}%`),
          inArray(schema.orders.id, cocokInvoice!),
        )
      : undefined,
  ].filter(Boolean);

  return db
    .select({
      id: schema.orders.id,
      amount: schema.orders.amount,
      status: schema.orders.status,
      createdAt: schema.orders.createdAt,
      accessExpiresAt: schema.orders.accessExpiresAt,
      grantedBy: schema.orders.grantedBy,
      username: schema.user.username,
      email: schema.user.email,
      testName: schema.tests.name,
      attemptStatus: schema.testAttempts.status,
      finalScore: schema.testAttempts.finalScore,
    })
    .from(schema.orders)
    .innerJoin(schema.user, eq(schema.user.id, schema.orders.userId))
    .innerJoin(schema.tests, eq(schema.tests.id, schema.orders.testId))
    .leftJoin(schema.testAttempts, eq(schema.testAttempts.orderId, schema.orders.id))
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(schema.orders.createdAt))
    // ponytail: batas tetap seperti daftar admin lain. Tambahkan paginasi
    // ketika jumlah order sungguhan melewati angka ini.
    .limit(100);
}

/** Satu order dengan seluruh pembayaran, attempt, dan jejak penggantiannya. */
export async function getOrderForAdmin(id: string) {
  await requireAdmin();

  const [order] = await db
    .select({
      id: schema.orders.id,
      userId: schema.orders.userId,
      amount: schema.orders.amount,
      status: schema.orders.status,
      accessExpiresAt: schema.orders.accessExpiresAt,
      createdAt: schema.orders.createdAt,
      grantedBy: schema.orders.grantedBy,
      grantReason: schema.orders.grantReason,
      replacesOrderId: schema.orders.replacesOrderId,
      username: schema.user.username,
      email: schema.user.email,
      testId: schema.tests.id,
      testName: schema.tests.name,
      testSlug: schema.tests.slug,
    })
    .from(schema.orders)
    .innerJoin(schema.user, eq(schema.user.id, schema.orders.userId))
    .innerJoin(schema.tests, eq(schema.tests.id, schema.orders.testId))
    .where(eq(schema.orders.id, id));

  if (!order) return null;

  const [payments, attempt, penggantiRows, pemberi] = await Promise.all([
    db
      .select({
        id: schema.payments.id,
        provider: schema.payments.provider,
        externalId: schema.payments.externalId,
        referenceNo: schema.payments.referenceNo,
        amount: schema.payments.amount,
        status: schema.payments.status,
        paidAt: schema.payments.paidAt,
        expiresAt: schema.payments.expiresAt,
        createdAt: schema.payments.createdAt,
      })
      .from(schema.payments)
      .where(eq(schema.payments.orderId, id))
      .orderBy(desc(schema.payments.createdAt)),

    db
      .select({
        id: schema.testAttempts.id,
        status: schema.testAttempts.status,
        startedAt: schema.testAttempts.startedAt,
        submittedAt: schema.testAttempts.submittedAt,
        finalScore: schema.testAttempts.finalScore,
      })
      .from(schema.testAttempts)
      .where(eq(schema.testAttempts.orderId, id)),

    // Order pengganti yang lahir dari order ini; bagian lain dari jejak audit.
    db
      .select({
        id: schema.orders.id,
        createdAt: schema.orders.createdAt,
        grantReason: schema.orders.grantReason,
      })
      .from(schema.orders)
      .where(eq(schema.orders.replacesOrderId, id))
      .orderBy(desc(schema.orders.createdAt)),

    db
      .select({ id: schema.user.id, username: schema.user.username })
      .from(schema.user)
      .innerJoin(schema.orders, eq(schema.orders.grantedBy, schema.user.id))
      .where(eq(schema.orders.id, id)),
  ]);

  return {
    ...order,
    payments,
    attempt: attempt[0] ?? null,
    pengganti: penggantiRows,
    pemberi: pemberi[0]?.username ?? null,
  };
}

/**
 * Memberi akses pengganti: membuat order baru bernilai nol beserta attempt
 * barunya, menunjuk order yang digantikan, dan menyimpan alasan serta admin
 * pemberinya di baris order itu sendiri.
 *
 * Sengaja tidak menyentuh order lama sama sekali — tidak menghapus hasil,
 * tidak menghidupkan ulang attempt yang sudah selesai, tidak mengubah
 * statusnya. Hak baru berdiri sendiri sehingga histori tetap dapat dibaca
 * apa adanya, dan peserta mendapat kesempatan yang benar-benar baru.
 */
export async function grantReplacementAccess(_prev: string | null, form: FormData) {
  const admin = await requireAdminMutation();

  const orderId = String(form.get("orderId") ?? "");
  const reason = String(form.get("reason") ?? "");

  const masalah = grantReasonProblem(reason);
  if (masalah) return masalah;

  const [lama] = await db
    .select({
      id: schema.orders.id,
      userId: schema.orders.userId,
      testId: schema.orders.testId,
    })
    .from(schema.orders)
    .where(eq(schema.orders.id, orderId));

  if (!lama) return "Order tidak ditemukan.";

  await db.transaction(async (tx) => {
    const [baru] = await tx
      .insert(schema.orders)
      .values({
        userId: lama.userId,
        testId: lama.testId,
        // Penggantian bukan penjualan: nilainya nol dan tidak pernah menunggu
        // pembayaran, sehingga tidak mengotori angka pendapatan.
        amount: 0,
        status: "paid",
        accessExpiresAt: new Date(Date.now() + ACCESS_DAYS * 24 * 60 * 60_000),
        grantedBy: admin.id,
        grantReason: reason.trim(),
        replacesOrderId: lama.id,
      })
      .returning({ id: schema.orders.id });

    await tx.insert(schema.testAttempts).values({ orderId: baru.id });
  });

  revalidatePath("/admin/pesanan");
  revalidatePath(`/admin/pesanan/${orderId}`);
  return null;
}

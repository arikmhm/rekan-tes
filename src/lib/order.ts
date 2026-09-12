"use server";

import { and, desc, eq, gt, isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db, schema } from "@/db";

import { assertOwner, requireVerifiedUser } from "./authz";
import { getPublishedTest } from "./catalog";
import { createCheckout, invoiceNumber } from "./doku";
import { env } from "./env";
import { parseDokuEnv } from "./env-schema";

const PROVIDER = "doku";

/**
 * Membuat order lalu membuka checkout DOKU.
 *
 * Harga diambil dari database, tidak pernah dari formulir, dan disalin ke order
 * sebagai snapshot. Order pending yang sudah ada dipakai ulang agar satu
 * peserta tidak menumpuk order untuk tes yang sama, dan checkout yang masih
 * hidup langsung dipakai kembali ketimbang membuat percobaan pembayaran baru.
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
          isNotNull(schema.payments.checkoutUrl),
          gt(schema.payments.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(schema.payments.createdAt))
      .limit(1);

    if (hidup?.checkoutUrl) redirect(hidup.checkoutUrl);
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

  const requestId = crypto.randomUUID();
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

  let checkout;
  try {
    checkout = await createCheckout(parseDokuEnv(process.env), {
      requestId,
      invoiceNumber: payment.externalId,
      amount,
      // Tombol kembali dari DOKU hanya menampilkan status order, tidak
      // mengaktifkan apa pun. Aktivasi menunggu notifikasi resmi di RT-010.
      callbackUrl: `${env.BETTER_AUTH_URL}/order/${orderId}`,
      itemName: tes.name,
      customer: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    // Pesan asli berisi detail konfigurasi dan balasan DOKU; cukup untuk log.
    console.error("Checkout DOKU gagal:", error);
    return "Pembayaran belum dapat dimulai. Coba beberapa saat lagi atau hubungi kami.";
  }

  await db
    .update(schema.payments)
    .set({ checkoutUrl: checkout.url, expiresAt: checkout.expiresAt, updatedAt: new Date() })
    .where(eq(schema.payments.id, payment.id));

  redirect(checkout.url);
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
    })
    .from(schema.orders)
    .innerJoin(schema.tests, eq(schema.tests.id, schema.orders.testId))
    .where(eq(schema.orders.id, id));

  if (!order) return null;

  await assertOwner(order.userId);

  const payments = await db
    .select({
      id: schema.payments.id,
      externalId: schema.payments.externalId,
      status: schema.payments.status,
      checkoutUrl: schema.payments.checkoutUrl,
      expiresAt: schema.payments.expiresAt,
      createdAt: schema.payments.createdAt,
    })
    .from(schema.payments)
    .where(eq(schema.payments.orderId, id))
    .orderBy(desc(schema.payments.createdAt));

  return { ...order, payments };
}

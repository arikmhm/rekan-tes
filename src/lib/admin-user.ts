"use server";

import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";

import { db, schema } from "@/db";

import { requireAdmin } from "./authz";

const ROLE = ["participant", "admin"] as const;

/**
 * Daftar pengguna untuk panel operasional, beserta angka yang benar-benar
 * ditanyakan saat menangani keluhan: berapa pesanan yang dibuat, berapa yang
 * lunas, dan kapan terakhir memesan.
 *
 * Satu query dengan agregat, bukan query hitung per pengguna. `orders` ke
 * `test_attempts` berkardinalitas 1:0..1 sehingga ikut dijoin tanpa
 * menggandakan baris dan membuat hitungan pesanan membengkak.
 */
export async function listUsersForAdmin(filter: { q?: string; role?: string; verified?: string }) {
  await requireAdmin();

  const q = filter.q?.trim();
  const role = ROLE.find((r) => r === filter.role);

  const where = [
    role ? eq(schema.user.role, role) : undefined,
    filter.verified === "belum" ? eq(schema.user.emailVerified, false) : undefined,
    filter.verified === "sudah" ? eq(schema.user.emailVerified, true) : undefined,
    q
      ? or(ilike(schema.user.username, `%${q}%`), ilike(schema.user.email, `%${q}%`))
      : undefined,
  ].filter(Boolean);

  return db
    .select({
      id: schema.user.id,
      username: schema.user.username,
      email: schema.user.email,
      role: schema.user.role,
      emailVerified: schema.user.emailVerified,
      createdAt: schema.user.createdAt,
      totalOrder: count(schema.orders.id),
      orderLunas: sql<number>`count(*) filter (where ${schema.orders.status} = 'paid')::int`,
      sesiSelesai: sql<number>`count(*) filter (where ${schema.testAttempts.status} in ('submitted', 'submitted_by_timeout'))::int`,
      orderTerakhir: sql<Date | null>`max(${schema.orders.createdAt})`,
    })
    .from(schema.user)
    .leftJoin(schema.orders, eq(schema.orders.userId, schema.user.id))
    .leftJoin(schema.testAttempts, eq(schema.testAttempts.orderId, schema.orders.id))
    .where(where.length ? and(...where) : undefined)
    .groupBy(schema.user.id)
    .orderBy(desc(schema.user.createdAt))
    // ponytail: batas tetap seperti daftar admin lain. Tambahkan paginasi
    // ketika jumlah pengguna sungguhan melewati angka ini.
    .limit(100);
}

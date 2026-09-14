import "server-only";

import { and, asc, countDistinct, eq, sql } from "drizzle-orm";

import { db, schema } from "@/db";

/**
 * Masa akses setelah pembayaran berhasil. Ditampilkan di detail tes sebelum
 * pembelian; RT-009 menghitung `orders.access_expires_at` dari nilai yang sama.
 */
export const ACCESS_DAYS = 30;

/**
 * Katalog publik. Hanya tes `published` yang muncul; status lain tidak pernah
 * bocor ke halaman publik karena filter berada di query, bukan di UI.
 */
export async function listPublishedTests() {
  return db
    .select({
      slug: schema.tests.slug,
      name: schema.tests.name,
      description: schema.tests.description,
      priceAmount: schema.tests.priceAmount,
      subtestCount: countDistinct(schema.testSubtests.id),
      questionCount: sql<number>`coalesce(sum(${schema.testSubtests.questionLimit}), 0)::int`,
      durationSeconds: sql<number>`coalesce(sum(${schema.testSubtests.durationSeconds}), 0)::int`,
      // Nama subtes jadi label isi tiap kartu katalog. Diambil sekalian di sini
      // supaya daftar tidak memicu satu query tambahan per kartu. `array_remove`
      // membuang null milik tes yang belum punya subtes sama sekali.
      subtestNames: sql<string[]>`array_remove(array_agg(${schema.subtests.name} order by ${schema.testSubtests.position}), null)`,
    })
    .from(schema.tests)
    .leftJoin(schema.testSubtests, eq(schema.testSubtests.testId, schema.tests.id))
    .leftJoin(schema.subtests, eq(schema.subtests.id, schema.testSubtests.subtestId))
    .where(eq(schema.tests.status, "published"))
    .groupBy(schema.tests.id)
    .orderBy(asc(schema.tests.name));
}

/** Detail satu tes terbit, atau null bila slug tidak ada atau belum terbit. */
export async function getPublishedTest(slug: string) {
  const [tes] = await db
    .select()
    .from(schema.tests)
    .where(and(eq(schema.tests.slug, slug), eq(schema.tests.status, "published")));

  if (!tes) return null;

  const subtests = await db
    .select({
      id: schema.testSubtests.id,
      position: schema.testSubtests.position,
      name: schema.subtests.name,
      description: schema.subtests.description,
      questionLimit: schema.testSubtests.questionLimit,
      durationSeconds: schema.testSubtests.durationSeconds,
    })
    .from(schema.testSubtests)
    .innerJoin(schema.subtests, eq(schema.subtests.id, schema.testSubtests.subtestId))
    .where(eq(schema.testSubtests.testId, tes.id))
    .orderBy(asc(schema.testSubtests.position));

  return {
    ...tes,
    subtests,
    questionCount: subtests.reduce((n, s) => n + s.questionLimit, 0),
    durationSeconds: subtests.reduce((n, s) => n + s.durationSeconds, 0),
  };
}

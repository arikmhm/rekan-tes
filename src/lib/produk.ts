import "server-only";

import { and, asc, countDistinct, eq, sql } from "drizzle-orm";

import { db, schema } from "@/db";
import { formatDuration } from "@/lib/format";

/** Sumber tunggal masa akses: tampilan detail dan `orders.access_expires_at`. */
export const ACCESS_DAYS = 30;

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
    })
    .from(schema.tests)
    .leftJoin(schema.testSubtests, eq(schema.testSubtests.testId, schema.tests.id))
    .where(eq(schema.tests.status, "published"))
    .groupBy(schema.tests.id)
    .orderBy(asc(schema.tests.name));
}

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

/** Baru "simulasi" yang punya jalur beli; jenis lain baru dikenali tampilannya. */
export type JenisProduk = "simulasi" | "bank-soal" | "materi";

export const JENIS: Record<JenisProduk, { label: string; ringkas: string }> = {
  simulasi: {
    label: "Simulasi",
    ringkas:
      "Dikerjakan berwaktu seperti tes aslinya, lengkap dengan hasil dan pembahasan.",
  },
  "bank-soal": {
    label: "Soal",
    ringkas:
      "Kumpulan soal beserta pembahasannya, dikerjakan sesuka tempo sendiri.",
  },
  materi: {
    label: "Ebook",
    ringkas: "Bahan bacaan yang bisa diunduh dan dibuka kapan saja.",
  },
};

export type FaktaProduk = {
  ikon: "subtes" | "soal" | "durasi" | "akses";
  teks: string;
};

export type Produk = {
  jenis: JenisProduk;
  slug: string;
  nama: string;
  deskripsi: string;
  harga: number;
  fakta: FaktaProduk[];
};

export async function listProduk(): Promise<Produk[]> {
  const tes = await listPublishedTests();

  return tes.map((t) => ({
    jenis: "simulasi" as const,
    slug: t.slug,
    nama: t.name,
    deskripsi: t.description,
    harga: t.priceAmount,
    fakta: [
      { ikon: "subtes" as const, teks: `${t.subtestCount} subtes` },
      { ikon: "soal" as const, teks: `${t.questionCount} soal` },
      { ikon: "durasi" as const, teks: formatDuration(t.durationSeconds) },
    ],
  }));
}

export async function listBanners() {
  return db
    .select({
      id: schema.banners.id,
      imageUrl: schema.banners.imageUrl,
      alt: schema.banners.alt,
    })
    .from(schema.banners)
    .orderBy(asc(schema.banners.position), asc(schema.banners.createdAt));
}

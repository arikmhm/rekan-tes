"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db, schema } from "@/db";

import { activeSubtest, attemptAccessProblem, nextSubtest } from "./attempt-flow";
import { assertOwner } from "./authz";

/**
 * Satu attempt beserta order dan progres seluruh subtesnya, hanya untuk
 * pemiliknya. Konfigurasi subtes tes di-LEFT JOIN dengan progres attempt
 * karena baris progres baru ada setelah attempt dimulai; sebelum itu halaman
 * petunjuk tetap perlu menampilkan susunan subtes yang akan dikerjakan.
 */
export async function getAttempt(id: string) {
  const [attempt] = await db
    .select({
      id: schema.testAttempts.id,
      status: schema.testAttempts.status,
      startedAt: schema.testAttempts.startedAt,
      submittedAt: schema.testAttempts.submittedAt,
      orderId: schema.orders.id,
      orderStatus: schema.orders.status,
      accessExpiresAt: schema.orders.accessExpiresAt,
      userId: schema.orders.userId,
      testId: schema.orders.testId,
      testName: schema.tests.name,
      testSlug: schema.tests.slug,
    })
    .from(schema.testAttempts)
    .innerJoin(schema.orders, eq(schema.orders.id, schema.testAttempts.orderId))
    .innerJoin(schema.tests, eq(schema.tests.id, schema.orders.testId))
    .where(eq(schema.testAttempts.id, id));

  if (!attempt) return null;

  await assertOwner(attempt.userId);

  const rows = await db
    .select({
      testSubtestId: schema.testSubtests.id,
      position: schema.testSubtests.position,
      durationSeconds: schema.testSubtests.durationSeconds,
      questionLimit: schema.testSubtests.questionLimit,
      name: schema.subtests.name,
      description: schema.subtests.description,
      id: schema.attemptSubtests.id,
      status: schema.attemptSubtests.status,
      startedAt: schema.attemptSubtests.startedAt,
    })
    .from(schema.testSubtests)
    .innerJoin(schema.subtests, eq(schema.subtests.id, schema.testSubtests.subtestId))
    .leftJoin(
      schema.attemptSubtests,
      and(
        eq(schema.attemptSubtests.testSubtestId, schema.testSubtests.id),
        eq(schema.attemptSubtests.attemptId, attempt.id),
      ),
    )
    .where(eq(schema.testSubtests.testId, attempt.testId))
    .orderBy(asc(schema.testSubtests.position));

  // Subtes yang barisnya belum dibuat setara "belum dimulai", sehingga aturan
  // urutan di `attempt-flow.ts` tidak perlu tahu soal baris yang belum ada.
  const subtests = rows.map((r) => ({ ...r, status: r.status ?? "not_started" }));

  return { ...attempt, subtests };
}

/**
 * Memulai attempt: menetapkan `started_at` attempt, membuat baris progres
 * untuk seluruh subtes, lalu menjalankan subtes pertama. Seluruh waktu berasal
 * dari server, tidak pernah dari peramban.
 */
export async function startAttempt(_prev: string | null, form: FormData) {
  const attempt = await getAttempt(String(form.get("attemptId") ?? ""));
  if (!attempt) return "Sesi tidak ditemukan.";

  const masalah = attemptAccessProblem(
    { status: attempt.orderStatus, accessExpiresAt: attempt.accessExpiresAt },
    new Date(),
  );
  if (masalah) return masalah;

  if (attempt.subtests.length === 0) {
    return "Tes ini belum memiliki subtes. Hubungi kami agar sesimu dapat diganti.";
  }

  const now = new Date();

  await db.transaction(async (tx) => {
    // Guard idempotency yang sama bentuknya dengan aktivasi pembayaran: baris
    // hanya berubah bila masih `not_started`. Klik ganda atau dua tab tidak
    // menggeser `started_at` yang sudah berjalan dan tidak membuat baris ganda.
    const dimulai = await tx
      .update(schema.testAttempts)
      .set({ status: "in_progress", startedAt: now, updatedAt: now })
      .where(
        and(eq(schema.testAttempts.id, attempt.id), eq(schema.testAttempts.status, "not_started")),
      )
      .returning({ id: schema.testAttempts.id });

    if (dimulai.length === 0) return;

    const pertama = activeSubtest(attempt.subtests);

    await tx.insert(schema.attemptSubtests).values(
      attempt.subtests.map((s) => ({
        attemptId: attempt.id,
        testSubtestId: s.testSubtestId,
        // Hanya subtes pertama yang jamnya berjalan; sisanya menyusul saat
        // subtes sebelumnya disubmit, supaya durasinya tidak habis menunggu.
        ...(s.testSubtestId === pertama?.testSubtestId
          ? { status: "in_progress" as const, startedAt: now }
          : {}),
      })),
    );
  });

  revalidatePath(`/attempt/${attempt.id}`);
  return null;
}

/**
 * Menyubmit subtes yang sedang berjalan lalu menjalankan subtes berikutnya,
 * atau menutup attempt bila itu yang terakhir. Satu transaksi, sehingga tidak
 * pernah ada keadaan "subtes tertutup tapi tidak ada penerusnya".
 *
 * ponytail: submit masih manual. Subtes yang deadline-nya lewat sementara
 * peramban tertutup baru tertutup saat peserta kembali; auto-submit oleh waktu
 * habis adalah RT-012 bersama timer dan mesin soalnya.
 */
export async function submitSubtest(_prev: string | null, form: FormData) {
  const attempt = await getAttempt(String(form.get("attemptId") ?? ""));
  if (!attempt) return "Sesi tidak ditemukan.";

  const aktif = activeSubtest(attempt.subtests);
  const aktifId = aktif?.id;
  if (!aktif || !aktifId) return "Tidak ada subtes yang sedang berjalan.";

  const berikutnya = nextSubtest(attempt.subtests, aktif.position);
  const now = new Date();

  await db.transaction(async (tx) => {
    const disubmit = await tx
      .update(schema.attemptSubtests)
      .set({ status: "submitted", submittedAt: now, updatedAt: now })
      .where(
        and(
          eq(schema.attemptSubtests.id, aktifId),
          eq(schema.attemptSubtests.status, "in_progress"),
        ),
      )
      .returning({ id: schema.attemptSubtests.id });

    // Submit kedua dari tab lain tidak boleh ikut menjalankan subtes berikutnya
    // untuk kedua kalinya, jadi berhenti begitu tidak ada baris yang berubah.
    if (disubmit.length === 0) return;

    if (berikutnya?.id) {
      await tx
        .update(schema.attemptSubtests)
        .set({ status: "in_progress", startedAt: now, updatedAt: now })
        .where(
          and(
            eq(schema.attemptSubtests.id, berikutnya.id),
            eq(schema.attemptSubtests.status, "not_started"),
          ),
        );
      return;
    }

    await tx
      .update(schema.testAttempts)
      .set({ status: "submitted", submittedAt: now, updatedAt: now })
      .where(eq(schema.testAttempts.id, attempt.id));
  });

  revalidatePath(`/attempt/${attempt.id}`);
  return null;
}

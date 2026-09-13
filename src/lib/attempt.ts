"use server";

import { and, asc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db, schema } from "@/db";

import {
  activeSubtest,
  attemptAccessProblem,
  nextSubtest,
  subtestDeadline,
  timeoutPlan,
  type SubtestProgress,
} from "./attempt-flow";
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
  const now = new Date();
  const habis = await applyTimeouts(attempt.id, rows.map((r) => ({ ...r, status: r.status ?? "not_started" })), now);

  const aktif = activeSubtest(habis.subtests);
  // Subtes berjalan: yang aktif, barisnya sudah ada, dan jamnya sedang hidup.
  const berjalan =
    aktif && aktif.id && aktif.status === "in_progress" ? { ...aktif, id: aktif.id } : null;

  return {
    ...attempt,
    status: habis.attemptStatus ?? attempt.status,
    submittedAt: habis.submittedAt ?? attempt.submittedAt,
    subtests: habis.subtests,
    deadline: berjalan ? subtestDeadline(berjalan) : null,
    remainingSeconds: berjalan ? sisaDetik(subtestDeadline(berjalan), now) : null,
    questions: berjalan ? await loadQuestions(berjalan) : [],
  };
}

function sisaDetik(deadline: Date | null, now: Date) {
  return deadline ? Math.max(0, Math.round((deadline.getTime() - now.getTime()) / 1000)) : null;
}

/**
 * Menutup subtes yang deadline-nya sudah lewat lalu menjalankan penerusnya,
 * sebelum halaman maupun Server Action mana pun melihat datanya. Ditaruh di
 * dalam `getAttempt` dengan sengaja: setiap jalur masuk memakai fungsi itu,
 * jadi satu guard di sini menutup semua jalur sekaligus — tanpa cron yang bisa
 * mati diam-diam. Penulisan hanya terjadi saat benar-benar ada yang lewat, dan
 * setiap `UPDATE` dijaga status sehingga dua request bersamaan tetap aman.
 *
 * ponytail: penutupan terjadi saat dibaca, bukan saat waktunya benar-benar
 * habis. Attempt yang peserta dan admin sama-sama tidak pernah buka lagi tetap
 * tercatat `in_progress` di database walau seluruh deadline-nya sudah lewat —
 * angka laporan bisa ikut salah bila kelak ada yang menghitung langsung dari
 * kolom status. Cukup selama setiap pembaca lewat `getAttempt`; begitu ada
 * query yang membaca `test_attempts` langsung (laporan RT-014, panel admin
 * RT-015), jalankan penyapu berkala atau ikut hitung deadline di query itu.
 */
async function applyTimeouts<T extends SubtestProgress & { id: string | null }>(
  attemptId: string,
  rows: T[],
  now: Date,
) {
  const steps = timeoutPlan(rows, now);
  if (steps.length === 0) return { subtests: rows, attemptStatus: null, submittedAt: null };

  await db.transaction(async (tx) => {
    for (const step of steps) {
      if (!step.close.id) continue;

      await tx
        .update(schema.attemptSubtests)
        .set({ status: "submitted_by_timeout", submittedAt: step.at, updatedAt: now })
        .where(
          and(
            eq(schema.attemptSubtests.id, step.close.id),
            eq(schema.attemptSubtests.status, "in_progress"),
          ),
        );

      if (step.start?.id) {
        await tx
          .update(schema.attemptSubtests)
          .set({ status: "in_progress", startedAt: step.at, updatedAt: now })
          .where(
            and(
              eq(schema.attemptSubtests.id, step.start.id),
              eq(schema.attemptSubtests.status, "not_started"),
            ),
          );
      } else {
        await tx
          .update(schema.testAttempts)
          .set({ status: "submitted_by_timeout", submittedAt: step.at, updatedAt: now })
          .where(
            and(
              eq(schema.testAttempts.id, attemptId),
              eq(schema.testAttempts.status, "in_progress"),
            ),
          );
      }
    }
  });

  // Cermin perubahan di memori; render berikutnya tidak perlu query ulang.
  const ubah = new Map<string, Partial<T>>();
  for (const step of steps) {
    if (step.close.id) ubah.set(step.close.id, { status: "submitted_by_timeout" } as Partial<T>);
    if (step.start?.id) {
      ubah.set(step.start.id, { status: "in_progress", startedAt: step.at } as Partial<T>);
    }
  }

  const terakhir = steps[steps.length - 1];

  return {
    subtests: rows.map((r) => (r.id && ubah.has(r.id) ? { ...r, ...ubah.get(r.id) } : r)),
    attemptStatus: terakhir.start ? null : ("submitted_by_timeout" as const),
    submittedAt: terakhir.start ? null : terakhir.at,
  };
}

/**
 * Soal subtes berjalan beserta pilihan dan jawaban peserta. Kolom `is_correct`
 * dan `explanation` tidak pernah ikut di-select, sehingga kunci jawaban tidak
 * dapat bocor ke peramban lewat payload React — bukan disembunyikan di UI,
 * memang tidak pernah meninggalkan database.
 */
async function loadQuestions(aktif: { id: string; testSubtestId: string; questionLimit: number }) {
  const soal = await db
    .select({
      assignmentId: schema.testSubtestQuestions.id,
      questionId: schema.questions.id,
      prompt: schema.questions.prompt,
    })
    .from(schema.testSubtestQuestions)
    .innerJoin(schema.questions, eq(schema.questions.id, schema.testSubtestQuestions.questionId))
    .where(eq(schema.testSubtestQuestions.testSubtestId, aktif.testSubtestId))
    .orderBy(asc(schema.testSubtestQuestions.position))
    .limit(aktif.questionLimit);

  if (soal.length === 0) return [];

  const opsi = await db
    .select({
      id: schema.questionOptions.id,
      questionId: schema.questionOptions.questionId,
      label: schema.questionOptions.label,
      content: schema.questionOptions.content,
    })
    .from(schema.questionOptions)
    .where(inArray(schema.questionOptions.questionId, soal.map((s) => s.questionId)))
    .orderBy(asc(schema.questionOptions.position));

  const jawaban = await db
    .select({
      testSubtestQuestionId: schema.attemptAnswers.testSubtestQuestionId,
      selectedOptionId: schema.attemptAnswers.selectedOptionId,
    })
    .from(schema.attemptAnswers)
    .where(eq(schema.attemptAnswers.attemptSubtestId, aktif.id));

  return soal.map((s, i) => ({
    ...s,
    nomor: i + 1,
    options: opsi.filter((o) => o.questionId === s.questionId),
    selectedOptionId:
      jawaban.find((j) => j.testSubtestQuestionId === s.assignmentId)?.selectedOptionId ?? null,
  }));
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
 */
export async function submitSubtest(_prev: string | null, form: FormData) {
  const attempt = await getAttempt(String(form.get("attemptId") ?? ""));
  if (!attempt) return "Sesi tidak ditemukan.";

  const aktif = activeSubtest(attempt.subtests);
  const aktifId = aktif?.id;
  if (!aktif || !aktifId) return "Tidak ada subtes yang sedang berjalan.";

  // Halaman ikut mengirim subtes mana yang dilihat peserta saat menekan tombol.
  // Tanpa ini, halaman yang sudah basi — misalnya subtesnya keburu ditutup
  // karena waktu habis dan penerusnya sudah berjalan — akan menyubmit subtes
  // berikutnya seketika dan menghabiskan waktunya tanpa satu soal pun terlihat.
  if (String(form.get("subtestId") ?? "") !== aktifId) {
    return "Subtes sudah berpindah karena waktunya habis. Muat ulang halaman.";
  }

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

/**
 * Menyimpan satu jawaban peserta. Assignment dan opsi divalidasi terhadap soal
 * subtes yang sedang berjalan — datanya berasal dari `getAttempt`, jadi id yang
 * dikarang klien tidak akan ditemukan. Subtes yang sudah ditutup, termasuk yang
 * baru saja ditutup karena waktunya habis, otomatis tidak lagi `in_progress`
 * sehingga penolakan setelah deadline tidak butuh pemeriksaan waktu kedua.
 *
 * ponytail: satu POST penuh per jawaban, tanpa status simpan di klien. Itu
 * RT-013 (autosave); bentuk `onConflictDoUpdate` di bawah sudah aman diulang.
 */
export async function saveAnswer(_prev: string | null, form: FormData) {
  const attempt = await getAttempt(String(form.get("attemptId") ?? ""));
  if (!attempt) return "Sesi tidak ditemukan.";

  const aktif = activeSubtest(attempt.subtests);
  if (!aktif?.id || aktif.status !== "in_progress") {
    return "Subtes ini sudah ditutup, jawaban tidak lagi dapat diubah.";
  }

  const assignmentId = String(form.get("assignmentId") ?? "");
  const optionId = String(form.get("optionId") ?? "");
  const soal = attempt.questions.find((q) => q.assignmentId === assignmentId);

  // Opsi harus milik soal yang sedang dijawab, bukan sekadar opsi yang ada.
  if (!soal || !soal.options.some((o) => o.id === optionId)) {
    return "Jawaban tidak dapat disimpan; subtes mungkin sudah berpindah. Muat ulang halaman.";
  }

  const now = new Date();

  await db
    .insert(schema.attemptAnswers)
    .values({
      attemptSubtestId: aktif.id,
      testSubtestQuestionId: assignmentId,
      selectedOptionId: optionId,
      answeredAt: now,
    })
    .onConflictDoUpdate({
      target: [schema.attemptAnswers.attemptSubtestId, schema.attemptAnswers.testSubtestQuestionId],
      set: { selectedOptionId: optionId, answeredAt: now, updatedAt: now },
    });

  revalidatePath(`/attempt/${attempt.id}`);
  return null;
}

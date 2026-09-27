"use server";

import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db, schema } from "@/db";

import {
  activeSubtest,
  attemptAccessProblem,
  isDone,
  nextSubtest,
  ringkasSubtes,
  subtestDeadline,
  timeoutPlan,
  type SubtestProgress,
} from "./attempt-flow";
import { assertOwner } from "./authz";

type Transaksi = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Attempt beserta progres subtesnya, hanya untuk pemiliknya. LEFT JOIN karena
 * baris progres baru ada setelah attempt dimulai, sementara halaman petunjuk
 * sudah perlu susunan subtesnya.
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
      submittedAt: schema.attemptSubtests.submittedAt,
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

  // Baris yang belum ada setara "belum dimulai".
  const now = new Date();
  const habis = await applyTimeouts(attempt.id, rows.map((r) => ({ ...r, status: r.status ?? "not_started" })), now);

  const aktif = activeSubtest(habis.subtests);
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
 * Menutup subtes yang lewat deadline dan menjalankan penerusnya. Semua jalur
 * masuk lewat `getAttempt`, jadi satu guard ini menggantikan cron. Setiap
 * `UPDATE` dijaga status sehingga request bersamaan tetap aman.
 *
 * ponytail: ditutup saat dibaca, bukan saat waktu habis. Attempt yang tak
 * dibuka lagi tetap `in_progress` tanpa `final_score` (terlihat di
 * `/peserta/pesanan` dan panel admin). Tambah penyapu berkala bila ada laporan
 * yang menghitung dari kolom status.
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

      await scoreSubtest(tx, step.close.id);

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

        await finalizeAttempt(tx, attemptId);
      }
    }
  });

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
 * Membekukan `is_correct` dari kunci yang berlaku sekarang lalu menjumlahkan
 * bobotnya, supaya koreksi soal belakangan tidak mengubah hasil lama. Dipanggil
 * dari submit manual maupun timeout; idempotent.
 */
async function scoreSubtest(tx: Transaksi, attemptSubtestId: string) {
  await tx.execute(sql`
    update ${schema.attemptAnswers} aa
    set is_correct = qo.is_correct, updated_at = now()
    from ${schema.questionOptions} qo
    where qo.id = aa.selected_option_id and aa.attempt_subtest_id = ${attemptSubtestId}
  `);

  await tx.execute(sql`
    update ${schema.attemptSubtests}
    set score = (
      select coalesce(sum(tsq.weight), 0)
      from ${schema.attemptAnswers} aa
      join ${schema.testSubtestQuestions} tsq on tsq.id = aa.test_subtest_question_id
      where aa.attempt_subtest_id = ${attemptSubtestId} and aa.is_correct
    ), updated_at = now()
    where id = ${attemptSubtestId}
  `);
}

async function finalizeAttempt(tx: Transaksi, attemptId: string) {
  await tx.execute(sql`
    update ${schema.testAttempts}
    set final_score = (
      select coalesce(sum(score), 0) from ${schema.attemptSubtests} where attempt_id = ${attemptId}
    ), updated_at = now()
    where id = ${attemptId}
  `);
}

/**
 * Satu-satunya definisi "soal yang dikerjakan", dipakai halaman pengerjaan dan
 * hasil agar pembahasan memuat soal yang sama persis. Kunci dan pembahasan
 * tidak di-select di sini, jadi tidak pernah sampai ke payload peramban.
 */
async function presentedQuestions(testSubtestId: string, questionLimit: number) {
  return db
    .select({
      assignmentId: schema.testSubtestQuestions.id,
      weight: schema.testSubtestQuestions.weight,
      questionId: schema.questions.id,
      prompt: schema.questions.prompt,
    })
    .from(schema.testSubtestQuestions)
    .innerJoin(schema.questions, eq(schema.questions.id, schema.testSubtestQuestions.questionId))
    .where(eq(schema.testSubtestQuestions.testSubtestId, testSubtestId))
    .orderBy(asc(schema.testSubtestQuestions.position))
    .limit(questionLimit);
}

async function loadQuestions(aktif: { id: string; testSubtestId: string; questionLimit: number }) {
  const soal = await presentedQuestions(aktif.testSubtestId, aktif.questionLimit);

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
      secondsSpent: schema.attemptAnswers.secondsSpent,
    })
    .from(schema.attemptAnswers)
    .where(eq(schema.attemptAnswers.attemptSubtestId, aktif.id));

  return soal.map((s, i) => ({
    ...s,
    nomor: i + 1,
    options: opsi.filter((o) => o.questionId === s.questionId),
    selectedOptionId:
      jawaban.find((j) => j.testSubtestQuestionId === s.assignmentId)?.selectedOptionId ?? null,
    secondsSpent:
      jawaban.find((j) => j.testSubtestQuestionId === s.assignmentId)?.secondsSpent ?? 0,
  }));
}

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
    // Hanya berubah bila masih `not_started`: klik ganda atau dua tab tidak
    // menggeser `started_at` maupun membuat baris ganda.
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
        // pendahulunya disubmit.
        ...(s.testSubtestId === pertama?.testSubtestId
          ? { status: "in_progress" as const, startedAt: now }
          : {}),
      })),
    );
  });

  revalidatePath(`/peserta/simulasi/${attempt.id}`);
  return null;
}

/** Satu transaksi: tidak pernah ada subtes tertutup tanpa penerusnya berjalan. */
export async function submitSubtest(_prev: string | null, form: FormData) {
  const attempt = await getAttempt(String(form.get("attemptId") ?? ""));
  if (!attempt) return "Sesi tidak ditemukan.";

  const aktif = activeSubtest(attempt.subtests);
  const aktifId = aktif?.id;
  if (!aktif || !aktifId) return "Tidak ada subtes yang sedang berjalan.";

  // Halaman basi (subtesnya sudah ditutup timeout) tidak boleh menyubmit
  // penerusnya yang belum pernah terlihat.
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

    // Submit kedua dari tab lain berhenti di sini.
    if (disubmit.length === 0) return;

    await scoreSubtest(tx, aktifId);

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

    await finalizeAttempt(tx, attempt.id);
  });

  revalidatePath(`/peserta/simulasi/${attempt.id}`);
  return null;
}

/**
 * Setoran berkala dari klien: jawaban plus lama tiap soal dibuka. `optionId`
 * null berarti soal hanya dibuka, dicatat waktunya tanpa dinilai.
 *
 * Id divalidasi terhadap soal subtes yang sedang `in_progress` menurut
 * `getAttempt`, jadi setoran setelah deadline tertolak tanpa cek waktu kedua.
 * Satu entri tidak sah menolak seluruh kelompok agar klien mengantre ulang,
 * bukan kehilangan sebagian. Upsert idempotent.
 */
export async function saveAnswers(
  attemptId: string,
  entries: { assignmentId: string; optionId: string | null; detik: number }[],
) {
  const attempt = await getAttempt(attemptId);
  if (!attempt) return "Sesi tidak ditemukan.";

  const aktif = activeSubtest(attempt.subtests);
  const aktifId = aktif?.id;
  if (!aktifId || aktif.status !== "in_progress") {
    return "Subtes ini sudah ditutup, jawaban tidak lagi dapat diubah.";
  }

  const now = new Date();
  const baris = entries.flatMap(({ assignmentId, optionId, detik }) => {
    const soal = attempt.questions.find((q) => q.assignmentId === assignmentId);
    if (!soal) return [];
    if (optionId !== null && !soal.options.some((o) => o.id === optionId)) return [];

    return [
      {
        attemptSubtestId: aktifId,
        testSubtestQuestionId: assignmentId,
        selectedOptionId: optionId,
        secondsSpent: Number.isFinite(detik) ? Math.max(0, Math.round(detik)) : 0,
        answeredAt: optionId === null ? null : now,
      },
    ];
  });

  if (baris.length !== entries.length) {
    return "Jawaban tidak dapat disimpan; subtes mungkin sudah berpindah. Muat ulang halaman.";
  }
  if (baris.length === 0) return null;

  await db
    .insert(schema.attemptAnswers)
    .values(baris)
    .onConflictDoUpdate({
      target: [schema.attemptAnswers.attemptSubtestId, schema.attemptAnswers.testSubtestQuestionId],
      // `coalesce`: baris yang hanya membawa waktu tidak menghapus jawaban.
      set: {
        selectedOptionId: sql`coalesce(excluded.selected_option_id, ${schema.attemptAnswers.selectedOptionId})`,
        secondsSpent: sql`greatest(excluded.seconds_spent, ${schema.attemptAnswers.secondsSpent})`,
        answeredAt: sql`coalesce(excluded.answered_at, ${schema.attemptAnswers.answeredAt})`,
        updatedAt: now,
      },
    });

  return null;
}

/**
 * Satu-satunya jalur yang membaca kunci dan pembahasan, dan hanya untuk attempt
 * yang selesai (`selesai: false` bila belum).
 */
export async function getResult(attemptId: string) {
  const attempt = await getAttempt(attemptId);
  if (!attempt) return null;
  if (!isDone(attempt.status)) return { selesai: false as const, attempt };

  const subtes = await Promise.all(
    attempt.subtests.map(async (s) => {
      const soal = await presentedQuestions(s.testSubtestId, s.questionLimit);
      return { subtes: s, soal };
    }),
  );

  const questionIds = subtes.flatMap((x) => x.soal.map((q) => q.questionId));
  const attemptSubtestIds = attempt.subtests.map((s) => s.id).filter((id) => id !== null);

  const opsi = questionIds.length
    ? await db
        .select({
          id: schema.questionOptions.id,
          questionId: schema.questionOptions.questionId,
          label: schema.questionOptions.label,
          content: schema.questionOptions.content,
          isCorrect: schema.questionOptions.isCorrect,
        })
        .from(schema.questionOptions)
        .where(inArray(schema.questionOptions.questionId, questionIds))
        .orderBy(asc(schema.questionOptions.position))
    : [];

  const pembahasan = questionIds.length
    ? await db
        .select({ id: schema.questions.id, explanation: schema.questions.explanation })
        .from(schema.questions)
        .where(inArray(schema.questions.id, questionIds))
    : [];

  const jawaban = attemptSubtestIds.length
    ? await db
        .select({
          attemptSubtestId: schema.attemptAnswers.attemptSubtestId,
          testSubtestQuestionId: schema.attemptAnswers.testSubtestQuestionId,
          selectedOptionId: schema.attemptAnswers.selectedOptionId,
          isCorrect: schema.attemptAnswers.isCorrect,
          secondsSpent: schema.attemptAnswers.secondsSpent,
        })
        .from(schema.attemptAnswers)
        .where(inArray(schema.attemptAnswers.attemptSubtestId, attemptSubtestIds))
    : [];

  const hasil = subtes.map(({ subtes: s, soal }) => {
    const daftar = soal.map((q, i) => {
      const jawab = jawaban.find(
        (j) => j.attemptSubtestId === s.id && j.testSubtestQuestionId === q.assignmentId,
      );
      const pilihan = opsi.filter((o) => o.questionId === q.questionId);

      return {
        ...q,
        nomor: i + 1,
        options: pilihan,
        selectedOptionId: jawab?.selectedOptionId ?? null,
        // Dibekukan saat subtes ditutup, bukan kunci yang berlaku sekarang.
        isCorrect: jawab?.isCorrect ?? null,
        detik: jawab?.secondsSpent ?? 0,
        // Baris bisa ada hanya untuk mencatat waktu.
        dijawab: Boolean(jawab?.selectedOptionId),
        explanation: pembahasan.find((p) => p.id === q.questionId)?.explanation ?? "",
      };
    });

    return { ...s, soal: daftar, ...ringkasSubtes(daftar) };
  });

  return {
    selesai: true as const,
    attempt,
    subtes: hasil,
    total: {
      skor: hasil.reduce((n, s) => n + s.skor, 0),
      maksimal: hasil.reduce((n, s) => n + s.maksimal, 0),
      benar: hasil.reduce((n, s) => n + s.benar, 0),
      salah: hasil.reduce((n, s) => n + s.salah, 0),
      kosong: hasil.reduce((n, s) => n + s.kosong, 0),
    },
  };
}

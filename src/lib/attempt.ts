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

/** Tipe `tx` di dalam `db.transaction`, dipakai helper penilaian di bawah. */
type Transaksi = Parameters<Parameters<typeof db.transaction>[0]>[0];

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
      // Dipakai halaman hasil untuk menghitung waktu yang benar-benar terpakai
      // tiap subtes, bukan rentang dari mulai sampai kumpul yang ikut memuat
      // jeda di antara subtes.
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
 * habis. Attempt yang tidak pernah dibuka lagi tetap tercatat `in_progress`
 * walau seluruh deadline-nya sudah lewat, dan `final_score`-nya belum terisi.
 * Sudah ada satu pembaca langsung: daftar pesanan di `/peserta/pesanan` menampilkan status
 * dan skor dari kolomnya, jadi sesi seperti itu tampil "sedang dikerjakan"
 * tanpa skor sampai peserta membukanya sekali — lalu benar dengan sendirinya.
 * Cukup untuk MVP karena tidak ada angka yang salah, hanya tertunda. Begitu
 * ada laporan agregat atau panel admin (RT-015) yang menghitung dari kolom
 * status, jalankan penyapu berkala atau ikut hitung deadline di query itu.
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
 * Menilai satu subtes yang baru ditutup: membekukan benar/salah setiap jawaban
 * dari kunci yang berlaku saat itu, lalu menjumlahkan bobotnya menjadi skor
 * subtes. Dipanggil dari kedua jalur penutupan — submit manual dan timeout —
 * sehingga tidak ada subtes tertutup yang lolos tanpa nilai.
 *
 * `is_correct` disimpan, bukan dihitung ulang saat hasil dibaca, supaya
 * koreksi soal di kemudian hari tidak diam-diam mengubah hasil attempt lama.
 * Perhitungannya idempotent: mengulangnya menghasilkan angka yang sama.
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

/** Skor akhir attempt: jumlah skor subtesnya. Dipanggil saat attempt ditutup. */
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
 * Soal subtes berjalan beserta pilihan dan jawaban peserta. Kolom `is_correct`
 * dan `explanation` tidak pernah ikut di-select, sehingga kunci jawaban tidak
 * dapat bocor ke peramban lewat payload React — bukan disembunyikan di UI,
 * memang tidak pernah meninggalkan database.
 */
/**
 * Soal yang benar-benar tampil pada satu subtes: assignment terurut `position`,
 * dipotong `question_limit`. Satu-satunya definisi "soal mana yang dikerjakan",
 * dipakai halaman pengerjaan maupun halaman hasil — kalau keduanya memakai
 * aturan sendiri-sendiri, pembahasan bisa memuat soal yang tidak pernah
 * ditampilkan atau melewatkan soal yang dijawab.
 *
 * Kunci jawaban dan pembahasan sengaja tidak ikut di-select di sini; pemanggil
 * yang berhak (halaman hasil) mengambilnya terpisah.
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

  revalidatePath(`/peserta/simulasi/${attempt.id}`);
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
 * Menyimpan sekelompok jawaban sekaligus. Klien menahan pilihan peserta di
 * memori dan menyetornya berkala (RT-013), jadi satu subtes cukup beberapa
 * request — bukan satu request penuh per klik seperti sebelumnya.
 *
 * Assignment dan opsi divalidasi terhadap soal subtes yang sedang berjalan —
 * datanya berasal dari `getAttempt`, jadi id yang dikarang klien tidak akan
 * ditemukan. Subtes yang sudah ditutup, termasuk yang baru saja ditutup karena
 * waktunya habis, otomatis tidak lagi `in_progress` sehingga penolakan setelah
 * deadline tidak butuh pemeriksaan waktu kedua.
 *
 * Seluruh kelompok ditolak bila ada satu saja entri yang tidak sah: klien
 * menyimpan kembali ke antrean dan memberi tahu peserta, alih-alih diam-diam
 * menelan sebagian jawaban. Upsert-nya idempotent, jadi kiriman ulang aman.
 */
export async function saveAnswers(
  attemptId: string,
  entries: { assignmentId: string; optionId: string }[],
) {
  const attempt = await getAttempt(attemptId);
  if (!attempt) return "Sesi tidak ditemukan.";

  const aktif = activeSubtest(attempt.subtests);
  const aktifId = aktif?.id;
  if (!aktifId || aktif.status !== "in_progress") {
    return "Subtes ini sudah ditutup, jawaban tidak lagi dapat diubah.";
  }

  const now = new Date();
  const baris = entries.flatMap(({ assignmentId, optionId }) => {
    const soal = attempt.questions.find((q) => q.assignmentId === assignmentId);
    if (!soal || !soal.options.some((o) => o.id === optionId)) return [];

    return [
      {
        attemptSubtestId: aktifId,
        testSubtestQuestionId: assignmentId,
        selectedOptionId: optionId,
        answeredAt: now,
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
      // `excluded` dipakai karena satu pernyataan membawa banyak baris: tiap
      // baris harus memakai opsi miliknya sendiri, bukan satu nilai tetap.
      set: {
        selectedOptionId: sql`excluded.selected_option_id`,
        answeredAt: now,
        updatedAt: now,
      },
    });

  return null;
}

/**
 * Hasil dan pembahasan satu attempt yang sudah selesai. Kunci jawaban dan
 * pembahasan baru ikut terbaca di sini — jalur pengerjaan (`loadQuestions`)
 * tetap tidak pernah menyentuh keduanya, jadi status attempt adalah satu-satunya
 * pintu yang menentukan kunci boleh keluar atau tidak.
 *
 * Mengembalikan null bila attempt tidak ada atau bukan milik peminta
 * (`getAttempt` sudah menolak lewat `assertOwner`), dan `selesai: false` bila
 * pengerjaannya belum tuntas — halaman yang memanggil mengarahkan balik ke sesi.
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

  // Dua query massal, bukan per soal: jumlah soal satu attempt masih kecil,
  // tetapi per-soal berarti puluhan round trip untuk satu halaman hasil.
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
        // Kebenaran dibaca dari yang dibekukan saat subtes ditutup, bukan
        // dibandingkan ulang dengan kunci yang berlaku sekarang.
        isCorrect: jawab?.isCorrect ?? null,
        dijawab: Boolean(jawab),
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

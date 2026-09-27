"use server";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  ilike,
  inArray,
  isNotNull,
  like,
  lt,
  or,
  sql,
} from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db, schema } from "@/db";

import { requireAdmin, requireAdminMutation } from "./authz";
import { isUniqueViolation } from "./db-error";
import { masalahSoal, soalBaruSchema } from "./question-import";
import {
  OPTION_LABELS,
  publishProblem,
  readOptions,
  type QuestionOptionInput,
} from "./question-input";
import { slugBebas, slugify } from "./slug";
import { testPublishProblem } from "./test-publish";

const STATUS = ["draft", "published", "archived"] as const;
const DIFFICULTY = ["easy", "medium", "hard"] as const;

// ---------------------------------------------------------------------------
// Kategori
// ---------------------------------------------------------------------------

const categorySchema = z.object({
  id: z.string().optional(),
  code: z
    .string()
    .trim()
    .min(2, "minimal 2 karakter")
    .max(32)
    .regex(/^[A-Z0-9_-]+$/, "hanya huruf kapital, angka, - dan _"),
  name: z.string().trim().min(2, "minimal 2 karakter").max(120),
  description: z.string().trim().max(500).optional(),
  status: z.enum(STATUS),
});

export async function saveCategory(_prev: string | null, form: FormData) {
  await requireAdminMutation();

  const parsed = categorySchema.safeParse({
    id: form.get("id") || undefined,
    code: String(form.get("code") ?? "").toUpperCase(),
    name: form.get("name"),
    description: String(form.get("description") ?? "") || undefined,
    status: form.get("status"),
  });

  if (!parsed.success) return pesanZod(parsed.error);

  const { id, ...nilai } = parsed.data;

  try {
    if (id) {
      await db
        .update(schema.questionCategories)
        .set({ ...nilai, updatedAt: new Date() })
        .where(eq(schema.questionCategories.id, id));
    } else {
      await db.insert(schema.questionCategories).values(nilai);
    }
  } catch (error) {
    return kodeGanda(error, `Kode "${nilai.code}" sudah dipakai kategori lain.`);
  }

  revalidatePath("/admin/kategori");
  return null;
}

// ---------------------------------------------------------------------------
// Soal
// ---------------------------------------------------------------------------

const questionSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, "kategori wajib dipilih"),
  prompt: z.string().trim().min(5, "minimal 5 karakter"),
  explanation: z.string().trim().min(1, "pembahasan wajib diisi"),
  difficulty: z.enum(DIFFICULTY),
  status: z.enum(STATUS),
});

export async function saveQuestion(_prev: string | null, form: FormData) {
  await requireAdminMutation();

  const parsed = questionSchema.safeParse({
    id: form.get("id") || undefined,
    categoryId: form.get("categoryId"),
    prompt: form.get("prompt"),
    explanation: form.get("explanation"),
    difficulty: form.get("difficulty"),
    status: form.get("status"),
  });

  if (!parsed.success) return pesanZod(parsed.error);

  const { id, ...nilai } = parsed.data;
  const opsi = readOptions(form);
  const terkunci = id ? await sudahDikerjakan(id) : false;

  if (nilai.status === "published") {
    const masalah = publishProblem(opsi);
    if (masalah) return masalah;
  }

  if (!terkunci && opsi.length > 0 && opsi.filter((o) => o.isCorrect).length > 1) {
    return "Hanya boleh ada satu jawaban benar.";
  }

  const questionId = await db.transaction(async (tx) => {
    let target = id;

    if (target) {
      await tx
        .update(schema.questions)
        .set({ ...nilai, updatedAt: new Date() })
        .where(eq(schema.questions.id, target));
    } else {
      const [baru] = await tx.insert(schema.questions).values(nilai).returning();
      target = baru.id;
    }

    // Pilihan dan kunci soal yang sudah dikerjakan dibekukan.
    if (!terkunci) {
      await tx.delete(schema.questionOptions).where(eq(schema.questionOptions.questionId, target));
      if (opsi.length > 0) {
        await tx
          .insert(schema.questionOptions)
          .values(opsi.map((o: QuestionOptionInput) => ({ ...o, questionId: target! })));
      }
    }

    return target!;
  });

  revalidatePath("/admin/soal");
  redirect(`/admin/soal/${questionId}`);
}

/**
 * Satu jalur simpan untuk impor JSON maupun tulis manual. Argumen biasa, bukan
 * FormData, karena bentuknya bersarang.
 */
export async function createQuestions(daftar: unknown, status: unknown) {
  await requireAdminMutation();

  const statusParsed = z.enum(STATUS).safeParse(status);
  if (!statusParsed.success) return "Status tidak dikenal.";

  const parsed = z
    .array(soalBaruSchema)
    .min(1, "Belum ada soal untuk disimpan.")
    // ponytail: batas aman satu transaksi. Naikkan bila impor nyata melewatinya.
    .max(200, "Maksimal 200 soal sekali simpan.")
    .safeParse(daftar);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const nomor = typeof issue.path[0] === "number" ? `Soal ${issue.path[0] + 1}: ` : "";
    return `${nomor}${issue.message}`;
  }

  for (const [urutan, s] of parsed.data.entries()) {
    const masalah = masalahSoal(s);
    if (masalah) return `Soal ${urutan + 1}: ${masalah}.`;
  }

  // Id dibuat di sini: urutan `returning()` pada insert banyak baris tidak
  // dijamin, padahal pilihan harus menempel pada soal yang benar.
  const soal = parsed.data.map((s) => ({
    id: crypto.randomUUID(),
    ...s,
    options: s.options.map((o, urutan) => ({
      label: OPTION_LABELS[urutan],
      content: o.content,
      isCorrect: o.isCorrect,
      position: urutan + 1,
    })),
  }));

  await db.transaction(async (tx) => {
    await tx.insert(schema.questions).values(
      soal.map((s) => ({
        id: s.id,
        categoryId: s.categoryId,
        prompt: s.prompt,
        explanation: s.explanation,
        difficulty: s.difficulty,
        status: statusParsed.data,
      })),
    );
    await tx.insert(schema.questionOptions).values(
      soal.flatMap((s) => s.options.map((o) => ({ ...o, questionId: s.id }))),
    );
  });

  revalidatePath("/admin/soal");
  redirect("/admin/soal");
}

export async function duplicateQuestion(_prev: string | null, form: FormData) {
  await requireAdminMutation();

  const id = String(form.get("id") ?? "");
  const asal = await getQuestion(id);
  if (!asal) return "Soal tidak ditemukan.";

  const salinanId = await db.transaction(async (tx) => {
    const [baru] = await tx
      .insert(schema.questions)
      .values({
        categoryId: asal.categoryId,
        prompt: asal.prompt,
        explanation: asal.explanation,
        difficulty: asal.difficulty,
        status: "draft",
      })
      .returning();

    if (asal.options.length > 0) {
      await tx.insert(schema.questionOptions).values(
        asal.options.map((o) => ({
          questionId: baru.id,
          label: o.label,
          content: o.content,
          isCorrect: o.isCorrect,
          position: o.position,
        })),
      );
    }

    await tx
      .update(schema.questions)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(schema.questions.id, id));

    return baru.id;
  });

  revalidatePath("/admin/soal");
  redirect(`/admin/soal/${salinanId}`);
}

// ---------------------------------------------------------------------------
// Pembacaan
// ---------------------------------------------------------------------------

export async function listCategories() {
  await requireAdmin();
  return db.select().from(schema.questionCategories).orderBy(asc(schema.questionCategories.code));
}

export async function listQuestions(filter: {
  categoryId?: string;
  status?: string;
  difficulty?: string;
  q?: string;
}) {
  await requireAdmin();

  const where = [
    filter.categoryId ? eq(schema.questions.categoryId, filter.categoryId) : undefined,
    isOneOf(filter.status, STATUS) ? eq(schema.questions.status, filter.status) : undefined,
    isOneOf(filter.difficulty, DIFFICULTY)
      ? eq(schema.questions.difficulty, filter.difficulty)
      : undefined,
    filter.q ? ilike(schema.questions.prompt, `%${filter.q}%`) : undefined,
  ].filter(Boolean);

  return db
    .select({
      id: schema.questions.id,
      prompt: schema.questions.prompt,
      status: schema.questions.status,
      difficulty: schema.questions.difficulty,
      categoryCode: schema.questionCategories.code,
    })
    .from(schema.questions)
    .innerJoin(
      schema.questionCategories,
      eq(schema.questionCategories.id, schema.questions.categoryId),
    )
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(schema.questions.updatedAt))
    // ponytail: batas tetap, tanpa paginasi. Tambahkan paginasi ketika bank
    // soal benar-benar melewati angka ini.
    .limit(100);
}

export async function getQuestion(id: string) {
  await requireAdmin();

  const [soal] = await db.select().from(schema.questions).where(eq(schema.questions.id, id));
  if (!soal) return null;

  const options = await db
    .select()
    .from(schema.questionOptions)
    .where(eq(schema.questionOptions.questionId, id))
    .orderBy(asc(schema.questionOptions.position));

  return { ...soal, options, locked: await sudahDikerjakan(id) };
}

/** Soal yang sudah pernah dijawab peserta dibekukan pilihan dan kuncinya. */
async function sudahDikerjakan(questionId: string) {
  const assignments = db
    .select({ id: schema.testSubtestQuestions.id })
    .from(schema.testSubtestQuestions)
    .where(eq(schema.testSubtestQuestions.questionId, questionId));

  // Baris tanpa opsi hanya mencatat waktu, bukan jawaban.
  const [row] = await db
    .select({ ada: schema.attemptAnswers.id })
    .from(schema.attemptAnswers)
    .where(
      and(
        inArray(schema.attemptAnswers.testSubtestQuestionId, assignments),
        isNotNull(schema.attemptAnswers.selectedOptionId),
      ),
    )
    .limit(1);

  return Boolean(row);
}

function isOneOf<T extends string>(value: string | undefined, allowed: readonly T[]): value is T {
  return value !== undefined && (allowed as readonly string[]).includes(value);
}

function pesanZod(error: z.ZodError) {
  const issue = error.issues[0];
  return `${issue.path.join(".") || "input"}: ${issue.message}`;
}

function kodeGanda(error: unknown, pesan: string) {
  if (isUniqueViolation(error)) return pesan;
  throw error;
}

// ---------------------------------------------------------------------------
// Subtes
// ---------------------------------------------------------------------------

const subtestSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, "kategori wajib dipilih"),
  code: z
    .string()
    .trim()
    .min(2, "minimal 2 karakter")
    .max(32)
    .regex(/^[A-Z0-9_-]+$/, "hanya huruf kapital, angka, - dan _"),
  name: z.string().trim().min(2, "minimal 2 karakter").max(120),
  description: z.string().trim().max(500).optional(),
  status: z.enum(STATUS),
});

export async function saveSubtest(_prev: string | null, form: FormData) {
  await requireAdminMutation();

  const parsed = subtestSchema.safeParse({
    id: form.get("id") || undefined,
    categoryId: form.get("categoryId"),
    code: String(form.get("code") ?? "").toUpperCase(),
    name: form.get("name"),
    description: String(form.get("description") ?? "") || undefined,
    status: form.get("status"),
  });

  if (!parsed.success) return pesanZod(parsed.error);

  const { id, ...nilai } = parsed.data;

  try {
    if (id) {
      await db
        .update(schema.subtests)
        .set({ ...nilai, updatedAt: new Date() })
        .where(eq(schema.subtests.id, id));
    } else {
      await db.insert(schema.subtests).values(nilai);
    }
  } catch (error) {
    return kodeGanda(error, `Kode "${nilai.code}" sudah dipakai subtes lain.`);
  }

  revalidatePath("/admin/subtes");
  return null;
}

export async function listSubtests() {
  await requireAdmin();

  return db
    .select({
      id: schema.subtests.id,
      categoryId: schema.subtests.categoryId,
      code: schema.subtests.code,
      name: schema.subtests.name,
      description: schema.subtests.description,
      status: schema.subtests.status,
      categoryCode: schema.questionCategories.code,
    })
    .from(schema.subtests)
    .innerJoin(
      schema.questionCategories,
      eq(schema.questionCategories.id, schema.subtests.categoryId),
    )
    .orderBy(asc(schema.subtests.code));
}

// ---------------------------------------------------------------------------
// Produk tes
// ---------------------------------------------------------------------------

/** Publikasi gagal karena konten belum lengkap; membatalkan transaksi. */
class PublishError extends Error {}

const testSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(3, "minimal 3 karakter").max(160),
  description: z.string().trim().min(1, "deskripsi wajib diisi"),
  priceAmount: z.coerce.number().int("harga harus bilangan bulat").min(0, "harga tidak boleh negatif"),
  status: z.enum(STATUS),
});

export async function saveTest(_prev: string | null, form: FormData) {
  await requireAdminMutation();

  const parsed = testSchema.safeParse({
    id: form.get("id") || undefined,
    name: form.get("name"),
    description: form.get("description"),
    priceAmount: form.get("priceAmount"),
    status: form.get("status") ?? "draft",
  });

  if (!parsed.success) return pesanZod(parsed.error);

  const { id, ...nilai } = parsed.data;
  let testId: string;

  try {
    testId = await db.transaction(async (tx) => {
      let target = id;

      if (target) {
        await tx
          .update(schema.tests)
          .set({ ...nilai, updatedAt: new Date() })
          .where(eq(schema.tests.id, target));
      } else {
        // Slug hanya dibuat sekali agar tautan lama tidak putus.
        const dasar = slugify(nilai.name) || "tes";
        const serupa = await tx
          .select({ slug: schema.tests.slug })
          .from(schema.tests)
          .where(or(eq(schema.tests.slug, dasar), like(schema.tests.slug, `${dasar}-%`)));

        const slug = slugBebas(
          dasar,
          serupa.map((t) => t.slug),
        );
        const [baru] = await tx
          .insert(schema.tests)
          .values({ ...nilai, slug })
          .returning();
        target = baru.id;
      }

      // Satu transaksi dengan perubahan status: tes rusak tidak sempat terbit.
      if (nilai.status === "published") {
        const ringkasan = await tx
          .select({
            name: schema.subtests.name,
            subtestStatus: schema.subtests.status,
            questionLimit: schema.testSubtests.questionLimit,
            assigned: count(schema.testSubtestQuestions.id),
            eligible: sql<number>`count(*) filter (where ${schema.questions.status} = 'published' and ${schema.questions.categoryId} = ${schema.subtests.categoryId})`,
          })
          .from(schema.testSubtests)
          .innerJoin(schema.subtests, eq(schema.subtests.id, schema.testSubtests.subtestId))
          .leftJoin(
            schema.testSubtestQuestions,
            eq(schema.testSubtestQuestions.testSubtestId, schema.testSubtests.id),
          )
          .leftJoin(schema.questions, eq(schema.questions.id, schema.testSubtestQuestions.questionId))
          .where(eq(schema.testSubtests.testId, target))
          .groupBy(
            schema.testSubtests.id,
            schema.subtests.name,
            schema.subtests.status,
            schema.subtests.categoryId,
          )
          .orderBy(asc(schema.testSubtests.position));

        const masalah = testPublishProblem(ringkasan);
        if (masalah) throw new PublishError(masalah);
      }

      return target!;
    });
  } catch (error) {
    if (error instanceof PublishError) return error.message;
    // Hanya mungkin bila dua tes bernama sama disimpan pada saat yang sama.
    return kodeGanda(error, "Alamat halaman bentrok dengan tes lain, coba simpan sekali lagi.");
  }

  revalidatePath("/admin/tes");
  redirect(`/admin/tes/${testId}`);
}

const konfigurasiSubtesSchema = z.object({
  durationMinutes: z.coerce.number().int().positive("durasi harus lebih dari nol"),
  questionLimit: z.coerce.number().int().positive("jumlah soal harus lebih dari nol"),
});

export async function addTestSubtest(_prev: string | null, form: FormData) {
  await requireAdminMutation();

  const testId = String(form.get("testId") ?? "");
  const subtestId = String(form.get("subtestId") ?? "");
  if (!subtestId) return "Subtes wajib dipilih.";

  const parsed = konfigurasiSubtesSchema.safeParse({
    durationMinutes: form.get("durationMinutes"),
    questionLimit: form.get("questionLimit"),
  });
  if (!parsed.success) return pesanZod(parsed.error);

  const terkunci = await testTerkunci(testId);
  if (terkunci) return PESAN_TERKUNCI;

  try {
    await db.insert(schema.testSubtests).values({
      testId,
      subtestId,
      durationSeconds: parsed.data.durationMinutes * 60,
      questionLimit: parsed.data.questionLimit,
      position: posisiBerikutnya(
        schema.testSubtests,
        schema.testSubtests.position,
        schema.testSubtests.testId,
        testId,
      ),
    });
  } catch (error) {
    return kodeGanda(error, "Subtes itu sudah ada di tes ini.");
  }

  revalidatePath(`/admin/tes/${testId}`);
  return null;
}

export async function updateTestSubtest(_prev: string | null, form: FormData) {
  await requireAdminMutation();

  const id = String(form.get("id") ?? "");
  const parsed = konfigurasiSubtesSchema.safeParse({
    durationMinutes: form.get("durationMinutes"),
    questionLimit: form.get("questionLimit"),
  });
  if (!parsed.success) return pesanZod(parsed.error);

  const [baris] = await db
    .select({ testId: schema.testSubtests.testId })
    .from(schema.testSubtests)
    .where(eq(schema.testSubtests.id, id));
  if (!baris) return "Konfigurasi subtes tidak ditemukan.";
  if (await testTerkunci(baris.testId)) return PESAN_TERKUNCI;

  await db
    .update(schema.testSubtests)
    .set({
      durationSeconds: parsed.data.durationMinutes * 60,
      questionLimit: parsed.data.questionLimit,
      updatedAt: new Date(),
    })
    .where(eq(schema.testSubtests.id, id));

  revalidatePath(`/admin/tes/${baris.testId}`);
  return null;
}

export async function removeTestSubtest(form: FormData) {
  await requireAdminMutation();

  const id = String(form.get("id") ?? "");
  const [baris] = await db
    .select({ testId: schema.testSubtests.testId })
    .from(schema.testSubtests)
    .where(eq(schema.testSubtests.id, id));
  if (!baris) return;
  if (await testTerkunci(baris.testId)) throw new Error(PESAN_TERKUNCI);

  await db.transaction(async (tx) => {
    await tx
      .delete(schema.testSubtestQuestions)
      .where(eq(schema.testSubtestQuestions.testSubtestId, id));
    await tx.delete(schema.testSubtests).where(eq(schema.testSubtests.id, id));
  });

  revalidatePath(`/admin/tes/${baris.testId}`);
}

export async function moveTestSubtest(form: FormData) {
  await requireAdminMutation();

  const id = String(form.get("id") ?? "");
  const naik = form.get("arah") === "naik";

  const [ini] = await db.select().from(schema.testSubtests).where(eq(schema.testSubtests.id, id));
  if (!ini) return;
  if (await testTerkunci(ini.testId)) throw new Error(PESAN_TERKUNCI);

  const [tetangga] = await db
    .select()
    .from(schema.testSubtests)
    .where(
      and(
        eq(schema.testSubtests.testId, ini.testId),
        naik
          ? lt(schema.testSubtests.position, ini.position)
          : gt(schema.testSubtests.position, ini.position),
      ),
    )
    .orderBy(naik ? desc(schema.testSubtests.position) : asc(schema.testSubtests.position))
    .limit(1);
  if (!tetangga) return;

  await db.transaction(async (tx) => {
    const set = (baris: string, position: number) =>
      tx
        .update(schema.testSubtests)
        .set({ position, updatedAt: new Date() })
        .where(eq(schema.testSubtests.id, baris));

    // UNIQUE(test_id, position) melarang tukar langsung, jadi satu diparkir dulu.
    await set(ini.id, POSISI_PARKIR);
    await set(tetangga.id, ini.position);
    await set(ini.id, tetangga.position);
  });

  revalidatePath(`/admin/tes/${ini.testId}`);
}

export async function addAssignment(_prev: string | null, form: FormData) {
  await requireAdminMutation();

  const testSubtestId = String(form.get("testSubtestId") ?? "");
  const questionIds = [...new Set(form.getAll("questionId").map(String).filter(Boolean))];
  if (questionIds.length === 0) return "Pilih minimal satu soal.";

  const berat = z.coerce.number().int().positive("bobot harus lebih dari nol").safeParse(form.get("weight"));
  if (!berat.success) return pesanZod(berat.error);

  const [konfigurasi] = await db
    .select({ testId: schema.testSubtests.testId, categoryId: schema.subtests.categoryId })
    .from(schema.testSubtests)
    .innerJoin(schema.subtests, eq(schema.subtests.id, schema.testSubtests.subtestId))
    .where(eq(schema.testSubtests.id, testSubtestId));
  if (!konfigurasi) return "Konfigurasi subtes tidak ditemukan.";
  if (await testTerkunci(konfigurasi.testId)) return PESAN_TERKUNCI;

  // Filter formulir tidak cukup: form dapat dikirim dari mana saja.
  const soal = await db
    .select({ categoryId: schema.questions.categoryId, status: schema.questions.status })
    .from(schema.questions)
    .where(inArray(schema.questions.id, questionIds));
  if (soal.length !== questionIds.length) return "Ada soal yang tidak ditemukan.";
  if (soal.some((q) => q.categoryId !== konfigurasi.categoryId)) {
    return "Soal harus sekategori dengan subtes.";
  }
  if (soal.some((q) => q.status !== "published")) {
    return "Hanya soal berstatus published yang dapat ditugaskan.";
  }

  // Bukan `posisiBerikutnya`: subquery-nya memberi angka sama untuk semua baris
  // dalam satu insert.
  const [akhir] = await db
    .select({
      posisi: sql<number>`coalesce(max(${schema.testSubtestQuestions.position}), 0)::int`,
    })
    .from(schema.testSubtestQuestions)
    .where(eq(schema.testSubtestQuestions.testSubtestId, testSubtestId));

  try {
    await db.insert(schema.testSubtestQuestions).values(
      questionIds.map((questionId, urutan) => ({
        testSubtestId,
        questionId,
        weight: berat.data,
        position: akhir.posisi + urutan + 1,
      })),
    );
  } catch (error) {
    return kodeGanda(
      error,
      "Sebagian soal itu sudah ditugaskan ke subtes ini. Muat ulang halaman lalu coba lagi.",
    );
  }

  revalidatePath(`/admin/tes/${konfigurasi.testId}`);
  return null;
}

export async function removeAssignment(form: FormData) {
  await requireAdminMutation();

  const id = String(form.get("id") ?? "");
  const [baris] = await db
    .select({ testId: schema.testSubtests.testId })
    .from(schema.testSubtestQuestions)
    .innerJoin(
      schema.testSubtests,
      eq(schema.testSubtests.id, schema.testSubtestQuestions.testSubtestId),
    )
    .where(eq(schema.testSubtestQuestions.id, id));
  if (!baris) return;
  if (await testTerkunci(baris.testId)) throw new Error(PESAN_TERKUNCI);

  await db.delete(schema.testSubtestQuestions).where(eq(schema.testSubtestQuestions.id, id));

  revalidatePath(`/admin/tes/${baris.testId}`);
}

export async function listTests() {
  await requireAdmin();

  return db
    .select({
      id: schema.tests.id,
      slug: schema.tests.slug,
      name: schema.tests.name,
      priceAmount: schema.tests.priceAmount,
      status: schema.tests.status,
      subtestCount: count(schema.testSubtests.id),
    })
    .from(schema.tests)
    .leftJoin(schema.testSubtests, eq(schema.testSubtests.testId, schema.tests.id))
    .groupBy(schema.tests.id)
    .orderBy(desc(schema.tests.updatedAt));
}

/**
 * Pratinjau admin sebagai paket simulasi di memori, tanpa membuat attempt.
 * Aturan soal yang tampil sama dengan sesi peserta, tanpa menyaring status.
 *
 * ponytail: satu hitung mundur untuk seluruh sesi, bukan per subtes. Butuh
 * runner sendiri bila pratinjau harus meniru pergantian subtes.
 */
export async function getTestPreview(id: string) {
  await requireAdmin();

  const [tes] = await db
    .select({
      id: schema.tests.id,
      slug: schema.tests.slug,
      name: schema.tests.name,
      description: schema.tests.description,
      status: schema.tests.status,
    })
    .from(schema.tests)
    .where(eq(schema.tests.id, id));
  if (!tes) return null;

  const konfigurasi = await db
    .select({
      id: schema.testSubtests.id,
      nama: schema.subtests.name,
      code: schema.subtests.code,
      durationSeconds: schema.testSubtests.durationSeconds,
      questionLimit: schema.testSubtests.questionLimit,
    })
    .from(schema.testSubtests)
    .innerJoin(schema.subtests, eq(schema.subtests.id, schema.testSubtests.subtestId))
    .where(eq(schema.testSubtests.testId, id))
    .orderBy(asc(schema.testSubtests.position));

  const baris = konfigurasi.length
    ? await db
        .select({
          testSubtestId: schema.testSubtestQuestions.testSubtestId,
          questionId: schema.questions.id,
          prompt: schema.questions.prompt,
          explanation: schema.questions.explanation,
          opsi: schema.questionOptions.content,
          benar: schema.questionOptions.isCorrect,
        })
        .from(schema.testSubtestQuestions)
        .innerJoin(schema.questions, eq(schema.questions.id, schema.testSubtestQuestions.questionId))
        .innerJoin(
          schema.questionOptions,
          eq(schema.questionOptions.questionId, schema.questions.id),
        )
        .where(
          inArray(
            schema.testSubtestQuestions.testSubtestId,
            konfigurasi.map((k) => k.id),
          ),
        )
        .orderBy(asc(schema.testSubtestQuestions.position), asc(schema.questionOptions.position))
    : [];

  const soal = konfigurasi.flatMap((k) => {
    const milik = baris.filter((b) => b.testSubtestId === k.id);
    const urutan = [...new Set(milik.map((b) => b.questionId))].slice(0, k.questionLimit);

    return urutan.map((questionId) => {
      const pilihan = milik.filter((b) => b.questionId === questionId);

      return {
        subtes: k.nama,
        singkat: k.code,
        prompt: pilihan[0].prompt,
        opsi: pilihan.map((p) => p.opsi),
        kunci: pilihan.findIndex((p) => p.benar),
        pembahasan: pilihan[0].explanation,
      };
    });
  });

  return {
    tes,
    paket: {
      slug: tes.slug,
      nama: tes.name,
      ringkas: tes.description,
      durasiDetik: konfigurasi.reduce((n, k) => n + k.durationSeconds, 0),
      soal,
    },
  };
}

export async function getTest(id: string) {
  await requireAdmin();

  const [tes] = await db.select().from(schema.tests).where(eq(schema.tests.id, id));
  if (!tes) return null;

  const konfigurasi = await db
    .select({
      id: schema.testSubtests.id,
      subtestId: schema.subtests.id,
      code: schema.subtests.code,
      name: schema.subtests.name,
      subtestStatus: schema.subtests.status,
      categoryId: schema.subtests.categoryId,
      position: schema.testSubtests.position,
      durationSeconds: schema.testSubtests.durationSeconds,
      questionLimit: schema.testSubtests.questionLimit,
    })
    .from(schema.testSubtests)
    .innerJoin(schema.subtests, eq(schema.subtests.id, schema.testSubtests.subtestId))
    .where(eq(schema.testSubtests.testId, id))
    .orderBy(asc(schema.testSubtests.position));

  const assignments = konfigurasi.length
    ? await db
        .select({
          id: schema.testSubtestQuestions.id,
          testSubtestId: schema.testSubtestQuestions.testSubtestId,
          questionId: schema.questions.id,
          position: schema.testSubtestQuestions.position,
          weight: schema.testSubtestQuestions.weight,
          prompt: schema.questions.prompt,
          status: schema.questions.status,
          categoryId: schema.questions.categoryId,
        })
        .from(schema.testSubtestQuestions)
        .innerJoin(schema.questions, eq(schema.questions.id, schema.testSubtestQuestions.questionId))
        .where(
          inArray(
            schema.testSubtestQuestions.testSubtestId,
            konfigurasi.map((k) => k.id),
          ),
        )
        .orderBy(asc(schema.testSubtestQuestions.position))
    : [];

  const kandidat = konfigurasi.length
    ? await db
        .select({
          id: schema.questions.id,
          prompt: schema.questions.prompt,
          difficulty: schema.questions.difficulty,
          categoryId: schema.questions.categoryId,
        })
        .from(schema.questions)
        .where(
          and(
            eq(schema.questions.status, "published"),
            inArray(schema.questions.categoryId, [...new Set(konfigurasi.map((k) => k.categoryId))]),
          ),
        )
        .orderBy(asc(schema.questions.prompt))
        // ponytail: batas tetap seperti listQuestions. Ganti dengan pencarian
        // di dalam formulir bila satu kategori melewati angka ini.
        .limit(300)
    : [];

  return {
    ...tes,
    locked: await testTerkunci(id),
    subtests: konfigurasi.map((k) => {
      const soal = assignments.filter((a) => a.testSubtestId === k.id);
      const terpakai = new Set(soal.map((a) => a.questionId));

      return {
        ...k,
        assignments: soal,
        candidates: kandidat.filter((q) => q.categoryId === k.categoryId && !terpakai.has(q.id)),
      };
    }),
  };
}

const PESAN_TERKUNCI =
  "Tes ini sudah pernah dikerjakan, jadi susunan subtes dan soalnya dibekukan.";

/** Di luar jangkauan posisi nyata. */
const POSISI_PARKIR = 1_000_000;

/** Attempt lama menunjuk susunan tes ini, jadi susunannya dibekukan. */
async function testTerkunci(testId: string) {
  const konfigurasi = db
    .select({ id: schema.testSubtests.id })
    .from(schema.testSubtests)
    .where(eq(schema.testSubtests.testId, testId));

  const [row] = await db
    .select({ ada: schema.attemptSubtests.id })
    .from(schema.attemptSubtests)
    .where(inArray(schema.attemptSubtests.testSubtestId, konfigurasi))
    .limit(1);

  return Boolean(row);
}

function posisiBerikutnya(
  table: PgTable,
  position: PgColumn,
  parent: PgColumn,
  parentId: string,
) {
  return sql<number>`(select coalesce(max(${position}), 0) + 1 from ${table} where ${parent} = ${parentId})`;
}

// ---------------------------------------------------------------------------
// Dasbor
// ---------------------------------------------------------------------------

export async function adminStats() {
  await requireAdmin();

  const [ringkasan] = await db
    .select({
      kategori: sql<number>`(select count(*) from ${schema.questionCategories})::int`,
      soal: sql<number>`(select count(*) from ${schema.questions})::int`,
      soalTerbit: sql<number>`(select count(*) from ${schema.questions} where status = 'published')::int`,
      subtes: sql<number>`(select count(*) from ${schema.subtests})::int`,
      tes: sql<number>`(select count(*) from ${schema.tests})::int`,
      tesTerbit: sql<number>`(select count(*) from ${schema.tests} where status = 'published')::int`,
    })
    .from(sql`(select 1) as x`);

  // Subtes yang soalnya kurang dari `question_limit`: penghalang publikasi.
  const kurang = await db
    .select({
      testId: schema.tests.id,
      testName: schema.tests.name,
      testStatus: schema.tests.status,
      subtestName: schema.subtests.name,
      questionLimit: schema.testSubtests.questionLimit,
      assigned: count(schema.testSubtestQuestions.id),
    })
    .from(schema.testSubtests)
    .innerJoin(schema.tests, eq(schema.tests.id, schema.testSubtests.testId))
    .innerJoin(schema.subtests, eq(schema.subtests.id, schema.testSubtests.subtestId))
    .leftJoin(
      schema.testSubtestQuestions,
      eq(schema.testSubtestQuestions.testSubtestId, schema.testSubtests.id),
    )
    .groupBy(
      schema.testSubtests.id,
      schema.tests.id,
      schema.tests.name,
      schema.tests.status,
      schema.subtests.name,
      schema.testSubtests.questionLimit,
    )
    .having(sql`count(${schema.testSubtestQuestions.id}) < ${schema.testSubtests.questionLimit}`)
    .orderBy(asc(schema.tests.name))
    .limit(20);

  return { ...ringkasan, kurang };
}

// ---------------------------------------------------------------------------
// Spanduk
// ---------------------------------------------------------------------------

const bannerSchema = z.object({
  id: z.string().optional(),
  imageUrl: z
    .string()
    .trim()
    .url("harus berupa URL lengkap, misalnya https://cdn.contoh.com/spanduk-1.jpg"),
  alt: z.string().trim().min(3, "teks alternatif minimal 3 karakter"),
});

export async function saveBanner(_prev: string | null, form: FormData) {
  await requireAdminMutation();

  const parsed = bannerSchema.safeParse({
    id: form.get("id") || undefined,
    imageUrl: form.get("imageUrl"),
    alt: form.get("alt"),
  });

  if (!parsed.success) return pesanZod(parsed.error);

  const { id, ...nilai } = parsed.data;

  if (id) {
    await db
      .update(schema.banners)
      .set({ ...nilai, updatedAt: new Date() })
      .where(eq(schema.banners.id, id));
  } else {
    const [{ terbesar }] = await db
      .select({ terbesar: sql<number>`coalesce(max(${schema.banners.position}), 0)` })
      .from(schema.banners);

    await db.insert(schema.banners).values({ ...nilai, position: terbesar + 1 });
  }

  revalidatePath("/admin/spanduk");
  revalidatePath("/produk");
  return null;
}

export async function moveBanner(form: FormData) {
  await requireAdminMutation();

  const id = String(form.get("id") ?? "");
  const naik = form.get("arah") === "naik";

  const [ini] = await db.select().from(schema.banners).where(eq(schema.banners.id, id));
  if (!ini) return;

  const [tetangga] = await db
    .select()
    .from(schema.banners)
    .where(naik ? lt(schema.banners.position, ini.position) : gt(schema.banners.position, ini.position))
    .orderBy(naik ? desc(schema.banners.position) : asc(schema.banners.position))
    .limit(1);
  if (!tetangga) return;

  // Posisi spanduk tidak unik, jadi keduanya cukup ditukar langsung.
  await db.transaction(async (tx) => {
    const set = (baris: string, position: number) =>
      tx
        .update(schema.banners)
        .set({ position, updatedAt: new Date() })
        .where(eq(schema.banners.id, baris));

    await set(ini.id, tetangga.position);
    await set(tetangga.id, ini.position);
  });

  revalidatePath("/admin/spanduk");
  revalidatePath("/produk");
}

export async function removeBanner(form: FormData) {
  await requireAdminMutation();

  await db.delete(schema.banners).where(eq(schema.banners.id, String(form.get("id") ?? "")));

  revalidatePath("/admin/spanduk");
  revalidatePath("/produk");
}

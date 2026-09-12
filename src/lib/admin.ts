"use server";

import { and, asc, count, desc, eq, gt, ilike, inArray, lt, sql } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db, schema } from "@/db";

import { requireAdmin, requireAdminMutation } from "./authz";
import { isUniqueViolation } from "./db-error";
import { publishProblem, readOptions, type QuestionOptionInput } from "./question-input";
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

  // Publikasi menuntut soal yang benar-benar dapat dikerjakan.
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

    // Soal yang sudah pernah dikerjakan tidak boleh berubah pilihan maupun
    // kunci jawabannya; hasil attempt lama harus tetap dapat dipercaya.
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

    // Versi lama diarsipkan agar tidak lagi dipakai pada tes baru.
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

/** Soal yang sudah pernah dijawab peserta tidak boleh berubah secara substantif. */
async function sudahDikerjakan(questionId: string) {
  const assignments = db
    .select({ id: schema.testSubtestQuestions.id })
    .from(schema.testSubtestQuestions)
    .where(eq(schema.testSubtestQuestions.questionId, questionId));

  const [row] = await db
    .select({ ada: schema.attemptAnswers.id })
    .from(schema.attemptAnswers)
    .where(inArray(schema.attemptAnswers.testSubtestQuestionId, assignments))
    .limit(1);

  return Boolean(row);
}

// ---------------------------------------------------------------------------

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
  slug: z
    .string()
    .trim()
    .min(3, "minimal 3 karakter")
    .max(64)
    .regex(/^[a-z0-9-]+$/, "hanya huruf kecil, angka, dan tanda hubung"),
  name: z.string().trim().min(3, "minimal 3 karakter").max(160),
  description: z.string().trim().min(1, "deskripsi wajib diisi"),
  priceAmount: z.coerce.number().int("harga harus bilangan bulat").min(0, "harga tidak boleh negatif"),
  status: z.enum(STATUS),
});

export async function saveTest(_prev: string | null, form: FormData) {
  await requireAdminMutation();

  const parsed = testSchema.safeParse({
    id: form.get("id") || undefined,
    slug: String(form.get("slug") ?? "").toLowerCase(),
    name: form.get("name"),
    description: form.get("description"),
    priceAmount: form.get("priceAmount"),
    status: form.get("status"),
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
        const [baru] = await tx.insert(schema.tests).values(nilai).returning();
        target = baru.id;
      }

      // Kelengkapan diperiksa di dalam transaksi yang sama dengan perubahan
      // status, sehingga tes tidak pernah sempat terbit dalam keadaan rusak.
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
    return kodeGanda(error, `Slug "${nilai.slug}" sudah dipakai tes lain.`);
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

/** Menukar posisi dengan subtes tetangga. Urutan subtes terlihat oleh peserta. */
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

    // UNIQUE(test_id, position) melarang dua baris berbagi posisi walau sesaat,
    // jadi salah satu diparkir di posisi yang pasti tidak terpakai.
    await set(ini.id, POSISI_PARKIR);
    await set(tetangga.id, ini.position);
    await set(ini.id, tetangga.position);
  });

  revalidatePath(`/admin/tes/${ini.testId}`);
}

export async function addAssignment(_prev: string | null, form: FormData) {
  await requireAdminMutation();

  const testSubtestId = String(form.get("testSubtestId") ?? "");
  const questionId = String(form.get("questionId") ?? "");
  if (!questionId) return "Soal wajib dipilih.";

  const berat = z.coerce.number().int().positive("bobot harus lebih dari nol").safeParse(form.get("weight"));
  if (!berat.success) return pesanZod(berat.error);

  const [konfigurasi] = await db
    .select({ testId: schema.testSubtests.testId, categoryId: schema.subtests.categoryId })
    .from(schema.testSubtests)
    .innerJoin(schema.subtests, eq(schema.subtests.id, schema.testSubtests.subtestId))
    .where(eq(schema.testSubtests.id, testSubtestId));
  if (!konfigurasi) return "Konfigurasi subtes tidak ditemukan.";
  if (await testTerkunci(konfigurasi.testId)) return PESAN_TERKUNCI;

  // Pilihan di formulir sudah difilter, tetapi assignment tetap diperiksa di
  // server: form dapat dikirim dari mana saja.
  const [soal] = await db
    .select({ categoryId: schema.questions.categoryId, status: schema.questions.status })
    .from(schema.questions)
    .where(eq(schema.questions.id, questionId));
  if (!soal) return "Soal tidak ditemukan.";
  if (soal.categoryId !== konfigurasi.categoryId) return "Soal harus sekategori dengan subtes.";
  if (soal.status !== "published") return "Hanya soal berstatus published yang dapat ditugaskan.";

  try {
    await db.insert(schema.testSubtestQuestions).values({
      testSubtestId,
      questionId,
      weight: berat.data,
      position: posisiBerikutnya(
        schema.testSubtestQuestions,
        schema.testSubtestQuestions.position,
        schema.testSubtestQuestions.testSubtestId,
        testSubtestId,
      ),
    });
  } catch (error) {
    return kodeGanda(error, "Soal itu sudah ditugaskan ke subtes ini.");
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

  // Kandidat seluruh kategori yang terpakai diambil sekali, lalu dikelompokkan
  // di memori. Satu query lebih murah daripada satu query per subtes.
  const kandidat = konfigurasi.length
    ? await db
        .select({
          id: schema.questions.id,
          prompt: schema.questions.prompt,
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

/** Posisi parkir sementara saat menukar dua posisi. Di luar jangkauan nyata. */
const POSISI_PARKIR = 1_000_000;

/**
 * Tes yang sudah pernah dikerjakan tidak boleh berubah susunannya: attempt lama
 * menunjuk konfigurasi ini, dan hasilnya harus tetap dapat dibaca apa adanya.
 */
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

/** Posisi berikutnya dihitung database, sehingga tidak perlu dibaca dulu. */
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

/**
 * Angka ringkas untuk dasbor admin beserta daftar tes yang belum siap terbit.
 * Dihitung database agar halaman tidak perlu menarik seluruh baris.
 */
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

  // Subtes yang jumlah assignment-nya belum memenuhi question limit. Inilah
  // yang menghalangi publikasi, jadi ditampilkan sebagai daftar tindakan.
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

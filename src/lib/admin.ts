"use server";

import { and, asc, desc, eq, ilike, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db, schema } from "@/db";

import { requireAdmin, requireAdminMutation } from "./authz";
import { isUniqueViolation } from "./db-error";
import { publishProblem, readOptions, type QuestionOptionInput } from "./question-input";

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

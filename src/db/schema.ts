import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export * from "./auth-schema";

// ---------------------------------------------------------------------------
// Status. Lihat docs/DATABASE_DESIGN.md bagian 7.
// ---------------------------------------------------------------------------

export const contentStatus = pgEnum("content_status", ["draft", "published", "archived"]);

export const questionDifficulty = pgEnum("question_difficulty", ["easy", "medium", "hard"]);

export const orderStatus = pgEnum("order_status", [
  "pending",
  "paid",
  "expired",
  "cancelled",
  "refunded",
]);

export const paymentStatus = pgEnum("payment_status", ["pending", "paid", "expired", "refunded"]);

export const attemptStatus = pgEnum("attempt_status", [
  "not_started",
  "in_progress",
  "submitted",
  "submitted_by_timeout",
  "expired",
]);

export const attemptSubtestStatus = pgEnum("attempt_subtest_status", [
  "not_started",
  "in_progress",
  "submitted",
  "submitted_by_timeout",
]);

// ---------------------------------------------------------------------------
// Kolom berulang. Primary key `text` berisi UUID v4, dibuat aplikasi.
// ---------------------------------------------------------------------------

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

// ---------------------------------------------------------------------------
// Konten
// ---------------------------------------------------------------------------

/**
 * Spanduk korsel di kepala halaman produk. Berkas gambarnya tinggal di
 * penyimpanan objek (Cloudflare R2) dan tabel ini hanya memegang alamatnya —
 * gambar tidak pernah masuk basis data maupun repositori.
 *
 * Tidak ada kolom status: spanduk yang tidak ingin tampil dihapus saja, dan
 * satu-satunya urutan yang berlaku adalah `position`.
 */
export const banners = pgTable(
  "banners",
  {
    id: id(),
    imageUrl: text("image_url").notNull(),
    // Wajib: korsel tanpa teks alternatif tidak terbaca pembaca layar.
    alt: text("alt").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("banners_position_idx").on(t.position)],
);

export const questionCategories = pgTable("question_categories", {
  id: id(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  status: contentStatus("status").notNull().default("draft"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const questions = pgTable(
  "questions",
  {
    id: id(),
    categoryId: text("category_id")
      .notNull()
      .references(() => questionCategories.id),
    prompt: text("prompt").notNull(),
    difficulty: questionDifficulty("difficulty").notNull().default("medium"),
    explanation: text("explanation").notNull(),
    status: contentStatus("status").notNull().default("draft"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("questions_category_status_difficulty_idx").on(t.categoryId, t.status, t.difficulty),
  ],
);

export const questionOptions = pgTable(
  "question_options",
  {
    id: id(),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    content: text("content").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    position: integer("position").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("question_options_question_position_key").on(t.questionId, t.position),
    // Maksimal satu jawaban benar per soal. Minimal satu divalidasi saat publish.
    uniqueIndex("question_options_single_correct_key")
      .on(t.questionId)
      .where(sql`${t.isCorrect}`),
    check("question_options_position_positive", sql`${t.position} > 0`),
  ],
);

export const subtests = pgTable("subtests", {
  id: id(),
  categoryId: text("category_id")
    .notNull()
    .references(() => questionCategories.id),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  status: contentStatus("status").notNull().default("draft"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const tests = pgTable(
  "tests",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    priceAmount: integer("price_amount").notNull(),
    status: contentStatus("status").notNull().default("draft"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [check("tests_price_amount_non_negative", sql`${t.priceAmount} >= 0`)],
);

export const testSubtests = pgTable(
  "test_subtests",
  {
    id: id(),
    testId: text("test_id")
      .notNull()
      .references(() => tests.id),
    subtestId: text("subtest_id")
      .notNull()
      .references(() => subtests.id),
    position: integer("position").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    questionLimit: integer("question_limit").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("test_subtests_test_subtest_key").on(t.testId, t.subtestId),
    uniqueIndex("test_subtests_test_position_key").on(t.testId, t.position),
    check("test_subtests_position_positive", sql`${t.position} > 0`),
    check("test_subtests_duration_positive", sql`${t.durationSeconds} > 0`),
    check("test_subtests_question_limit_positive", sql`${t.questionLimit} > 0`),
  ],
);

export const testSubtestQuestions = pgTable(
  "test_subtest_questions",
  {
    id: id(),
    testSubtestId: text("test_subtest_id")
      .notNull()
      .references(() => testSubtests.id),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id),
    position: integer("position").notNull(),
    weight: integer("weight").notNull().default(1),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("test_subtest_questions_subtest_question_key").on(t.testSubtestId, t.questionId),
    uniqueIndex("test_subtest_questions_subtest_position_key").on(t.testSubtestId, t.position),
    check("test_subtest_questions_position_positive", sql`${t.position} > 0`),
    check("test_subtest_questions_weight_positive", sql`${t.weight} > 0`),
  ],
);

// ---------------------------------------------------------------------------
// Transaksi
// ---------------------------------------------------------------------------

export const orders = pgTable(
  "orders",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    testId: text("test_id")
      .notNull()
      .references(() => tests.id),
    amount: integer("amount").notNull(),
    status: orderStatus("status").notNull().default("pending"),
    // Diisi saat pembayaran berhasil, 30 hari setelahnya. Lihat RT-009.
    accessExpiresAt: timestamp("access_expires_at", { withTimezone: true }),
    /**
     * Tiga kolom di bawah hanya terisi pada order yang diberikan admin sebagai
     * penggantian akses (RT-015), dan sekaligus menjadi jejak auditnya: siapa
     * yang memberi, alasannya, dan order mana yang digantikan. Order itu
     * sendiri sudah satu baris per pemberian, jadi tidak perlu tabel log
     * terpisah yang bisa melenceng dari order yang dicatatnya.
     */
    grantedBy: text("granted_by").references(() => user.id),
    grantReason: text("grant_reason"),
    replacesOrderId: text("replaces_order_id").references((): AnyPgColumn => orders.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("orders_user_created_idx").on(t.userId, t.createdAt),
    index("orders_status_created_idx").on(t.status, t.createdAt),
    check("orders_amount_non_negative", sql`${t.amount} >= 0`),
    // Alasan wajib menyertai pemberi: jejak audit tanpa keduanya tidak berguna.
    check(
      "orders_grant_reason_with_granter",
      sql`(${t.grantedBy} is null and ${t.grantReason} is null) or (${t.grantedBy} is not null and ${t.grantReason} is not null)`,
    ),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: id(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    provider: text("provider").notNull(),
    externalId: text("external_id").notNull(),
    requestId: text("request_id").notNull(),
    /** Payload QRIS dari DOKU; dirender menjadi QR di halaman pesanan. */
    qrContent: text("qr_content"),
    /** `referenceNo` milik DOKU dari respons generate; dibutuhkan Query QRIS. */
    referenceNo: text("reference_no"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    amount: integer("amount").notNull(),
    status: paymentStatus("status").notNull().default("pending"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // Webhook idempotent.
    uniqueIndex("payments_provider_external_id_key").on(t.provider, t.externalId),
    // Pembuatan checkout tidak diproses dua kali.
    uniqueIndex("payments_provider_request_id_key").on(t.provider, t.requestId),
    index("payments_order_idx").on(t.orderId),
    check("payments_amount_non_negative", sql`${t.amount} >= 0`),
  ],
);

// ---------------------------------------------------------------------------
// Pengerjaan
// ---------------------------------------------------------------------------

export const testAttempts = pgTable("test_attempts", {
  id: id(),
  // Satu order memberikan maksimal satu attempt.
  orderId: text("order_id")
    .notNull()
    .unique()
    .references(() => orders.id),
  status: attemptStatus("status").notNull().default("not_started"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  finalScore: integer("final_score"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const attemptSubtests = pgTable(
  "attempt_subtests",
  {
    id: id(),
    attemptId: text("attempt_id")
      .notNull()
      .references(() => testAttempts.id),
    testSubtestId: text("test_subtest_id")
      .notNull()
      .references(() => testSubtests.id),
    status: attemptSubtestStatus("status").notNull().default("not_started"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    score: integer("score"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("attempt_subtests_attempt_subtest_key").on(t.attemptId, t.testSubtestId)],
);

export const attemptAnswers = pgTable(
  "attempt_answers",
  {
    id: id(),
    attemptSubtestId: text("attempt_subtest_id")
      .notNull()
      .references(() => attemptSubtests.id),
    testSubtestQuestionId: text("test_subtest_question_id")
      .notNull()
      .references(() => testSubtestQuestions.id),
    // Null berarti soal dilewati.
    selectedOptionId: text("selected_option_id").references(() => questionOptions.id),
    isCorrect: boolean("is_correct"),
    // Lama soal ini dibuka peserta, dijumlahkan di klien lalu disetor bersama
    // jawabannya. Soal yang dibuka tetapi tidak dijawab tetap punya barisnya,
    // dengan `selected_option_id` null — itulah arti "dilewati" di atas.
    secondsSpent: integer("seconds_spent").notNull().default(0),
    answeredAt: timestamp("answered_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // Kunci upsert autosave.
    uniqueIndex("attempt_answers_subtest_question_key").on(
      t.attemptSubtestId,
      t.testSubtestQuestionId,
    ),
  ],
);

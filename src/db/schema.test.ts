import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "vitest";

const dir = join(process.cwd(), "drizzle");

const sql = readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => readFileSync(join(dir, f), "utf8"))
  .join("\n");

/**
 * Menjaga jaminan yang tidak boleh hilang dari migrasi. Perilaku nyatanya
 * sudah diuji terhadap Neon; test ini mencegah constraint terhapus tanpa
 * sengaja saat schema berubah.
 */
const wajib: [string, RegExp][] = [
  ["satu order maksimal satu attempt", /test_attempts_order_id_unique/],
  ["assignment soal tidak duplikat", /test_subtest_questions_subtest_question_key/],
  ["webhook idempotent", /payments_provider_external_id_key/],
  ["checkout tidak diproses dua kali", /payments_provider_request_id_key/],
  ["kunci upsert autosave", /attempt_answers_subtest_question_key/],
  ["maksimal satu jawaban benar", /question_options_single_correct_key/],
  ["nominal order tidak negatif", /orders_amount_non_negative/],
  ["nominal payment tidak negatif", /payments_amount_non_negative/],
  ["weight harus positif", /test_subtest_questions_weight_positive/],
];

test.each(wajib)("migrasi mempertahankan: %s", (_nama, pola) => {
  expect(sql).toMatch(pola);
});

test("soal tidak dimiliki langsung oleh tes atau subtes", () => {
  const tabelQuestions = sql.match(/CREATE TABLE "questions" \([^;]+\);/)?.[0] ?? "";
  expect(tabelQuestions).not.toMatch(/test_id|subtest_id/);
});

test("seluruh tabel domain MVP ada di migrasi", () => {
  const tabel = [...sql.matchAll(/CREATE TABLE "([a-z_]+)"/g)].map((m) => m[1]);
  expect(tabel).toHaveLength(12);
  expect(tabel).toContain("test_subtest_questions");
});

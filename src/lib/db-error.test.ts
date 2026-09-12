import { expect, test } from "vitest";

import { isUniqueViolation } from "./db-error";

/** Bentuk nyata galat Drizzle: pesan terluar hanya query, kode ada di cause. */
function galatDrizzle() {
  const luar = new Error('Failed query: insert into "question_categories" ...');
  (luar as Error & { cause: unknown }).cause = Object.assign(new Error("duplicate key"), {
    code: "23505",
    constraint: "question_categories_code_unique",
  });
  return luar;
}

test("mengenali unique violation yang tersembunyi di cause", () => {
  expect(isUniqueViolation(galatDrizzle())).toBe(true);
});

test("kode pada error terluar juga dikenali", () => {
  expect(isUniqueViolation(Object.assign(new Error("x"), { code: "23505" }))).toBe(true);
});

test("pelanggaran constraint lain tidak dianggap duplikat", () => {
  // 23514 = check_violation, misalnya amount negatif.
  const e = new Error("luar");
  (e as Error & { cause: unknown }).cause = Object.assign(new Error("check"), { code: "23514" });

  expect(isUniqueViolation(e)).toBe(false);
});

test("galat biasa dan nilai kosong tidak dianggap duplikat", () => {
  expect(isUniqueViolation(new Error("duplicate key value violates"))).toBe(false);
  expect(isUniqueViolation(null)).toBe(false);
  expect(isUniqueViolation(undefined)).toBe(false);
});

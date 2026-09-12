import { expect, test } from "vitest";

import { testPublishProblem, type SubtestSummary } from "./test-publish";

const lengkap: SubtestSummary = {
  name: "Numerik",
  subtestStatus: "published",
  questionLimit: 10,
  assigned: 10,
  eligible: 10,
};

test("tes tanpa subtes tidak dapat terbit", () => {
  expect(testPublishProblem([])).toMatch(/minimal satu subtes/);
});

test("subtes lengkap lolos", () => {
  expect(testPublishProblem([lengkap, { ...lengkap, name: "Verbal" }])).toBeNull();
});

test("jumlah soal kurang dari question limit ditolak", () => {
  expect(testPublishProblem([{ ...lengkap, assigned: 9, eligible: 9 }])).toMatch(/9 dari 10/);
});

test("soal yang tidak lagi terbit atau beda kategori ditolak", () => {
  expect(testPublishProblem([{ ...lengkap, eligible: 9 }])).toMatch(/tidak terbit/);
});

test("subtes yang belum published ditolak", () => {
  expect(testPublishProblem([{ ...lengkap, subtestStatus: "draft" }])).toMatch(/belum berstatus/);
});

test("subtes bermasalah pertama yang dilaporkan", () => {
  const pesan = testPublishProblem([lengkap, { ...lengkap, name: "Verbal", assigned: 0, eligible: 0 }]);
  expect(pesan).toContain("Verbal");
});

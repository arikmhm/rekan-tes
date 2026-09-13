import { expect, test } from "vitest";

import {
  activeSubtest,
  attemptAccessProblem,
  nextSubtest,
  subtestDeadline,
  type SubtestProgress,
} from "./attempt-flow";

const now = new Date("2026-09-13T10:00:00Z");

const subtes = (position: number, status: string, startedAt: Date | null = null): SubtestProgress => ({
  position,
  status,
  startedAt,
  durationSeconds: 600,
});

test("order belum lunas tidak dapat dikerjakan", () => {
  expect(attemptAccessProblem({ status: "pending", accessExpiresAt: null }, now)).toMatch(/belum lunas/);
});

test("masa akses yang habis mencabut hak kerja", () => {
  const kemarin = new Date(now.getTime() - 86_400_000);
  expect(attemptAccessProblem({ status: "paid", accessExpiresAt: kemarin }, now)).toMatch(/masa akses/i);
});

test("order lunas dengan masa akses aktif lolos", () => {
  const besok = new Date(now.getTime() + 86_400_000);
  expect(attemptAccessProblem({ status: "paid", accessExpiresAt: besok }, now)).toBeNull();
});

test("subtes aktif adalah yang pertama belum disubmit", () => {
  const rows = [subtes(1, "submitted"), subtes(2, "in_progress"), subtes(3, "not_started")];
  expect(activeSubtest(rows)?.position).toBe(2);
});

test("subtes submitted karena timeout ikut dilewati", () => {
  const rows = [subtes(1, "submitted_by_timeout"), subtes(2, "not_started")];
  expect(activeSubtest(rows)?.position).toBe(2);
});

test("urutan ditentukan position, bukan urutan array", () => {
  const rows = [subtes(3, "not_started"), subtes(1, "submitted"), subtes(2, "not_started")];
  expect(activeSubtest(rows)?.position).toBe(2);
  expect(nextSubtest(rows, 2)?.position).toBe(3);
});

test("seluruh subtes selesai berarti tidak ada yang aktif", () => {
  expect(activeSubtest([subtes(1, "submitted"), subtes(2, "submitted_by_timeout")])).toBeNull();
  expect(nextSubtest([subtes(1, "submitted")], 1)).toBeNull();
});

test("deadline dihitung dari started_at server", () => {
  expect(subtestDeadline(subtes(1, "in_progress", now))).toEqual(new Date("2026-09-13T10:10:00Z"));
});

test("subtes yang belum dimulai belum punya deadline", () => {
  expect(subtestDeadline(subtes(1, "not_started"))).toBeNull();
});

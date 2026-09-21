import { expect, test } from "vitest";

import {
  activeSubtest,
  attemptAccessProblem,
  jawabanPulih,
  nextSubtest,
  ringkasSubtes,
  subtestDeadline,
  timeoutPlan,
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

test("subtes yang masih punya sisa waktu tidak ditutup", () => {
  const jalan = subtes(1, "in_progress", new Date(now.getTime() - 60_000));
  expect(timeoutPlan([jalan, subtes(2, "not_started")], now)).toEqual([]);
});

test("subtes yang belum dimulai tidak punya deadline untuk dilanggar", () => {
  expect(timeoutPlan([subtes(1, "not_started")], now)).toEqual([]);
});

test("deadline lewat menutup subtes dan menjalankan penerusnya sejak deadline", () => {
  const mulai = new Date(now.getTime() - 700_000);
  const plan = timeoutPlan([subtes(1, "in_progress", mulai), subtes(2, "not_started")], now);

  expect(plan).toHaveLength(1);
  expect(plan[0].close.position).toBe(1);
  expect(plan[0].at).toEqual(new Date(mulai.getTime() + 600_000));
  expect(plan[0].start?.position).toBe(2);
});

test("peramban yang lama ditutup menutup beberapa subtes sekaligus", () => {
  const mulai = new Date(now.getTime() - 7_200_000);
  const plan = timeoutPlan(
    [subtes(1, "in_progress", mulai), subtes(2, "not_started"), subtes(3, "not_started")],
    now,
  );

  expect(plan.map((s) => s.close.position)).toEqual([1, 2, 3]);
  // Subtes ketiga mulai dua durasi setelah subtes pertama, bukan saat dibuka.
  expect(plan[2].at).toEqual(new Date(mulai.getTime() + 3 * 600_000));
  expect(plan[2].start).toBeNull();
});

test("subtes terakhir yang habis waktunya tidak punya penerus", () => {
  const mulai = new Date(now.getTime() - 700_000);
  expect(timeoutPlan([subtes(1, "submitted"), subtes(2, "in_progress", mulai)], now)[0].start).toBeNull();
});

const soal = (weight: number, dijawab: boolean, isCorrect: boolean | null) => ({ weight, dijawab, isCorrect });

test("skor adalah jumlah bobot jawaban benar", () => {
  const hasil = ringkasSubtes([soal(1, true, true), soal(3, true, true), soal(1, true, false)]);
  expect(hasil.skor).toBe(4);
  expect(hasil.maksimal).toBe(5);
});

test("jawaban salah dan kosong bernilai nol tanpa penalti", () => {
  const hasil = ringkasSubtes([soal(2, true, false), soal(2, false, null)]);
  expect(hasil).toMatchObject({ benar: 0, salah: 1, kosong: 1, skor: 0, maksimal: 4 });
});

test("soal yang dijawab tetapi belum dinilai dihitung salah, bukan benar", () => {
  expect(ringkasSubtes([soal(5, true, null)])).toMatchObject({ benar: 0, salah: 1, skor: 0 });
});

test("subtes tanpa soal tidak membagi nol", () => {
  expect(ringkasSubtes([])).toEqual({ benar: 0, salah: 0, kosong: 0, skor: 0, maksimal: 0 });
});

const soalPulih = [
  { assignmentId: "a1", selectedOptionId: null, options: [{ id: "o1" }, { id: "o2" }] },
  { assignmentId: "a2", selectedOptionId: "o3", options: [{ id: "o3" }, { id: "o4" }] },
];

test("jawaban cadangan yang belum sampai ke server dipulihkan", () => {
  expect(jawabanPulih({ a1: "o2" }, soalPulih)).toEqual([["a1", "o2"]]);
});

test("jawaban yang sudah sama dengan catatan server tidak dipulihkan", () => {
  expect(jawabanPulih({ a2: "o3" }, soalPulih)).toEqual([]);
});

test("opsi milik soal lain dan assignment sesi lama ditolak", () => {
  expect(jawabanPulih({ a1: "o4", a9: "o1" }, soalPulih)).toEqual([]);
});

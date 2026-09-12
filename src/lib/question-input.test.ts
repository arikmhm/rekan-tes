import { expect, test } from "vitest";

import { publishProblem, readOptions } from "./question-input";

/** FormData asli; readOptions hanya butuh `get`. */
function form(nilai: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(nilai)) fd.set(k, v);
  return fd;
}

test("slot kosong dibuang dan posisi dirapatkan", () => {
  // Slot 2 dan 4 kosong; slot 5 harus menjadi posisi 3.
  const opsi = readOptions(form({ opsi1: "dua", opsi3: "tiga", opsi5: "lima", benar: "5" }));

  expect(opsi.map((o) => [o.label, o.content, o.position])).toEqual([
    ["A", "dua", 1],
    ["B", "tiga", 2],
    ["C", "lima", 3],
  ]);
  // Radio menunjuk slot 5, yang kini berada di posisi 3.
  expect(opsi.filter((o) => o.isCorrect)).toEqual([
    { label: "C", content: "lima", isCorrect: true, position: 3 },
  ]);
});

test("spasi dipangkas dan slot berisi spasi dianggap kosong", () => {
  const opsi = readOptions(form({ opsi1: "  a  ", opsi2: "   ", benar: "1" }));

  expect(opsi).toHaveLength(1);
  expect(opsi[0].content).toBe("a");
});

test("tanpa radio terpilih, tidak ada jawaban benar", () => {
  const opsi = readOptions(form({ opsi1: "a", opsi2: "b" }));

  expect(opsi.some((o) => o.isCorrect)).toBe(false);
});

test("publikasi butuh minimal dua pilihan", () => {
  expect(publishProblem(readOptions(form({ opsi1: "a", benar: "1" })))).toMatch(/dua pilihan/);
});

test("publikasi butuh tepat satu jawaban benar", () => {
  expect(publishProblem(readOptions(form({ opsi1: "a", opsi2: "b" })))).toMatch(/tepat satu/);
});

test("pilihan lengkap dengan satu kunci lolos publikasi", () => {
  expect(publishProblem(readOptions(form({ opsi1: "a", opsi2: "b", benar: "2" })))).toBeNull();
});

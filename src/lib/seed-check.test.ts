import { readFileSync } from "node:fs";

import { expect, test } from "vitest";

import { bacaJson, masalahSoal } from "./question-import";

const kategori = new Map([
  ["KETELITIAN", "kat-ketelitian"],
  ["KESAMAAN", "kat-kesamaan"],
]);

test.each(["soal-ketelitian", "soal-kesamaan"])("seed/%s.json lolos impor", (nama) => {
  const { soal, galat } = bacaJson(readFileSync(`seed/${nama}.json`, "utf8"), kategori);

  expect(galat).toEqual([]);
  expect(soal).toHaveLength(50);
  expect(soal.map(masalahSoal)).toEqual(Array(50).fill(null));
});

test("kunci ketelitian benar-benar pilihan yang identik dengan stimulus", () => {
  const { soal } = bacaJson(readFileSync("seed/soal-ketelitian.json", "utf8"), kategori);

  for (const s of soal) {
    // Kalimat pengantarnya boleh diubah; yang dibaca hanya stimulus di ujungnya.
    const stimulus = /\bdengan (.+)$/.exec(s.prompt)?.[1];
    const benar = s.options.filter((o) => o.isCorrect);

    expect(stimulus).toBeTruthy();
    expect(benar).toHaveLength(1);
    expect(benar[0].content).toBe(stimulus);
    // Hanya satu pilihan yang identik, jadi soalnya tidak bermakna ganda.
    expect(s.options.filter((o) => o.content === stimulus)).toHaveLength(1);
  }
});

test("kunci kesamaan cocok dengan perbandingan kedua deret", () => {
  const { soal } = bacaJson(readFileSync("seed/soal-kesamaan.json", "utf8"), kategori);

  for (const s of soal) {
    const [kiri, kanan] = s.prompt.split(" : ");
    const benar = s.options.find((o) => o.isCorrect)!.content;

    expect(benar).toBe(kiri === kanan ? "Sama" : "Tidak Sama");
  }
});

import { expect, test } from "vitest";

import { bacaJson } from "./question-import";

const kategori = new Map([["TIU", "kat-1"]]);

const satu = {
  kategori: "TIU",
  tingkat: "hard",
  pertanyaan: "Jika 3x + 6 = 21, berapakah nilai x?",
  pembahasan: "3x = 15, sehingga x = 5.",
  opsi: ["3", "4", "5", "6"],
  benar: "C",
};

test("membaca soal dan menandai kunci jawaban dari label huruf", () => {
  const { soal, galat } = bacaJson(JSON.stringify([satu]), kategori);

  expect(galat).toEqual([]);
  expect(soal).toHaveLength(1);
  expect(soal[0].categoryId).toBe("kat-1");
  expect(soal[0].difficulty).toBe("hard");
  expect(soal[0].options.map((o) => o.isCorrect)).toEqual([false, false, true, false]);
});

test("nomor urut juga diterima sebagai kunci jawaban", () => {
  const { soal } = bacaJson(JSON.stringify([{ ...satu, benar: 1 }]), kategori);

  expect(soal[0].options.map((o) => o.isCorrect)).toEqual([true, false, false, false]);
});

test("objek tunggal tanpa array ikut terbaca", () => {
  expect(bacaJson(JSON.stringify(satu), kategori).soal).toHaveLength(1);
});

test("tingkat yang tidak ditulis jatuh ke medium", () => {
  const { kategori: kode, pertanyaan, pembahasan, opsi, benar } = satu;
  const tanpaTingkat = { kategori: kode, pertanyaan, pembahasan, opsi, benar };

  expect(bacaJson(JSON.stringify([tanpaTingkat]), kategori).soal[0].difficulty).toBe("medium");
});

test("soal bermasalah dilaporkan per nomor tanpa menggugurkan sisanya", () => {
  const { soal, galat } = bacaJson(
    JSON.stringify([satu, { ...satu, kategori: "XYZ" }, { ...satu, benar: "Z" }]),
    kategori,
  );

  expect(soal).toHaveLength(1);
  expect(galat).toEqual([
    'Soal 2: kategori "XYZ" tidak ada di bank soal.',
    'Soal 3: kunci jawaban "Z" tidak menunjuk salah satu pilihan.',
  ]);
});

test("kunci di luar jumlah pilihan ditolak", () => {
  expect(bacaJson(JSON.stringify([{ ...satu, benar: 9 }]), kategori).galat).toHaveLength(1);
});

test("teks yang bukan JSON ditolak dengan pesan, bukan lemparan", () => {
  expect(bacaJson("bukan json", kategori)).toEqual({
    soal: [],
    galat: ["Teksnya bukan JSON yang sah."],
  });
});

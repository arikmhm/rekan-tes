import { expect, test } from "vitest";

import { formatDuration, formatPrice, labelSubtes } from "./format";

test("harga memakai pemisah ribuan Indonesia tanpa desimal", () => {
  // Spasi setelah `Rp` adalah non-breaking space milik locale id-ID.
  expect(formatPrice(50_000)).toBe("Rp 50.000");
  expect(formatPrice(1_234_567)).toBe("Rp 1.234.567");
  expect(formatPrice(0)).toBe("Rp 0");
});

test("durasi di bawah satu jam ditulis dalam menit", () => {
  expect(formatDuration(45 * 60)).toBe("45 menit");
  expect(formatDuration(60)).toBe("1 menit");
});

test("durasi satu jam lebih dipecah menjadi jam dan menit", () => {
  expect(formatDuration(60 * 60)).toBe("1 jam");
  expect(formatDuration(90 * 60)).toBe("1 jam 30 menit");
  expect(formatDuration(125 * 60)).toBe("2 jam 5 menit");
});

test("nama beberapa kata disingkat jadi inisial", () => {
  expect(labelSubtes(["Tes Wawasan Kebangsaan"])).toEqual(["TWK"]);
});

test("inisial yang bertabrakan memakai nama aslinya", () => {
  expect(labelSubtes(["Kesamaan Dasar", "Ketelitian Dasar"])).toEqual([
    "Kesamaan Dasar",
    "Ketelitian Da…",
  ]);
});

test("nama satu kata dipakai apa adanya selama masih pendek", () => {
  expect(labelSubtes(["Numerik", "Verbal"])).toEqual(["Numerik", "Verbal"]);
});

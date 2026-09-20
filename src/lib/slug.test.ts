import { expect, test } from "vitest";

import { slugBebas, slugify } from "./slug";

test("nama tes menjadi slug huruf kecil bertanda hubung", () => {
  expect(slugify("Simulasi Tes Masuk Bank")).toBe("simulasi-tes-masuk-bank");
  expect(slugify("  TPA & TIU 2026!  ")).toBe("tpa-tiu-2026");
});

test("slug tidak pernah diawali atau diakhiri tanda hubung", () => {
  expect(slugify("---")).toBe("");
  expect(slugify("a".repeat(63) + " bank")).toBe("a".repeat(63));
});

test("slug yang sudah dipakai diberi nomor urut", () => {
  expect(slugBebas("tes-bank", [])).toBe("tes-bank");
  expect(slugBebas("tes-bank", ["tes-bank"])).toBe("tes-bank-2");
  expect(slugBebas("tes-bank", ["tes-bank", "tes-bank-2", "tes-bank-4"])).toBe(
    "tes-bank-3",
  );
});

test("slug lain yang berawalan sama tidak ikut menggeser nomor", () => {
  expect(slugBebas("tes-bank", ["tes-bank", "tes-bank-syariah"])).toBe(
    "tes-bank-2",
  );
});

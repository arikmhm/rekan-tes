import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "vitest";

/**
 * `admin.ts` berisi Server Action yang dapat dipanggil langsung lewat HTTP,
 * bukan hanya dari halaman admin. Penolakan per-halaman saja tidak cukup, jadi
 * test ini memastikan setiap fungsi yang diekspor membuka dengan pemeriksaan
 * admin. Tanpa ini, satu action baru tanpa guard lolos tanpa terlihat.
 */
const source = readFileSync(join(process.cwd(), "src/lib/admin.ts"), "utf8");

const MUTATIONS = [
  "saveCategory",
  "saveQuestion",
  "duplicateQuestion",
  "saveSubtest",
  "saveTest",
  "addTestSubtest",
  "updateTestSubtest",
  "removeTestSubtest",
  "moveTestSubtest",
  "addAssignment",
  "removeAssignment",
];
const READS = [
  "listCategories",
  "listQuestions",
  "getQuestion",
  "listSubtests",
  "listTests",
  "getTest",
  "adminStats",
];

function badanFungsi(nama: string) {
  const mulai = source.indexOf(`export async function ${nama}`);
  expect(mulai, `fungsi ${nama} tidak ditemukan`).toBeGreaterThan(-1);
  return source.slice(mulai, mulai + 400);
}

test("seluruh fungsi yang diekspor sudah terdaftar di test ini", () => {
  const diekspor = [...source.matchAll(/export async function (\w+)/g)].map((m) => m[1]);
  expect(diekspor.toSorted()).toEqual([...MUTATIONS, ...READS].toSorted());
});

test.each(MUTATIONS)("mutasi %s menolak non-admin lewat requireAdminMutation", (nama) => {
  expect(badanFungsi(nama)).toContain("await requireAdminMutation();");
});

test.each(READS)("pembacaan %s dijaga requireAdmin", (nama) => {
  expect(badanFungsi(nama)).toContain("await requireAdmin();");
});

test("mutasi tidak memakai requireAdmin, karena notFound di action menghasilkan 500", () => {
  for (const nama of MUTATIONS) {
    expect(badanFungsi(nama)).not.toMatch(/await requireAdmin\(\);/);
  }
});

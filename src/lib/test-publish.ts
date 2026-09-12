/**
 * Syarat produk tes boleh terbit. Dipisahkan dari `admin.ts` karena file
 * `"use server"` hanya boleh mengekspor fungsi async, dan agar aturan ini dapat
 * diuji tanpa database. `admin.ts` menyiapkan datanya lewat satu query agregat
 * di dalam transaksi publish.
 */

export type SubtestSummary = {
  /** Nama subtes, dipakai pada pesan galat agar admin tahu mana yang kurang. */
  name: string;
  subtestStatus: string;
  questionLimit: number;
  /** Jumlah assignment soal. */
  assigned: number;
  /** Assignment yang soalnya masih published dan kategorinya cocok. */
  eligible: number;
};

/**
 * Mengembalikan masalah pertama yang menghalangi publikasi, atau null bila
 * lolos. Draft sengaja tidak diperiksa agar tes dapat disusun bertahap.
 */
export function testPublishProblem(rows: SubtestSummary[]): string | null {
  if (rows.length === 0) return "Tes terbit butuh minimal satu subtes.";

  for (const r of rows) {
    if (r.subtestStatus !== "published") {
      return `Subtes "${r.name}" belum berstatus published.`;
    }
    if (r.eligible < r.assigned) {
      return `Subtes "${r.name}" memuat soal yang sudah tidak terbit atau tidak sekategori.`;
    }
    if (r.assigned < r.questionLimit) {
      return `Subtes "${r.name}" baru memiliki ${r.assigned} dari ${r.questionLimit} soal.`;
    }
  }

  return null;
}

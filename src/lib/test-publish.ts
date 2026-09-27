export type SubtestSummary = {
  name: string;
  subtestStatus: string;
  questionLimit: number;
  assigned: number;
  /** Assignment yang soalnya masih published dan kategorinya cocok. */
  eligible: number;
};

/** Draft tidak diperiksa agar tes dapat disusun bertahap. */
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

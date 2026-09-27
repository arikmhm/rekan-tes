export const OPTION_SLOTS = 5;

export const OPTION_LABELS = ["A", "B", "C", "D", "E"];

export type QuestionOptionInput = {
  label: string;
  content: string;
  isCorrect: boolean;
  position: number;
};

/** Slot kosong dibuang dan posisi dirapatkan. */
export function readOptions(form: {
  get: (key: string) => FormDataEntryValue | null;
}): QuestionOptionInput[] {
  const benar = Number(form.get("benar") ?? 0);

  return Array.from({ length: OPTION_SLOTS }, (_, i) => ({
    slot: i + 1,
    content: String(form.get(`opsi${i + 1}`) ?? "").trim(),
  }))
    .filter((o) => o.content !== "")
    .map((o, index) => ({
      label: OPTION_LABELS[index],
      content: o.content,
      isCorrect: o.slot === benar,
      position: index + 1,
    }));
}

/** Hanya untuk soal yang terbit; draft boleh setengah jadi. */
export function publishProblem(options: QuestionOptionInput[]): string | null {
  if (options.length < 2) return "Soal terbit butuh minimal dua pilihan jawaban.";

  const benar = options.filter((o) => o.isCorrect).length;
  if (benar !== 1) return "Pilih tepat satu jawaban benar sebelum menerbitkan soal.";

  return null;
}

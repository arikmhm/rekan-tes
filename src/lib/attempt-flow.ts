/** Aturan murni attempt, terpisah dari `attempt.ts` agar teruji tanpa database. */

export type SubtestProgress = {
  position: number;
  status: string;
  startedAt: Date | null;
  durationSeconds: number;
};

export function isDone(status: string) {
  return status === "submitted" || status === "submitted_by_timeout";
}

/** Hak akses bersumber dari order: masa akses habis mencabutnya walau attempt berjalan. */
export function attemptAccessProblem(
  order: { status: string; accessExpiresAt: Date | null },
  now: Date,
): string | null {
  if (order.status !== "paid") {
    return "Pesanan ini belum lunas, jadi sesinya belum dapat dikerjakan.";
  }
  if (!order.accessExpiresAt || order.accessExpiresAt <= now) {
    return "Masa akses sesi ini sudah berakhir.";
  }
  return null;
}

/** Satu-satunya subtes yang boleh dibuka: yang pertama belum disubmit. */
export function activeSubtest<T extends SubtestProgress>(rows: T[]): T | null {
  return sorted(rows).find((r) => !isDone(r.status)) ?? null;
}

export function nextSubtest<T extends SubtestProgress>(rows: T[], position: number): T | null {
  return sorted(rows).find((r) => r.position > position) ?? null;
}

/** Dihitung, bukan disimpan, agar tidak ada dua sumber kebenaran. */
export function subtestDeadline(row: SubtestProgress): Date | null {
  return row.startedAt ? new Date(row.startedAt.getTime() + row.durationSeconds * 1000) : null;
}

function sorted<T extends SubtestProgress>(rows: T[]) {
  return [...rows].sort((a, b) => a.position - b.position);
}

export type TimeoutStep<T> = {
  close: T;
  /** Deadline itu sendiri, bukan saat halaman dibuka. */
  at: Date;
  start: T | null;
};

/**
 * Penerus dimulai pada deadline pendahulunya, bukan `now`, agar menutup
 * peramban tidak menambah waktu. Satu kunjungan bisa menutup beberapa subtes.
 */
export function timeoutPlan<T extends SubtestProgress>(rows: T[], now: Date): TimeoutStep<T>[] {
  const list = sorted(rows);
  const steps: TimeoutStep<T>[] = [];

  let aktif = list.find((r) => !isDone(r.status)) ?? null;
  let mulai = aktif?.startedAt ?? null;

  while (aktif && mulai) {
    const deadline = new Date(mulai.getTime() + aktif.durationSeconds * 1000);
    if (deadline > now) break;

    const berikutnya = list.find((r) => r.position > aktif!.position) ?? null;
    steps.push({ close: aktif, at: deadline, start: berikutnya });

    aktif = berikutnya;
    mulai = deadline;
  }

  return steps;
}

export type HasilSoal = {
  weight: number;
  /** Ada opsi terpilih; baris tanpa opsi hanya mencatat waktu. */
  dijawab: boolean;
  isCorrect: boolean | null;
};

/** `isCorrect` null pada soal yang dijawab dihitung salah, bukan benar. */
export function ringkasSubtes(soal: HasilSoal[]) {
  const benar = soal.filter((s) => s.dijawab && s.isCorrect === true);
  const salah = soal.filter((s) => s.dijawab && s.isCorrect !== true);

  return {
    benar: benar.length,
    salah: salah.length,
    kosong: soal.filter((s) => !s.dijawab).length,
    skor: benar.reduce((n, s) => n + s.weight, 0),
    maksimal: soal.reduce((n, s) => n + s.weight, 0),
  };
}

/**
 * Cadangan `localStorage` yang layak masuk antrean simpan: milik subtes ini,
 * opsinya sah, dan berbeda dari yang tercatat server. Sisa sesi lama atau isi
 * yang diutak-atik tersaring di sini; server tetap memvalidasi ulang.
 */
export function jawabanPulih(
  tersimpan: Record<string, string>,
  soal: {
    assignmentId: string;
    selectedOptionId: string | null;
    options: { id: string }[];
  }[],
): [string, string][] {
  return Object.entries(tersimpan).filter(([assignmentId, optionId]) =>
    soal.some(
      (s) =>
        s.assignmentId === assignmentId &&
        s.selectedOptionId !== optionId &&
        s.options.some((o) => o.id === optionId),
    ),
  );
}

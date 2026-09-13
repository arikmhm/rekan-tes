/**
 * Aturan urutan pengerjaan attempt. Dipisahkan dari query database dengan
 * alasan yang sama seperti `test-publish.ts`: file `"use server"` hanya boleh
 * mengekspor fungsi async, dan aturan ini harus dapat diuji tanpa database.
 */

export type SubtestProgress = {
  position: number;
  status: string;
  startedAt: Date | null;
  durationSeconds: number;
};

/** Status akhir subtes; keduanya sama-sama berarti tidak dapat dibuka lagi. */
export function isDone(status: string) {
  return status === "submitted" || status === "submitted_by_timeout";
}

/**
 * Alasan sebuah attempt belum boleh dikerjakan, atau null bila boleh. Order
 * adalah sumber hak akses, bukan attempt: attempt hanya ada karena order lunas,
 * dan masa akses order yang habis mencabut haknya walau attempt masih berjalan.
 */
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

/**
 * Subtes yang boleh dibuka peserta: subtes pertama menurut `position` yang
 * belum disubmit. Peserta tidak pernah diberi pilihan subtes lain, sehingga
 * subtes yang sudah disubmit tidak dapat dibuka kembali dan subtes berikutnya
 * tidak dapat dilompati — urutan dijaga oleh struktur, bukan oleh pemeriksaan
 * tambahan di setiap route.
 */
export function activeSubtest<T extends SubtestProgress>(rows: T[]): T | null {
  return sorted(rows).find((r) => !isDone(r.status)) ?? null;
}

/** Subtes setelah `position`, yaitu yang berhak jalan begitu satu disubmit. */
export function nextSubtest<T extends SubtestProgress>(rows: T[], position: number): T | null {
  return sorted(rows).find((r) => r.position > position) ?? null;
}

/**
 * Batas waktu satu subtes berjalan, dihitung dari `started_at` milik server
 * dan durasi konfigurasi tes. Tidak disimpan sebagai kolom sendiri agar tidak
 * ada dua sumber kebenaran yang bisa berbeda.
 */
export function subtestDeadline(row: SubtestProgress): Date | null {
  return row.startedAt ? new Date(row.startedAt.getTime() + row.durationSeconds * 1000) : null;
}

/** Query sudah mengurutkan, tetapi urutan adalah aturannya — jangan diasumsikan. */
function sorted<T extends SubtestProgress>(rows: T[]) {
  return [...rows].sort((a, b) => a.position - b.position);
}

export type TimeoutStep<T> = {
  /** Subtes yang deadline-nya sudah lewat dan harus ditutup. */
  close: T;
  /** Waktu penutupan: deadline itu sendiri, bukan saat halaman dibuka. */
  at: Date;
  /** Subtes berikutnya yang jamnya mulai berjalan sejak `at`, bila ada. */
  start: T | null;
};

/**
 * Subtes yang seharusnya sudah tertutup karena waktunya habis, beserta
 * penerusnya. Dihitung, bukan dijadwalkan: tidak ada cron atau job yang bisa
 * mati diam-diam, dan hasilnya sama saja apakah peserta menutup peramban satu
 * menit atau satu minggu.
 *
 * Subtes penerus dimulai pada deadline pendahulunya, bukan pada `now`, supaya
 * menutup peramban tidak menghadiahi waktu tambahan. Karena itu satu kunjungan
 * dapat menutup beberapa subtes sekaligus — makanya berbentuk daftar langkah.
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
  /** Bobot assignment; hanya diperoleh bila jawabannya benar. */
  weight: number;
  /** Ada baris jawaban untuk soal ini. Soal yang dilewati tidak punya baris. */
  dijawab: boolean;
  /** Kebenaran yang dibekukan saat subtes ditutup, bukan dihitung ulang. */
  isCorrect: boolean | null;
};

/**
 * Ringkasan satu subtes. Jawaban salah dan kosong sama-sama bernilai nol; MVP
 * tidak memakai penalti, jadi skor tidak pernah turun karena menebak.
 *
 * `isCorrect` yang masih null pada soal yang dijawab dihitung sebagai salah,
 * bukan benar: kalau penilaian pernah gagal, kesalahannya tidak boleh
 * menguntungkan skor.
 */
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

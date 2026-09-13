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

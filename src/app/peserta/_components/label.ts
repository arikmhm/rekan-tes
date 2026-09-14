/** Label dan penanggalan yang dipakai bersama halaman pesanan dan pustaka. */

export const tanggal = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
});

export const tanggalSingkat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
});

export const LABEL_ORDER: Record<string, string> = {
  pending: "Menunggu pembayaran",
  paid: "Lunas",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
  refunded: "Dikembalikan",
};

export const LABEL_ATTEMPT: Record<string, string> = {
  not_started: "Belum dikerjakan",
  in_progress: "Sedang dikerjakan",
  submitted: "Selesai",
  submitted_by_timeout: "Selesai (waktu habis)",
  expired: "Kedaluwarsa",
};

/** Sesi yang sudah dikumpulkan dibuka ke halaman hasil, sisanya ke ruang kerja. */
export function selesai(status: string | null) {
  return status === "submitted" || status === "submitted_by_timeout";
}

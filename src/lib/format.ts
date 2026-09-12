/**
 * Format angka untuk pembaca Indonesia. Dipakai katalog, detail tes, dan admin
 * agar harga serta durasi tampil sama di seluruh aplikasi.
 */

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Harga dalam rupiah penuh, tanpa desimal. Contoh: `Rp 50.000`. */
export function formatPrice(amount: number) {
  return idr.format(amount);
}

/** Durasi manusiawi dari detik. Contoh: `45 menit`, `1 jam`, `1 jam 30 menit`. */
export function formatDuration(seconds: number) {
  const menit = Math.round(seconds / 60);
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;

  if (jam === 0) return `${menit} menit`;
  return sisa === 0 ? `${jam} jam` : `${jam} jam ${sisa} menit`;
}

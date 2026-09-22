/**
 * Format angka untuk pembaca Indonesia. Dipakai halaman produk, detail tes, dan admin
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

/**
 * Label pendek dan unik untuk sumbu radar hasil. Nama subtes panjang membuat
 * sumbunya bertumpuk, jadi nama beberapa kata disingkat jadi inisialnya —
 * "Tes Wawasan Kebangsaan" menjadi "TWK".
 *
 * Disiapkan sekaligus untuk satu daftar, bukan per nama, karena inisial mudah
 * bertabrakan: "Kesamaan Dasar" dan "Ketelitian Dasar" sama-sama "KD", dan dua
 * sumbu berlabel sama terbaca sebagai satu subtes yang sama. Yang bertabrakan
 * memakai namanya sendiri, dipotong seperlunya.
 *
 * ponytail: masih tebakan dari bentuk nama. Kalau subtes perlu label pendek
 * yang benar-benar terkendali, tambahkan kolomnya di tabel subtes.
 */
export function labelSubtes(nama: string[]) {
  const singkat = nama.map(inisial);

  return nama.map((n, i) =>
    singkat.some((s, j) => j !== i && s === singkat[i]) ? potong(n) : singkat[i],
  );
}

function inisial(nama: string) {
  const kata = nama.split(/\s+/).filter(Boolean);
  if (kata.length < 2) return potong(nama);

  return kata
    .map((k) => k[0])
    .join("")
    .toUpperCase()
    .slice(0, 5);
}

function potong(nama: string) {
  return nama.length <= 14 ? nama : `${nama.slice(0, 13)}…`;
}

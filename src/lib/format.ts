const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** `Rp 50.000` */
export function formatPrice(amount: number) {
  return idr.format(amount);
}

/** `45 menit`, `1 jam`, `1 jam 30 menit` */
export function formatDuration(seconds: number) {
  const menit = Math.round(seconds / 60);
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;

  if (jam === 0) return `${menit} menit`;
  return sisa === 0 ? `${jam} jam` : `${jam} jam ${sisa} menit`;
}

/**
 * Label pendek unik untuk tampilan hasil: "Tes Wawasan Kebangsaan" → "TWK".
 * Dihitung per daftar karena inisial mudah bertabrakan ("Kesamaan Dasar" dan
 * "Ketelitian Dasar" sama-sama "KD"); yang bertabrakan memakai namanya sendiri.
 *
 * ponytail: tebakan dari bentuk nama. Tambah kolom label di tabel subtes bila
 * perlu dikendalikan.
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

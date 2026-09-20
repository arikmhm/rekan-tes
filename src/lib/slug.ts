/**
 * Slug produk tes: dipakai sebagai alamat halaman `/produk/<slug>` sekaligus
 * kunci yang dikirim tombol beli, jadi bentuknya dibatasi huruf kecil, angka,
 * dan tanda hubung, maksimal 64 karakter.
 */
export function slugify(teks: string) {
  return teks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 64)
    .replace(/^-+|-+$/g, "");
}

/**
 * Slug pertama yang belum dipakai: `dasar`, lalu `dasar-2`, `dasar-3`, dan
 * seterusnya. Dipakai saat dua produk punya nama yang sama.
 */
export function slugBebas(dasar: string, dipakai: Iterable<string>) {
  const terpakai = new Set(dipakai);
  if (!terpakai.has(dasar)) return dasar;

  for (let n = 2; ; n++) {
    const calon = `${dasar}-${n}`;
    if (!terpakai.has(calon)) return calon;
  }
}

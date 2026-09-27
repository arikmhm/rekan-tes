export function slugify(teks: string) {
  return teks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 64)
    .replace(/^-+|-+$/g, "");
}

/** `dasar`, `dasar-2`, `dasar-3`, … */
export function slugBebas(dasar: string, dipakai: Iterable<string>) {
  const terpakai = new Set(dipakai);
  if (!terpakai.has(dasar)) return dasar;

  for (let n = 2; ; n++) {
    const calon = `${dasar}-${n}`;
    if (!terpakai.has(calon)) return calon;
  }
}

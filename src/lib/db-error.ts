/** 23505 = unique_violation pada PostgreSQL. */
const UNIQUE_VIOLATION = "23505";

/**
 * Drizzle membungkus galat driver, sehingga kode PostgreSQL berada di
 * `cause`, bukan pada error terluar, dan `message` terluar hanya berisi query.
 * Karena itu pemeriksaan menelusuri rantai `cause`, bukan mencocokkan teks.
 */
export function isUniqueViolation(error: unknown): boolean {
  for (let current = error; current; current = (current as { cause?: unknown }).cause) {
    if ((current as { code?: unknown }).code === UNIQUE_VIOLATION) return true;
  }
  return false;
}

/** unique_violation */
const UNIQUE_VIOLATION = "23505";

/** Drizzle membungkus galat driver: kode PostgreSQL ada di rantai `cause`. */
export function isUniqueViolation(error: unknown): boolean {
  for (let current = error; current; current = (current as { cause?: unknown }).cause) {
    if ((current as { code?: unknown }).code === UNIQUE_VIOLATION) return true;
  }
  return false;
}

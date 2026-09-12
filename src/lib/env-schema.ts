import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "wajib diisi")
    .startsWith("postgres", "harus berupa connection string PostgreSQL"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Memvalidasi environment server dan gagal dengan pesan yang dapat
 * ditindaklanjuti. Dipisahkan dari `env.ts` agar dapat diuji tanpa melewati
 * guard `server-only`.
 */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Environment server tidak valid:\n${details}\n\n` +
        "Salin .env.example menjadi .env.local lalu lengkapi nilainya.",
    );
  }

  return result.data;
}

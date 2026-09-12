import { z } from "zod";

const postgresUrl = (label: string) =>
  z.string().min(1, "wajib diisi").startsWith("postgres", `harus berupa ${label}`);

const envSchema = z.object({
  /** Endpoint pooled (PgBouncer). Dipakai runtime aplikasi. */
  DATABASE_URL: postgresUrl("connection string PostgreSQL"),
  /**
   * Endpoint direct tanpa pooling. Hanya dibutuhkan untuk migrasi Drizzle Kit;
   * endpoint pooled dapat menggagalkan DDL. Opsional agar runtime produksi
   * tidak perlu menyetel variabel yang tidak dipakainya.
   */
  DATABASE_URL_UNPOOLED: postgresUrl("connection string PostgreSQL").optional(),
  /** Secret penanda tangan session Better Auth. Minimal 32 karakter. */
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "minimal 32 karakter; buat dengan `openssl rand -base64 32`"),
  /**
   * Base URL aplikasi. Wajib: tautan verifikasi email dan reset password
   * dibangun dari nilai ini, dan nilai yang salah membuat tautan tidak bisa
   * dipakai. Tanpa ini Better Auth menebaknya dari request.
   */
  BETTER_AUTH_URL: z.string().url("harus berupa URL absolut, misalnya http://localhost:3000"),
  /** API key Resend untuk email verifikasi dan reset password. */
  RESEND_API_KEY: z.string().startsWith("re_", "harus berupa API key Resend"),
  /**
   * Alamat pengirim. Default memakai domain uji Resend; ganti ke domain sendiri
   * yang sudah terverifikasi sebelum rilis.
   */
  EMAIL_FROM: z.string().default("Rekan Tes <onboarding@resend.dev>"),
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

/**
 * Environment untuk migrasi. Menolak endpoint pooled karena PgBouncer dalam
 * mode transaction dapat menggagalkan DDL.
 */
export function parseMigrationEnv(source: Record<string, string | undefined>): {
  url: string;
} {
  const env = parseEnv(source);

  if (!env.DATABASE_URL_UNPOOLED) {
    throw new Error(
      "DATABASE_URL_UNPOOLED wajib untuk migrasi karena endpoint pooled dapat " +
        "menggagalkan DDL.\nJalankan `pnpx neon@latest env pull` untuk mengisinya.",
    );
  }

  return { url: env.DATABASE_URL_UNPOOLED };
}

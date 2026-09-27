import { z } from "zod";

const postgresUrl = (label: string) =>
  z.string().min(1, "wajib diisi").startsWith("postgres", `harus berupa ${label}`);

const envSchema = z.object({
  DATABASE_URL: postgresUrl("connection string PostgreSQL"),
  /** Hanya untuk migrasi, jadi runtime produksi tidak perlu menyetelnya. */
  DATABASE_URL_UNPOOLED: postgresUrl("connection string PostgreSQL").optional(),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "minimal 32 karakter; buat dengan `openssl rand -base64 32`"),
  /** Wajib: tanpa ini Better Auth menebak dari request dan tautan email bisa rusak. */
  BETTER_AUTH_URL: z.string().url("harus berupa URL absolut, misalnya http://localhost:3000"),
  RESEND_API_KEY: z.string().startsWith("re_", "harus berupa API key Resend"),
  EMAIL_FROM: z.string().default("Rekan Tes <onboarding@resend.dev>"),
  /** Opsional di sini; `parseDokuEnv` menuntutnya saat checkout. */
  DOKU_CLIENT_ID: z.string().optional(),
  DOKU_SECRET_KEY: z.string().optional(),
  DOKU_PRIVATE_KEY: z.string().optional(),
  DOKU_MERCHANT_ID: z.string().optional(),
  DOKU_TERMINAL_ID: z.string().optional(),
  DOKU_POSTAL_CODE: z.string().optional(),
  DOKU_BASE_URL: z.string().url("harus berupa URL absolut").optional(),
});

export type Env = z.infer<typeof envSchema>;

/** Terpisah dari `env.ts` agar teruji tanpa guard `server-only`. */
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

/** Menolak endpoint pooled: PgBouncer mode transaction dapat menggagalkan DDL. */
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

export const DOKU_SANDBOX_URL = "https://api-sandbox.doku.com";

const DOKU_KEYS = [
  "DOKU_CLIENT_ID",
  "DOKU_SECRET_KEY",
  "DOKU_PRIVATE_KEY",
  "DOKU_MERCHANT_ID",
  "DOKU_TERMINAL_ID",
  "DOKU_POSTAL_CODE",
] as const;

export function parseDokuEnv(source: Record<string, string | undefined>): {
  clientId: string;
  secretKey: string;
  privateKey: string;
  merchantId: string;
  terminalId: string;
  postalCode: string;
  baseUrl: string;
} {
  const env = parseEnv(source);
  const kurang = DOKU_KEYS.filter((key) => !env[key]);

  if (kurang.length > 0) {
    throw new Error(
      `Variabel DOKU berikut wajib untuk membuat QRIS: ${kurang.join(", ")}.\n` +
        "Ambil kredensialnya dari DOKU Back Office lalu isi di .env.local.",
    );
  }

  return {
    clientId: env.DOKU_CLIENT_ID!,
    secretKey: env.DOKU_SECRET_KEY!,
    // Private key pada file .env ditulis satu baris; pulihkan baris barunya.
    privateKey: env.DOKU_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    merchantId: env.DOKU_MERCHANT_ID!,
    terminalId: env.DOKU_TERMINAL_ID!,
    postalCode: env.DOKU_POSTAL_CODE!,
    baseUrl: env.DOKU_BASE_URL ?? DOKU_SANDBOX_URL,
  };
}

import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";

import { db, schema } from "@/db";

import { sendEmail } from "./email";
import { env } from "./env";

/** Menyuntikkan kredensial Resend sekali, agar dua pemanggil di bawah ringkas. */
const kirim = (to: string, subject: string, text: string) =>
  sendEmail({ apiKey: env.RESEND_API_KEY, from: env.EMAIL_FROM, to, subject, text });

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    // Login tidak diblokir oleh email belum terverifikasi; pembatasan berlaku
    // pada checkout (RT-009), sesuai PRD.
    requireEmailVerification: false,
    // Password baru mematikan seluruh session lama.
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await kirim(
        user.email,
        "Reset password Rekan Tes",
        `Halo ${user.name},\n\n` +
          `Buka tautan berikut untuk menyetel password baru:\n${url}\n\n` +
          "Tautan berlaku satu jam dan hanya dapat dipakai sekali. " +
          "Jika Anda tidak meminta reset password, abaikan email ini.\n",
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await kirim(
        user.email,
        "Verifikasi email Rekan Tes",
        `Halo ${user.name},\n\n` +
          `Buka tautan berikut untuk memverifikasi email Anda:\n${url}\n\n` +
          "Email terverifikasi dibutuhkan sebelum membeli sesi simulasi.\n",
      );
    },
  },
  user: {
    additionalFields: {
      /**
       * Server-owned. `input: false` membuat Better Auth menolak nilai role
       * yang dikirim klien saat registrasi maupun update profil.
       */
      role: {
        type: "string",
        required: false,
        defaultValue: "participant",
        input: false,
      },
    },
  },
  advanced: {
    database: {
      // Menjaga invariant DATABASE_DESIGN: primary key text berisi UUID v4.
      generateId: () => crypto.randomUUID(),
    },
  },
  /**
   * `nextCookies` wajib paling akhir: itulah yang membuat cookie session ikut
   * tertulis saat Better Auth dipanggil dari Server Action, bukan hanya dari
   * route handler. Tanpa itu, keluar lewat action tidak menghapus cookie.
   */
  plugins: [username(), nextCookies()],
});

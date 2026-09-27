import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";

import { db, schema } from "@/db";

import { sendEmail } from "./email";
import { env } from "./env";

const kirim = (to: string, subject: string, text: string) =>
  sendEmail({ apiKey: env.RESEND_API_KEY, from: env.EMAIL_FROM, to, subject, text });

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    // Verifikasi hanya ditagih di checkout (`requireVerifiedUser`).
    requireEmailVerification: false,
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
      /** Server-owned: `input: false` menolak role dari klien. */
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
      generateId: () => crypto.randomUUID(),
    },
  },
  /** `nextCookies` wajib terakhir agar cookie tertulis dari Server Action. */
  plugins: [username(), nextCookies()],
});

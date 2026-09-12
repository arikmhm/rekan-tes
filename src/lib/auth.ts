import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";

import { db, schema } from "@/db";

import { env } from "./env";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  // Pengiriman email dikerjakan pada RT-004. Sampai itu tersedia, email belum
  // terverifikasi tidak boleh dipakai untuk checkout (dijaga di RT-009).
  emailVerification: { sendOnSignUp: false },
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
  plugins: [username()],
});

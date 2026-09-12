"use client";

import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    /**
     * Field dideklarasikan di sini, bukan lewat `typeof auth`, agar file klien
     * tidak menyentuh modul server yang dijaga `server-only`. `input: false`
     * harus sama dengan konfigurasi server supaya `role` tidak pernah menjadi
     * input registrasi.
     */
    inferAdditionalFields({
      user: { role: { type: "string", required: false, input: false } },
    }),
    usernameClient(),
  ],
});

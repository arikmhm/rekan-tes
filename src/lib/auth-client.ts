"use client";

import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    /**
     * Bukan `typeof auth`, agar klien tidak menyentuh modul `server-only`.
     * `input: false` harus sama dengan konfigurasi server.
     */
    inferAdditionalFields({
      user: { role: { type: "string", required: false, input: false } },
    }),
    usernameClient(),
  ],
});

/**
 * Untuk header publik yang membaca session dari store `useSession`, jadi
 * `signOut()` klien wajib agar store kosong. Sidebar memakai Server Action di
 * `auth-actions.ts` yang tetap jalan tanpa JavaScript.
 */
export async function keluar() {
  await authClient.signOut();
  window.location.replace("/");
}

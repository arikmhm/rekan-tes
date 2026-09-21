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

/**
 * Keluar dari peramban, dipakai header situs publik. Header itu membaca session
 * dari store `useSession` di peramban — bukan dari server — jadi `signOut()`
 * klien harus ikut dipanggil agar store-nya ikut kosong. Sesudahnya halaman
 * depan dimuat ulang penuh supaya tidak ada sisa cache milik sesi lama.
 *
 * Sidebar peserta dan admin tidak memakai ini: keduanya keluar lewat Server
 * Action di `auth-actions.ts`, yang tetap bekerja walau JavaScript gagal.
 */
export async function keluar() {
  await authClient.signOut();
  window.location.replace("/");
}

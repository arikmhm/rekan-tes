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
 * Keluar lalu pulang ke halaman depan lewat navigasi penuh, bukan
 * `router.push`.
 *
 * Sesudah session berubah, cache router peramban masih memegang hasil render
 * milik sesi lama. Tautan "Lihat situs" di sidebar sempat mem-prefetch "/"
 * selagi masih login, dan saat itu "/" menjawab dengan pengalihan ke ruang
 * peserta — entri itulah yang dipakai ulang sesudah logout, sehingga peserta
 * terlempar kembali ke dasbornya dan logout tampak tidak terjadi.
 *
 * Navigasi penuh membuang seluruh cache itu: halaman depan diminta ulang ke
 * server tanpa cookie session.
 */
export async function keluar() {
  await authClient.signOut();

  // `replace`, bukan `href`: tombol mundur tidak boleh membawa peserta kembali
  // ke dasbor versi cache yang sudah bukan miliknya lagi.
  window.location.replace("/");
}

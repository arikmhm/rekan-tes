"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "./auth";

/**
 * Keluar dari akun lewat server, bukan dari peramban.
 *
 * Versi sebelumnya memanggil `authClient.signOut()` di dalam `onClick`, jadi
 * logout menuntut JavaScript sudah terpasang dan penanganan kliknya benar-benar
 * berjalan. Di production hal itu tidak terbukti jalan, dan kegagalannya diam:
 * menu tertutup, tidak ada permintaan terkirim, session tetap hidup.
 *
 * Sebagai Server Action, penghapusan session dikerjakan oleh pengiriman
 * formulir — jalur yang tetap bekerja walau hidrasi gagal — lalu `redirect`
 * membangun ulang halaman depan dengan cookie yang sudah bersih.
 */
export async function keluar() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

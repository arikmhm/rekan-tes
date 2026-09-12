import "server-only";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "./auth";

export const ROLE_ADMIN = "admin";
export const ROLE_PARTICIPANT = "participant";

/**
 * Penolakan memakai `redirect` dan `notFound`, bukan `forbidden`/`unauthorized`
 * dari Next.js, karena keduanya masih memerlukan flag eksperimental
 * `authInterrupts`. Batas otorisasi tidak diletakkan di atas API eksperimental.
 * `notFound` juga tidak membocorkan keberadaan route admin kepada non-admin.
 */

/** Session milik request saat ini, atau null bila belum login. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** User yang sedang login, atau diarahkan ke halaman masuk. */
export async function requireUser() {
  const session = await getSession();

  if (!session) {
    redirect("/masuk");
  }

  return session.user;
}

/**
 * User admin, atau ditolak di server. Bukan sekadar menyembunyikan UI:
 * non-admin ditolak sebelum data apa pun dibaca.
 */
export async function requireAdmin() {
  const session = await getSession();

  if (!session || session.user.role !== ROLE_ADMIN) {
    notFound();
  }

  return session.user;
}

/**
 * User yang sudah memverifikasi email. Dipakai pada jalur pembelian (RT-009):
 * PRD mewajibkan verifikasi sebelum membeli, bukan sebelum login.
 */
export async function requireVerifiedUser() {
  const user = await requireUser();

  if (!user.emailVerified) {
    redirect("/verifikasi-dibutuhkan");
  }

  return user;
}

/**
 * Memastikan resource memang milik peminta. Admin dikecualikan agar dapat
 * menangani kendala operasional pada RT-015.
 */
export async function assertOwner(ownerId: string) {
  const session = await getSession();

  if (!session) {
    redirect("/masuk");
  }

  if (session.user.id !== ownerId && session.user.role !== ROLE_ADMIN) {
    notFound();
  }

  return session.user;
}

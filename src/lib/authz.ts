import "server-only";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "./auth";

export const ROLE_ADMIN = "admin";
export const ROLE_PARTICIPANT = "participant";

/**
 * `redirect`/`notFound`, bukan `forbidden`/`unauthorized` yang masih butuh flag
 * eksperimental `authInterrupts`. `notFound` juga menyembunyikan route admin.
 */

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();

  if (!session) {
    redirect("/masuk");
  }

  return session.user;
}

async function adminOrNull() {
  const session = await getSession();
  return session?.user.role === ROLE_ADMIN ? session.user : null;
}

export async function requireAdmin() {
  const user = await adminOrNull();

  if (!user) {
    notFound();
  }

  return user;
}

/** Untuk Server Action: `notFound()` di dalam action menghasilkan 500. */
export async function requireAdminMutation() {
  const user = await adminOrNull();

  if (!user) {
    throw new Error("Akses admin dibutuhkan.");
  }

  return user;
}

/** Jalur pembelian. Yang belum terverifikasi diarahkan ke profil, tempat tombol kirim ulang. */
export async function requireVerifiedUser() {
  const user = await requireUser();

  if (!user.emailVerified) {
    redirect("/peserta/profil");
  }

  return user;
}

/** Admin dikecualikan untuk menangani kendala operasional. */
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

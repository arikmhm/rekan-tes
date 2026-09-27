"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "./auth";

/**
 * Server Action, bukan `authClient.signOut()` di `onClick`: versi klien gagal
 * diam-diam di production saat hidrasi belum jalan.
 */
export async function keluar() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

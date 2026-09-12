import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/authz";

import { AuthShell } from "../_components/auth-shell";
import { ResendVerification } from "../_components/resend-verification";

export const metadata: Metadata = { title: "Verifikasi email" };

export default async function VerifikasiDibutuhkanPage() {
  const user = await requireUser();

  if (user.emailVerified) {
    redirect("/");
  }

  return (
    <AuthShell
      title="Verifikasi email dulu"
      description={`Kami sudah mengirim tautan verifikasi ke ${user.email}. Email terverifikasi dibutuhkan sebelum membeli sesi simulasi.`}
      footer="Tautan verifikasi berlaku terbatas. Jika kedaluwarsa, kirim ulang dari tombol di atas."
    >
      <ResendVerification email={user.email} />
    </AuthShell>
  );
}

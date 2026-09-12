import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/authz";

import { AuthForm } from "../_components/auth-form";
import { AuthShell } from "../_components/auth-shell";

export const metadata: Metadata = { title: "Daftar" };

export default async function DaftarPage() {
  if (await getSession()) {
    redirect("/");
  }

  return (
    <AuthShell
      title="Buat akun Rekan Tes"
      description="Butuh username, email, dan password. Email dipakai untuk verifikasi dan bukti transaksi."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link className="font-semibold text-brand hover:text-brand-dark" href="/masuk">
            Masuk
          </Link>
        </>
      }
    >
      <AuthForm mode="daftar" />
    </AuthShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/authz";

import { AuthForm } from "../_components/auth-form";
import { AuthShell } from "../_components/auth-shell";

export const metadata: Metadata = { title: "Masuk" };

export default async function MasukPage() {
  if (await getSession()) {
    redirect("/");
  }

  return (
    <AuthShell
      title="Masuk"
      description="Gunakan username dan password akun Rekan Tes Anda."
      footer={
        <>
          Belum punya akun?{" "}
          <Link className="font-medium text-brand transition-colors duration-300 ease-out hover:text-brand-orange" href="/daftar">
            Daftar
          </Link>
          {" · "}
          <Link className="font-medium text-brand transition-colors duration-300 ease-out hover:text-brand-orange" href="/lupa-password">
            Lupa password
          </Link>
        </>
      }
    >
      <AuthForm mode="masuk" />
    </AuthShell>
  );
}

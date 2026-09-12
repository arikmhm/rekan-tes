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
          <Link className="font-semibold text-brand hover:text-brand-dark" href="/daftar">
            Daftar
          </Link>
        </>
      }
    >
      <AuthForm mode="masuk" />
    </AuthShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "../_components/auth-shell";
import { PasswordForm } from "../_components/password-form";

export const metadata: Metadata = { title: "Lupa password" };

export default function LupaPasswordPage() {
  return (
    <AuthShell
      title="Lupa password"
      description="Masukkan email akun Anda. Jika terdaftar, kami kirimkan tautan untuk menyetel password baru."
      footer={
        <>
          Ingat password Anda?{" "}
          <Link className="font-medium text-brand transition-colors duration-300 ease-out hover:text-brand-orange" href="/masuk">
            Masuk
          </Link>
        </>
      }
    >
      <PasswordForm />
    </AuthShell>
  );
}

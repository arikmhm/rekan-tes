import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "../_components/auth-shell";
import { PasswordForm } from "../_components/password-form";

export const metadata: Metadata = { title: "Setel password baru" };

/**
 * Better Auth mengarahkan ke sini dengan `?token=` bila tautan valid, atau
 * `?error=INVALID_TOKEN` bila tidak valid maupun kedaluwarsa.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  return (
    <AuthShell
      title="Setel password baru"
      description="Pilih password minimal 8 karakter. Seluruh sesi lama akan dikeluarkan setelah password diganti."
      footer={
        <>
          Butuh tautan baru?{" "}
          <Link className="font-medium text-brand transition-colors duration-300 ease-out hover:text-brand-orange" href="/lupa-password">
            Minta ulang
          </Link>
        </>
      }
    >
      <PasswordForm token={token} error={error ?? (token ? undefined : "INVALID_TOKEN")} />
    </AuthShell>
  );
}

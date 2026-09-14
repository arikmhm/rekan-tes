"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

const linkClass = "transition hover:text-brand-orange";
const buttonClass =
  "rounded-lg border border-[#105C78]/20 bg-white px-4 py-2 font-normal text-brand transition-colors hover:bg-brand hover:text-white";

/**
 * Dipakai dari halaman statis, sehingga session dibaca di browser agar landing
 * page tetap ter-prerender.
 */
export function AccountNav() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  // Menjaga tinggi baris tetap sama sebelum session diketahui.
  if (isPending) {
    return <span className="h-9" aria-hidden />;
  }

  if (!session) {
    return (
      <>
        <Link className={linkClass} href="/masuk">
          Masuk
        </Link>
        <Link className={buttonClass} href="/daftar">
          Daftar
        </Link>
      </>
    );
  }

  return (
    <>
      <Link className={linkClass} href="/akun">
        Akun
      </Link>
      {session.user.role === "admin" && (
        <Link className={linkClass} href="/admin">
          Admin
        </Link>
      )}
      {/* Identitas sudah diwakili tautan "Akun" di layar sempit. */}
      <span className="hidden font-medium text-brand sm:inline">
        {session.user.username ?? session.user.name}
      </span>
      <button
        type="button"
        disabled={signingOut}
        className={`${buttonClass} disabled:opacity-60`}
        onClick={async () => {
          setSigningOut(true);
          await authClient.signOut();
          setSigningOut(false);
          router.refresh();
        }}
      >
        {signingOut ? "Keluar…" : "Keluar"}
      </button>
    </>
  );
}

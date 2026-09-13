"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

const linkClass = "transition hover:text-ink";
const buttonClass =
  "rounded-full border border-black/10 bg-white px-4 py-2 font-semibold text-ink shadow-sm transition hover:border-brand/30";

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
      <span className="font-semibold text-ink">{session.user.username ?? session.user.name}</span>
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

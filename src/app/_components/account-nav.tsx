"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

// Disalin dari site-shell alih-alih diimpor: berkas itu ikut menarik modul
// server, sedangkan komponen ini berjalan di peramban.
const linkClass =
  "relative py-1 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-brand-orange after:transition-transform after:duration-300 after:ease-out after:content-[''] hover:after:scale-x-100";
// Peralihan warnanya sengaja dilambatkan dan diberi kurva keluar supaya isian
// tombolnya terasa mengalir, bukan berkedip ganti warna.
const buttonClass =
  "rounded-lg border border-[#105C78]/20 bg-white px-4 py-2 font-normal text-brand transition-[background-color,border-color,color] duration-300 ease-out hover:border-brand hover:bg-brand hover:text-white";

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
      <span className="font-medium text-brand">
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

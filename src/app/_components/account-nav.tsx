"use client";

import Link from "next/link";

import { authClient, keluar } from "@/lib/auth-client";

// Salinan dari site-shell, yang menarik modul server.
const linkClass =
  "relative py-1 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-brand-orange after:transition-transform after:duration-300 after:ease-out after:content-[''] hover:after:scale-x-100";
const buttonClass =
  "rounded-lg border border-[#105C78]/20 bg-white px-4 py-2 font-normal text-brand transition-[background-color,border-color,color] duration-300 ease-out hover:border-brand hover:bg-brand hover:text-white";

/** Session dibaca di peramban agar halaman tetap ter-prerender. */
export function AccountNav() {
  const { data: session, isPending } = authClient.useSession();

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
      <Link className={linkClass} href="/peserta">
        Dasbor
      </Link>
      {session.user.role === "admin" && (
        <Link className={linkClass} href="/admin">
          Admin
        </Link>
      )}
      <span className="font-medium text-brand">
        {session.user.username ?? session.user.name}
      </span>
      <button type="button" className={buttonClass} onClick={keluar}>
        Keluar
      </button>
    </>
  );
}

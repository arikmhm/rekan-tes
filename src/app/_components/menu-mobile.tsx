"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AccountNav } from "./account-nav";

// translate dan rotate terpisah agar tidak saling menimpa saat jadi silang.
const garis =
  "absolute h-0.5 w-5 rounded-full bg-brand transition-all duration-300 ease-out";

export function MenuMobile() {
  const [buka, setBuka] = useState(false);

  // Header menyingkir saat digulir, jadi panel ditutup sekalian.
  useEffect(() => {
    if (!buka) return;
    const tutup = () => setBuka(false);
    window.addEventListener("scroll", tutup, { passive: true });
    return () => window.removeEventListener("scroll", tutup);
  }, [buka]);

  return (
    <>
      <button
        type="button"
        aria-expanded={buka}
        aria-controls="menu-ponsel"
        aria-label={buka ? "Tutup menu" : "Buka menu"}
        onClick={() => setBuka((b) => !b)}
        className="relative grid size-9 shrink-0 place-items-center rounded-lg transition-colors duration-300 ease-out hover:bg-brand/5 sm:hidden"
      >
        <span
          className={`${garis} ${buka ? "rotate-45" : "-translate-y-1.5"}`}
          aria-hidden
        />
        <span
          className={`${garis} ${buka ? "scale-x-0 opacity-0" : ""}`}
          aria-hidden
        />
        <span
          className={`${garis} ${buka ? "-rotate-45" : "translate-y-1.5"}`}
          aria-hidden
        />
      </button>

      {/* Tetap terpasang demi animasi; saat tertutup dinonaktifkan, juga untuk pembaca layar. */}
      <div
        id="menu-ponsel"
        inert={!buka}
        onClick={() => setBuka(false)}
        className={`absolute inset-x-0 top-full border-b border-[#105C78]/20 bg-white transition-all duration-300 ease-out sm:hidden ${
          buka
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-5 py-3 text-sm font-normal text-brand">
          <Link className="py-2" href="/">
            Beranda
          </Link>
          <Link className="py-2" href="/produk">
            Produk
          </Link>
          <Link className="py-2" href="/simulasi">
            Simulasi gratis
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-4 border-t border-[#105C78]/20 pt-4">
            <AccountNav />
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

import { AccountNav } from "./account-nav";

// Satu batang hamburger. Posisi dan rotasinya diatur lewat properti transform
// yang berbeda (translate dan rotate), jadi keduanya bisa berjalan bersamaan
// tanpa saling menimpa saat batang berubah menjadi silang.
const garis =
  "absolute h-0.5 w-5 rounded-full bg-brand transition-all duration-300 ease-out";

/**
 * Navigasi ponsel: tombol hamburger yang berubah menjadi silang, dan panel yang
 * turun tepat di bawah header. Di layar sedang ke atas seluruhnya disembunyikan
 * karena tautannya sudah tampil utuh di baris header.
 */
export function MenuMobile() {
  const [buka, setBuka] = useState(false);

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
        {/* Batang tengah cukup memudar di tempat: ia sudah berada di sumbu
            silang, jadi tidak perlu ikut berputar. */}
        <span
          className={`${garis} ${buka ? "scale-x-0 opacity-0" : ""}`}
          aria-hidden
        />
        <span
          className={`${garis} ${buka ? "-rotate-45" : "translate-y-1.5"}`}
          aria-hidden
        />
      </button>

      {/* Panel tetap terpasang supaya buka-tutupnya bisa dianimasikan; saat
          tertutup ia dinonaktifkan sepenuhnya, termasuk untuk pembaca layar. */}
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
          <Link className="py-2" href="/tes">
            Katalog
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

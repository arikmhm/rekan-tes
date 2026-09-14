import Link from "next/link";

import { emailAddress } from "@/lib/email";
import { env } from "@/lib/env";

import { AccountNav } from "./account-nav";

/** Tanggal berlaku dokumen legal. Perbarui bersama isi dokumennya. */
export const TERAKHIR_DIPERBARUI = "13 September 2026";

/** Kontak resmi: alamat pengirim email layanan, satu sumber untuk semua halaman. */
export const KONTAK = emailAddress(env.EMAIL_FROM);

/**
 * Kerangka halaman publik selain landing page. Disclaimer independensi berada
 * di footer, sehingga setiap halaman katalog dan detail selalu memuatnya.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />

      {/* Kolom fleks supaya halaman yang ingin menjejak penuh cukup memakai
          flex-1, tanpa menghitung tinggi header dan footer sendiri. */}
      <main className="flex flex-1 flex-col">{children}</main>

      <SiteFooter />
    </>
  );
}

/**
 * Footer publik, satu untuk semua halaman. Satu baris saja: hak cipta lalu
 * ketiga dokumen legal. Penyangkalan selengkapnya — platform ini independen,
 * bukan mitra resmi rekrutmen bank, dan pembayaran tidak menjamin kelulusan —
 * dimuat syarat layanan yang ditautkan di sini.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-[#105C78]/20 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-xs leading-5 font-normal text-brand/60 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© 2026 Rekan Tes. Platform simulasi independen.</p>
        <LegalLinks />
      </div>
    </footer>
  );
}

/**
 * Sorotan tautan navigasi: garis tipis yang tumbuh dari tengah ke samping.
 * Warnanya sengaja tidak berubah saat disorot — hanya garisnya yang muncul,
 * jadi teksnya tidak berkedip warna setiap kali kursor lewat.
 */
export const tautanNav =
  "relative py-1 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-brand-orange after:transition-transform after:duration-300 after:ease-out after:content-[''] hover:after:scale-x-100";

/**
 * Header publik, satu untuk semua halaman termasuk landing page. Isinya pendek
 * supaya muat utuh tanpa menu tersembunyi: beranda, katalog, simulasi gratis,
 * lalu akun.
 */
export function SiteHeader() {
  return (
    <header className="relative z-10 border-b border-[#105C78]/20 bg-white">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8"
      >
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight whitespace-nowrap text-brand transition-opacity hover:opacity-70"
        >
          Rekan Tes
        </Link>
        <div className="flex items-center gap-3 text-sm font-normal text-brand sm:gap-5">
          {/* Beranda dilepas di ponsel: nama situs di kiri sudah menuju ke sana,
              dan tempatnya dibutuhkan tautan yang tidak punya pengganti. */}
          <Link className={`hidden sm:inline ${tautanNav}`} href="/">
            Beranda
          </Link>
          <Link className={tautanNav} href="/tes">
            Katalog
          </Link>
          <Link
            className="shrink-0 rounded-full border border-brand-orange/40 px-2.5 py-1.5 whitespace-nowrap text-brand-orange transition-colors hover:bg-brand-orange/10 sm:px-3"
            href="/simulasi"
          >
            Coba gratis
          </Link>
          <span className="h-4 w-px bg-brand/20" aria-hidden />
          <AccountNav />
        </div>
      </nav>
    </header>
  );
}

/** Dokumen legal wajib. Dipakai footer publik dan footer landing page. */
export function LegalLinks() {
  return (
    <p className="flex flex-wrap gap-x-5 gap-y-1">
      <Link
        className="font-medium transition hover:text-brand-orange"
        href="/privasi"
      >
        Kebijakan privasi
      </Link>
      <Link
        className="font-medium transition hover:text-brand-orange"
        href="/syarat"
      >
        Syarat layanan
      </Link>
      <Link
        className="font-medium transition hover:text-brand-orange"
        href="/refund"
      >
        Kebijakan refund
      </Link>
    </p>
  );
}

/**
 * Kerangka satu dokumen legal. Gaya heading dan daftar diatur sekali di sini
 * agar isi halaman tetap berupa teks, bukan tumpukan class.
 */
export function LegalDoc({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_li]:mt-2 [&_p]:mt-4 [&_p]:leading-7 [&_p]:text-muted-foreground [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:leading-7 [&_ul]:text-muted-foreground">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Terakhir diperbarui {updated}.
        </p>
        {children}
      </article>
    </SiteShell>
  );
}

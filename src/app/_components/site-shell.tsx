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
      <header className="border-b border-black/8 bg-background/90">
        <nav
          aria-label="Navigasi utama"
          className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8"
        >
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-brand text-sm font-bold text-white">
              RT
            </span>
            <span className="text-lg">Rekan Tes</span>
          </Link>
          {/* Jarak dirapatkan di layar sempit; dengan gap-7 isi nav meluber
              melewati 375 px dan membuat seluruh halaman bisa digeser. */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground sm:gap-7">
            <Link className="transition hover:text-ink" href="/tes">
              Katalog
            </Link>
            <AccountNav />
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-black/8 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-xs leading-5 text-muted-foreground sm:px-8">
          <p>
            Rekan Tes adalah platform latihan independen, bukan penyelenggara atau mitra resmi
            rekrutmen bank. Pembayaran hanya untuk sesi simulasi dan tidak menjamin kelulusan.
          </p>
          <LegalLinks />
          <p>© 2026 Rekan Tes. Platform simulasi independen.</p>
        </div>
      </footer>
    </>
  );
}

/** Dokumen legal wajib. Dipakai footer publik dan footer landing page. */
export function LegalLinks() {
  return (
    <p className="flex flex-wrap gap-x-5 gap-y-1">
      <Link className="font-semibold transition hover:text-ink" href="/privasi">
        Kebijakan privasi
      </Link>
      <Link className="font-semibold transition hover:text-ink" href="/syarat">
        Syarat layanan
      </Link>
      <Link className="font-semibold transition hover:text-ink" href="/refund">
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
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">Terakhir diperbarui {updated}.</p>
        {children}
      </article>
    </SiteShell>
  );
}

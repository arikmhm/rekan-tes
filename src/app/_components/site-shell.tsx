import Link from "next/link";

import { emailAddress } from "@/lib/email";
import { env } from "@/lib/env";

import { AccountNav } from "./account-nav";
import { HeaderGeser } from "./header-geser";
import { MenuMobile } from "./menu-mobile";

/** Tanggal berlaku dokumen legal. Perbarui bersama isi dokumennya. */
export const TERAKHIR_DIPERBARUI = "13 September 2026";

export const KONTAK = emailAddress(env.EMAIL_FROM);

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />

      <main className="flex flex-1 flex-col">{children}</main>

      <SiteFooter />
    </>
  );
}

/** Penyangkalan independensi selengkapnya ada di syarat layanan yang ditautkan. */
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

export const tautanNav =
  "relative py-1 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-brand-orange after:transition-transform after:duration-300 after:ease-out after:content-[''] hover:after:scale-x-100";

export function SiteHeader() {
  return (
    <HeaderGeser>
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

        <div className="hidden items-center gap-5 text-sm font-normal text-brand sm:flex">
          <Link className={tautanNav} href="/">
            Beranda
          </Link>
          <Link className={tautanNav} href="/produk">
            Produk
          </Link>
          <Link className={tautanNav} href="/simulasi">
            Simulasi gratis
          </Link>
          <span className="h-4 w-px bg-brand/20" aria-hidden />
          <AccountNav />
        </div>

        <MenuMobile />
      </nav>
    </HeaderGeser>
  );
}

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

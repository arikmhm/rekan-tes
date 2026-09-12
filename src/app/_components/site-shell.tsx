import Link from "next/link";

import { AccountNav } from "./account-nav";

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
          <div className="flex items-center gap-7 text-sm text-muted">
            <Link className="transition hover:text-ink" href="/tes">
              Katalog
            </Link>
            <AccountNav />
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-black/8 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-xs leading-5 text-muted sm:px-8">
          <p>
            Rekan Tes adalah platform latihan independen, bukan penyelenggara atau mitra resmi
            rekrutmen bank. Pembayaran hanya untuk sesi simulasi dan tidak menjamin kelulusan.
          </p>
          <p>© 2026 Rekan Tes. Platform simulasi independen.</p>
        </div>
      </footer>
    </>
  );
}

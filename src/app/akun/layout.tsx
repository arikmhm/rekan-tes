import Link from "next/link";

import { requireUser } from "@/lib/authz";

import { AccountNav } from "../_components/account-nav";

/**
 * Kerangka dashboard peserta. Guard dipasang di sini, sama seperti
 * `admin/layout.tsx`, supaya seluruh route di bawah /akun ikut tertutup
 * sejak layout. Menunya sengaja minim dulu: cuma Katalog dan AccountNav,
 * karena baru ada satu halaman isinya.
 */
export default async function AkunLayout({ children }: LayoutProps<"/akun">) {
  await requireUser();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-black/8 bg-white">
        <nav
          aria-label="Navigasi dashboard"
          className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8"
        >
          <Link href="/akun" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-brand text-sm font-bold text-white">
              RT
            </span>
            <span className="text-lg">Dashboard</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link className="transition hover:text-ink" href="/tes">
              Katalog
            </Link>
            <AccountNav />
          </div>
        </nav>
      </header>

      <main className="flex-1 bg-cream/40">{children}</main>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "./_components/site-shell";

export const metadata: Metadata = { title: "Halaman tidak ditemukan" };

export default function NotFound() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:py-28">
        <p className="font-mono text-sm font-semibold text-brand">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Halaman tidak ditemukan.</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Tautannya mungkin salah, atau simulasi yang kamu cari sudah tidak terbit lagi.
        </p>
        <Link
          href="/tes"
          className="mt-8 inline-flex rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark"
        >
          Lihat katalog simulasi
        </Link>
      </div>
    </SiteShell>
  );
}

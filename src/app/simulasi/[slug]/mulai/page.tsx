import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SesiSimulasi } from "../../../_components/sesi-simulasi";
import { SiteFooter } from "../../../_components/site-shell";
import { getPaket, paketSimulasi } from "../../data";

export function generateStaticParams() {
  return paketSimulasi.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const paket = getPaket((await params).slug);
  if (!paket) return { title: "Simulasi tidak ditemukan" };

  return {
    title: `Mengerjakan ${paket.nama}`,
    robots: { index: false },
  };
}

export default async function SesiPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const paket = getPaket((await params).slug);

  if (!paket) {
    notFound();
  }

  // Tanpa SiteShell: navigasi situs di tengah ujian mengundang keluar tak sengaja.
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SesiSimulasi paket={paket} />

      <SiteFooter />
    </div>
  );
}

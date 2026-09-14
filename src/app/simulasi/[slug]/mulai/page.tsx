import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SesiSimulasi } from "../../../_components/sesi-simulasi";
import { getPaket, paketSimulasi } from "../../data";

// Paketnya statis dan sedikit, jadi seluruh rutenya bisa disiapkan saat build:
// halaman ini tidak pernah menyentuh basis data.
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

  // Halaman pengerjaan tidak perlu diindeks: pintu masuknya halaman detail.
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

  // Sengaja tanpa SiteShell: sesi punya header dan footernya sendiri, dan
  // navigasi situs di tengah ujian cuma mengundang peserta keluar tak sengaja.
  return (
    <div className="min-h-screen bg-cream">
      <SesiSimulasi paket={paket} />
    </div>
  );
}

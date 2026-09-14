import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SesiSimulasi } from "../../../_components/sesi-simulasi";
import { LegalLinks } from "../../../_components/site-shell";
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

  // Sengaja tanpa SiteShell: sesi punya headernya sendiri, dan menaruh navigasi
  // situs di tengah ujian cuma mengundang peserta keluar tak sengaja. Footernya
  // tetap footer situs, didorong ke dasar halaman oleh sesi yang mengisi sisa
  // tinggi layar.
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SesiSimulasi paket={paket} />

      <footer className="border-t border-[#105C78]/20 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-xs leading-5 font-normal text-brand/60 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2026 Rekan Tes. Platform simulasi independen.</p>
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}

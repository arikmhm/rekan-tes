import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getTestPreview } from "@/lib/admin";

import { SesiSimulasi } from "../../_components/sesi-simulasi";

export const metadata: Metadata = {
  title: "Pratinjau produk tes",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/** Di luar `/admin` agar tanpa sidebar panel; guardnya `requireAdmin` di `getTestPreview`. */
export default async function PratinjauPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pratinjau = await getTestPreview(id);

  if (!pratinjau) {
    notFound();
  }

  const { tes, paket } = pratinjau;
  const kembali = `/admin/tes/${tes.id}`;

  if (paket.soal.length === 0) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-brand text-lg font-medium">{tes.name} belum punya soal.</p>
        <p className="text-brand/60 max-w-md text-sm">
          Tambahkan subtes dan tugaskan soalnya dulu, baru produk ini bisa dicoba.
        </p>
        <Link href={kembali} className="text-brand text-sm font-medium underline">
          Kembali ke produk
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SesiSimulasi
        paket={paket}
        label="Pratinjau admin"
        jalan={{
          keluar: kembali,
          lanjutHref: kembali,
          lanjutTeks: "Kembali ke produk",
          catatan: "Pratinjau admin: jawaban dan hasil sesi ini tidak disimpan ke mana pun.",
        }}
      />
    </div>
  );
}

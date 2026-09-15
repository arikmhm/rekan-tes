import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublishedTest } from "@/lib/produk";

import { DetailProduk } from "../../_components/detail-produk";
import { SiteShell } from "../../_components/site-shell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const tes = await getPublishedTest((await params).slug);
  if (!tes) return { title: "Tes tidak ditemukan" };

  return { title: tes.name, description: tes.description };
}

export default async function TesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const tes = await getPublishedTest((await params).slug);

  if (!tes) {
    notFound();
  }

  return (
    <SiteShell>
      <div className="relative overflow-hidden">
        {/* Pola yang sama dengan halaman produk, hanya di kepala halaman lalu lenyap. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[url('/patterns/jigsaw.svg')] bg-repeat opacity-[0.04] mask-[linear-gradient(to_bottom,black,transparent)]"
        />

        <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <DetailProduk
            tes={tes}
            kembali={{ href: "/produk", teks: "Semua produk" }}
            tautanGratis
          />
        </div>
      </div>
    </SiteShell>
  );
}

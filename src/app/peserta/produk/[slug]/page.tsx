import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublishedTest } from "@/lib/produk";

import { DetailProduk } from "../../../_components/detail-produk";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const tes = await getPublishedTest((await params).slug);
  if (!tes) return { title: "Produk tidak ditemukan" };

  return { title: tes.name };
}

export const dynamic = "force-dynamic";

export default async function ProdukDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const tes = await getPublishedTest((await params).slug);

  if (!tes) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 pt-5 sm:p-6 sm:pt-6">
      <DetailProduk
        tes={tes}
        kembali={{ href: "/peserta", teks: "Semua produk" }}
      />
    </div>
  );
}

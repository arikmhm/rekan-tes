import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ACCESS_DAYS, getPublishedTest } from "@/lib/catalog";
import { formatDuration, formatPrice } from "@/lib/format";

import { CheckoutButton } from "../../_components/checkout-button";
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

const hairline = "border-[#105C78]/20";

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
      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-4xl leading-[1.2] font-medium tracking-[-0.01em] text-brand sm:text-5xl">
            {tes.name}
          </h1>
          <p className="text-3xl font-medium whitespace-nowrap text-brand-orange">
            {formatPrice(tes.priceAmount)}
          </p>
        </div>
        <p className="mt-5 max-w-2xl text-lg leading-8 font-normal text-brand/80">
          {tes.description}
        </p>

        <dl
          className={`mt-8 flex flex-wrap divide-x ${hairline} border-y ${hairline} py-4 text-sm`}
        >
          <div className="pr-6">
            <dt className="text-xs font-normal text-brand/60">Total soal</dt>
            <dd className="mt-1 font-medium text-brand">{tes.questionCount}</dd>
          </div>
          <div className="px-6">
            <dt className="text-xs font-normal text-brand/60">Total durasi</dt>
            <dd className="mt-1 font-medium text-brand">
              {formatDuration(tes.durationSeconds)}
            </dd>
          </div>
          <div className="px-6">
            <dt className="text-xs font-normal text-brand/60">Masa akses</dt>
            <dd className="mt-1 font-medium text-brand">{ACCESS_DAYS} hari</dd>
          </div>
        </dl>

        <h2 className="mt-12 text-2xl font-medium tracking-[-0.01em] text-brand">
          Urutan subtes
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 font-normal text-brand/60">
          Subtes dikerjakan berurutan. Setiap subtes memiliki batas waktu
          sendiri dan tidak dapat dibuka kembali setelah dikumpulkan.
        </p>

        <ol
          className={`mt-6 divide-y ${hairline} rounded-2xl border ${hairline} bg-white`}
        >
          {tes.subtests.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-4 p-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand font-mono text-xs font-medium text-white">
                {String(s.position).padStart(2, "0")}
              </span>
              <div className="min-w-45 flex-1">
                <p className="font-medium text-brand">{s.name}</p>
                {s.description && (
                  <p className="mt-1 text-sm leading-6 font-normal text-brand/60">
                    {s.description}
                  </p>
                )}
              </div>
              <p className="text-sm font-normal text-brand/60">
                {s.questionLimit} soal <span aria-hidden>·</span>{" "}
                {formatDuration(s.durationSeconds)}
              </p>
            </li>
          ))}
        </ol>

        <div className={`mt-10 rounded-2xl border ${hairline} bg-cream p-7`}>
          <h2 className="text-lg font-medium text-brand">Beli sesi</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 font-normal text-brand/70">
            Satu pembelian memberi satu kali pengerjaan, dengan masa akses{" "}
            {ACCESS_DAYS} hari sejak pembayaran berhasil. Pembayaran memakai
            QRIS: kode muncul di halaman pesanan dan dapat dipindai dari
            aplikasi bank atau dompet digital mana pun.
          </p>
          <div className="mt-5">
            <CheckoutButton slug={tes.slug} />
          </div>
          <p className="mt-4 text-sm leading-6 font-normal text-brand/70">
            Sebelum membeli, baca{" "}
            <Link
              className="font-medium text-brand underline transition-colors hover:text-brand-orange"
              href="/syarat"
            >
              syarat layanan
            </Link>
            ,{" "}
            <Link
              className="font-medium text-brand underline transition-colors hover:text-brand-orange"
              href="/refund"
            >
              kebijakan refund
            </Link>
            , dan{" "}
            <Link
              className="font-medium text-brand underline transition-colors hover:text-brand-orange"
              href="/privasi"
            >
              kebijakan privasi
            </Link>
            .
          </p>
        </div>
      </div>
    </SiteShell>
  );
}

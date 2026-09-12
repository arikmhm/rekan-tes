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

export default async function TesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const tes = await getPublishedTest((await params).slug);

  if (!tes) {
    notFound();
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{tes.name}</h1>
        <p className="mt-5 text-lg leading-8 text-muted">{tes.description}</p>

        <dl className="mt-10 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-black/8 bg-white p-5">
            <dt className="text-xs text-muted">Harga sesi</dt>
            <dd className="mt-1 text-lg font-semibold text-brand-dark">
              {formatPrice(tes.priceAmount)}
            </dd>
          </div>
          <div className="rounded-2xl border border-black/8 bg-white p-5">
            <dt className="text-xs text-muted">Total soal</dt>
            <dd className="mt-1 text-lg font-semibold">{tes.questionCount}</dd>
          </div>
          <div className="rounded-2xl border border-black/8 bg-white p-5">
            <dt className="text-xs text-muted">Total durasi</dt>
            <dd className="mt-1 text-lg font-semibold">{formatDuration(tes.durationSeconds)}</dd>
          </div>
          <div className="rounded-2xl border border-black/8 bg-white p-5">
            <dt className="text-xs text-muted">Masa akses</dt>
            <dd className="mt-1 text-lg font-semibold">{ACCESS_DAYS} hari</dd>
          </div>
        </dl>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">Urutan subtes</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Subtes dikerjakan berurutan. Setiap subtes memiliki batas waktu sendiri dan tidak dapat
          dibuka kembali setelah dikumpulkan.
        </p>

        <ol className="mt-6 space-y-3">
          {tes.subtests.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-black/8 bg-white p-5"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint font-mono text-xs font-semibold text-brand-dark">
                {String(s.position).padStart(2, "0")}
              </span>
              <div className="min-w-45 flex-1">
                <p className="font-semibold">{s.name}</p>
                {s.description && (
                  <p className="mt-1 text-sm leading-6 text-muted">{s.description}</p>
                )}
              </div>
              <p className="text-sm text-muted">
                {s.questionLimit} soal · {formatDuration(s.durationSeconds)}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-3xl border border-brand/15 bg-mint/60 p-7">
          <h2 className="text-lg font-semibold text-brand-dark">Beli sesi</h2>
          <p className="mt-2 text-sm leading-6 text-brand-dark/80">
            Satu pembelian memberi satu kali pengerjaan, dengan masa akses {ACCESS_DAYS} hari sejak
            pembayaran berhasil. Pembayaran memakai QRIS: kode muncul di halaman pesanan dan dapat
            dipindai dari aplikasi bank atau dompet digital mana pun.
          </p>
          <div className="mt-5">
            <CheckoutButton slug={tes.slug} />
          </div>
          <p className="mt-4 text-sm leading-6 text-brand-dark/80">
            Sebelum membeli, baca{" "}
            <Link className="font-semibold underline" href="/syarat">
              syarat layanan
            </Link>
            ,{" "}
            <Link className="font-semibold underline" href="/refund">
              kebijakan refund
            </Link>
            , dan{" "}
            <Link className="font-semibold underline" href="/privasi">
              kebijakan privasi
            </Link>
            .
          </p>
        </div>
      </div>
    </SiteShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";

import { formatPrice } from "@/lib/format";
import { getOrder } from "@/lib/order";

import { SiteShell } from "../../_components/site-shell";

export const metadata: Metadata = { title: "Status pesanan" };

const tanggal = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" });
const jam = new Intl.DateTimeFormat("id-ID", { timeStyle: "short" });

const keterangan: Record<string, string> = {
  pending: "Menunggu pembayaran. Status berubah setelah kami menerima notifikasi resmi DOKU.",
  paid: "Pembayaran diterima. Sesi sudah dapat dikerjakan dalam masa akses.",
  expired: "Batas waktu pembayaran terlewat. Silakan buat pesanan baru.",
  cancelled: "Pesanan dibatalkan.",
  refunded: "Dana sudah dikembalikan.",
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const order = await getOrder((await params).id);

  if (!order) {
    notFound();
  }

  const qris = order.payments.find(
    (p) => p.status === "pending" && p.qrContent && p.expiresAt && p.expiresAt > new Date(),
  );

  // QR dirender di server menjadi SVG; tidak ada JavaScript tambahan di
  // peramban dan isi QR tidak pernah berpindah ke pihak ketiga.
  const qrSvg = qris?.qrContent
    ? await QRCode.toString(qris.qrContent, { type: "svg", margin: 1, width: 320 })
    : null;

  return (
    <SiteShell>
      {/* Status pembayaran datang dari notifikasi DOKU, bukan dari peramban,
          jadi halaman menyegarkan dirinya sendiri selama masih menunggu. */}
      {order.status === "pending" && <meta httpEquiv="refresh" content="15" />}

      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-sm font-bold text-brand">Status pesanan</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{order.testName}</h1>

        <div className="mt-8 rounded-3xl border border-black/8 bg-white p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-2xl font-semibold text-brand-dark">{formatPrice(order.amount)}</p>
            <span className="rounded-full bg-cream px-3 py-1.5 text-xs font-semibold">
              {order.status}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {keterangan[order.status] ?? "Status pesanan sedang diproses."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Dibuat {tanggal.format(order.createdAt)}.</p>
          {order.accessExpiresAt && (
            <p className="mt-2 text-sm text-muted-foreground">
              Masa akses sampai {tanggal.format(order.accessExpiresAt)}.
            </p>
          )}
        </div>

        {qrSvg && qris?.expiresAt && (
          <div className="mt-6 rounded-3xl border border-brand/15 bg-mint/60 p-7 text-center">
            <h2 className="text-lg font-semibold text-brand-dark">Bayar dengan QRIS</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-brand-dark/80">
              Pindai kode ini dengan aplikasi bank atau dompet digital apa pun yang mendukung QRIS.
              Nominalnya sudah terisi otomatis.
            </p>

            <div
              aria-label="Kode QRIS pembayaran"
              role="img"
              className="mx-auto mt-6 w-[260px] max-w-full rounded-2xl bg-white p-4 [&>svg]:h-auto [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />

            <p className="mt-5 text-sm font-semibold text-brand-dark">
              Berlaku sampai pukul {jam.format(qris.expiresAt)}
            </p>
            <p className="mt-2 text-xs leading-5 text-brand-dark/70">
              Halaman ini memuat ulang sendiri. Setelah pembayaranmu terverifikasi, statusnya
              berubah tanpa perlu kamu lakukan apa pun.
            </p>
          </div>
        )}

        {order.status === "pending" && !qrSvg && (
          <p className="mt-6 rounded-3xl border border-dashed border-black/12 p-7 text-center text-sm leading-6 text-muted-foreground">
            Kode QRIS untuk pesanan ini sudah kedaluwarsa.{" "}
            <Link className="font-semibold hover:underline" href={`/tes/${order.testSlug}`}>
              Mulai pembayaran baru
            </Link>
            .
          </p>
        )}

        <h2 className="mt-10 text-lg font-semibold">Percobaan pembayaran</h2>
        <ul className="mt-3 space-y-2">
          {order.payments.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/8 bg-white px-5 py-4 text-sm"
            >
              <code className="rounded-lg bg-cream px-2 py-1 text-xs font-semibold">
                {p.externalId}
              </code>
              <span className="text-muted-foreground">{p.status}</span>
              <span className="text-xs text-muted-foreground">{tanggal.format(p.createdAt)}</span>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm leading-6 text-muted-foreground">
          Halaman ini hanya menampilkan status yang tercatat di sistem kami. Memindai QR tidak
          langsung mengubah status; perubahan menunggu notifikasi resmi DOKU.{" "}
          <Link className="font-semibold hover:underline" href={`/tes/${order.testSlug}`}>
            Lihat detail tes
          </Link>
          .
        </p>
      </div>
    </SiteShell>
  );
}

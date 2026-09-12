import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatPrice } from "@/lib/format";
import { getOrder } from "@/lib/order";

import { SiteShell } from "../../_components/site-shell";

export const metadata: Metadata = { title: "Status pesanan" };

const tanggal = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" });

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

  const checkoutHidup = order.payments.find(
    (p) => p.status === "pending" && p.checkoutUrl && p.expiresAt && p.expiresAt > new Date(),
  );

  return (
    <SiteShell>
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
          <p className="mt-4 text-sm leading-6 text-muted">
            {keterangan[order.status] ?? "Status pesanan sedang diproses."}
          </p>
          <p className="mt-2 text-sm text-muted">Dibuat {tanggal.format(order.createdAt)}.</p>
          {order.accessExpiresAt && (
            <p className="mt-2 text-sm text-muted">
              Masa akses sampai {tanggal.format(order.accessExpiresAt)}.
            </p>
          )}

          {checkoutHidup?.checkoutUrl && (
            <a
              href={checkoutHidup.checkoutUrl}
              className="mt-6 inline-flex rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark"
            >
              Lanjutkan pembayaran
            </a>
          )}
        </div>

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
              <span className="text-muted">{p.status}</span>
              <span className="text-xs text-muted">{tanggal.format(p.createdAt)}</span>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm leading-6 text-muted">
          Halaman ini hanya menampilkan status yang tercatat di sistem kami. Kembali dari halaman
          pembayaran tidak mengubah status apa pun.{" "}
          <Link className="font-semibold hover:underline" href={`/tes/${order.testSlug}`}>
            Lihat detail tes
          </Link>
          .
        </p>
      </div>
    </SiteShell>
  );
}

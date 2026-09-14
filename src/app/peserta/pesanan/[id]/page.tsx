import { ArrowLeft, ArrowRight, QrCode } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";

import { formatPrice } from "@/lib/format";
import { getOrder } from "@/lib/order";

import { CheckPaymentButton } from "../../../_components/check-payment-button";
import { LABEL_ORDER, tanggal } from "../../_components/label";

export const metadata: Metadata = { title: "Rincian pesanan" };

const hairline = "border-[#105C78]/20";

const jam = new Intl.DateTimeFormat("id-ID", { timeStyle: "short" });

const keterangan: Record<string, string> = {
  pending:
    "Menunggu pembayaran. Status berubah setelah kami menerima notifikasi resmi DOKU.",
  paid: "Pembayaran diterima. Sesi sudah dapat dikerjakan dalam masa akses.",
  expired: "Batas waktu pembayaran terlewat. Silakan buat pesanan baru.",
  cancelled: "Pesanan dibatalkan.",
  refunded: "Dana sudah dikembalikan.",
};

const warnaStatus: Record<string, string> = {
  paid: "bg-brand-orange/15 text-brand-orange",
  pending: "bg-cream text-brand/70",
};

export default async function PesananDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const order = await getOrder((await params).id);

  if (!order) {
    notFound();
  }

  const qris = order.payments.find(
    (p) =>
      p.status === "pending" &&
      p.qrContent &&
      p.expiresAt &&
      p.expiresAt > new Date(),
  );

  // QR dirender di server menjadi SVG; tidak ada JavaScript tambahan di
  // peramban dan isi QR tidak pernah berpindah ke pihak ketiga.
  const qrSvg = qris?.qrContent
    ? await QRCode.toString(qris.qrContent, {
        type: "svg",
        margin: 1,
        width: 320,
      })
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl p-4 pt-5 sm:p-6 sm:pt-6">
      {/* Status pembayaran datang dari notifikasi DOKU, bukan dari peramban,
          jadi halaman menyegarkan dirinya sendiri selama masih menunggu. */}
      {order.status === "pending" && <meta httpEquiv="refresh" content="15" />}

      <Link
        href="/peserta/pesanan"
        className="group inline-flex items-center gap-2 text-sm font-normal text-brand/60 transition-colors hover:text-brand-orange"
      >
        <ArrowLeft
          className="size-4 transition-transform duration-300 ease-out group-hover:-translate-x-1"
          aria-hidden
        />
        Semua pesanan
      </Link>

      <h1 className="mt-5 text-2xl leading-snug font-medium tracking-[-0.01em] text-brand">
        {order.testName}
      </h1>

      <section className={`mt-6 rounded-2xl border ${hairline} bg-white p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-2xl font-medium text-brand-orange">
            {formatPrice(order.amount)}
          </p>
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              warnaStatus[order.status] ?? "bg-cream text-brand/50"
            }`}
          >
            {LABEL_ORDER[order.status] ?? order.status}
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 font-normal text-brand/70">
          {keterangan[order.status] ?? "Status pesanan sedang diproses."}
        </p>

        <dl className={`mt-5 space-y-2.5 border-t ${hairline} pt-5 text-sm`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="font-normal text-brand/60">Dibuat</dt>
            <dd className="font-medium text-brand">
              {tanggal.format(order.createdAt)}
            </dd>
          </div>
          {order.accessExpiresAt && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="font-normal text-brand/60">Masa akses</dt>
              <dd className="font-medium text-brand">
                sampai {tanggal.format(order.accessExpiresAt)}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {order.status === "paid" && order.attemptId && (
        <section
          className={`mt-4 rounded-2xl border ${hairline} bg-mint/60 p-6`}
        >
          <h2 className="text-lg font-medium text-brand">
            Sesi siap dikerjakan
          </h2>
          <p className="mt-2 text-sm leading-6 font-normal text-brand/70">
            Baca petunjuknya dulu; waktu subtes pertama baru berjalan setelah
            kamu menekan tombol mulai di halaman sesi.
          </p>
          <Link
            href={`/peserta/simulasi/${order.attemptId}`}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors duration-300 ease-out hover:bg-brand-orange"
          >
            Buka sesi pengerjaan
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>
      )}

      {qrSvg && qris?.expiresAt && (
        <section
          className={`mt-4 rounded-2xl border ${hairline} bg-mint/60 p-6 text-center`}
        >
          <QrCode className="mx-auto size-5 text-brand/40" aria-hidden />
          <h2 className="mt-3 text-lg font-medium text-brand">
            Bayar dengan QRIS
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 font-normal text-brand/70">
            Pindai kode ini dengan aplikasi bank atau dompet digital apa pun
            yang mendukung QRIS. Nominalnya sudah terisi otomatis.
          </p>

          <div
            aria-label="Kode QRIS pembayaran"
            role="img"
            className="mx-auto mt-6 w-[260px] max-w-full rounded-2xl bg-white p-4 [&>svg]:h-auto [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />

          <p className="mt-5 text-sm font-medium text-brand">
            Berlaku sampai pukul {jam.format(qris.expiresAt)}
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-5 font-normal text-brand/60">
            Halaman ini memuat ulang sendiri untuk membaca notifikasi dari DOKU.
            Kalau kamu sudah membayar tapi status belum berubah, tekan tombol di
            bawah untuk memeriksa langsung.
          </p>
        </section>
      )}

      {order.status === "pending" && !qrSvg && (
        <p
          className={`mt-4 rounded-2xl border border-dashed ${hairline} p-6 text-center text-sm leading-6 font-normal text-brand/60`}
        >
          Kode QRIS untuk pesanan ini sudah kedaluwarsa.{" "}
          <Link
            className="font-medium text-brand hover:text-brand-orange"
            href={`/tes/${order.testSlug}`}
          >
            Mulai pembayaran baru
          </Link>
          . Sudah sempat membayar sebelum kedaluwarsa? Tekan tombol di bawah
          untuk memeriksa.
        </p>
      )}

      {order.status === "pending" && (
        <div className="mt-4 text-center">
          <CheckPaymentButton orderId={order.id} />
        </div>
      )}

      <h2 className="mt-9 text-lg font-medium text-brand">
        Percobaan pembayaran
      </h2>
      <ul className="mt-3 space-y-2">
        {order.payments.map((p) => (
          <li
            key={p.id}
            className={`flex flex-wrap items-center gap-3 rounded-xl border ${hairline} bg-white px-5 py-4 text-sm font-normal`}
          >
            <code className="rounded-lg bg-cream px-2 py-1 text-xs font-medium text-brand">
              {p.externalId}
            </code>
            <span className="text-brand/70">
              {LABEL_ORDER[p.status] ?? p.status}
            </span>
            <span className="text-xs text-brand/50">
              {tanggal.format(p.createdAt)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm leading-6 font-normal text-brand/60">
        Halaman ini hanya menampilkan status yang tercatat di sistem kami.
        Memindai QR tidak langsung mengubah status; perubahan menunggu
        notifikasi resmi DOKU.{" "}
        <Link
          className="font-medium text-brand hover:text-brand-orange"
          href={`/tes/${order.testSlug}`}
        >
          Lihat detail produk
        </Link>
        .
      </p>
    </div>
  );
}

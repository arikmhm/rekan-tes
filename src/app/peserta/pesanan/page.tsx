import { ArrowRight, Receipt } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/authz";
import { formatPrice } from "@/lib/format";
import { listOrdersForUser } from "@/lib/order";

import { LABEL_ORDER, tanggal } from "../_components/label";

export const metadata: Metadata = { title: "Pesanan" };

// Status pesanan berubah dari notifikasi pembayaran, jadi halaman ini selalu
// membaca ulang database.
export const dynamic = "force-dynamic";

const hairline = "border-[#105C78]/20";

/** Hanya pesanan lunas yang berwarna; sisanya cukup abu agar tidak menyita mata. */
const warnaStatus: Record<string, string> = {
  paid: "bg-brand-orange/15 text-brand-orange",
  pending: "bg-cream text-brand/70",
};

export default async function PesananPage() {
  const user = await requireUser();
  const pesanan = await listOrdersForUser(user.id);

  return (
    <div className="mx-auto w-full max-w-4xl p-4 pt-5 sm:p-6 sm:pt-6">
      <h1 className="text-2xl font-medium tracking-[-0.01em] text-brand">
        Pesanan
      </h1>
      <p className="mt-1.5 text-sm leading-6 font-normal text-brand/60">
        Seluruh transaksi yang pernah kamu buat, terbaru lebih dulu.
      </p>

      {pesanan.length === 0 ? (
        <div
          className={`mt-7 rounded-2xl border border-dashed ${hairline} bg-white p-10 text-center`}
        >
          <Receipt className="mx-auto size-5 text-brand/30" aria-hidden />
          <h2 className="mt-3 text-lg font-medium text-brand">
            Belum ada transaksi
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 font-normal text-brand/60">
            Pesanan muncul di sini begitu kamu memulai pembayaran sebuah produk.
          </p>
          <Link
            href="/peserta"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
          >
            Lihat produk
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <ul className="mt-7 space-y-3">
          {pesanan.map((p) => (
            <li key={p.id}>
              <Link
                href={`/peserta/pesanan/${p.id}`}
                className={`group flex flex-wrap items-center justify-between gap-4 rounded-2xl border ${hairline} bg-white px-5 py-4 transition-colors hover:border-brand-orange`}
              >
                <div className="min-w-0">
                  <p className="font-medium text-brand">{p.testName}</p>
                  <p className="mt-0.5 text-xs font-normal text-brand/50">
                    {tanggal.format(p.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-brand">
                    {formatPrice(p.amount)}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      warnaStatus[p.status] ?? "bg-cream text-brand/50"
                    }`}
                  >
                    {LABEL_ORDER[p.status] ?? p.status}
                  </span>
                  <ArrowRight
                    className="size-4 text-brand/30 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:text-brand-orange"
                    aria-hidden
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

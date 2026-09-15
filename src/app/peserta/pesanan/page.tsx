import { ArrowRight, Receipt } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="mx-auto w-full p-4 pt-5 sm:p-6 sm:pt-6">
      {pesanan.length === 0 ? (
        <div
          className={`rounded-2xl border border-dashed ${hairline} bg-white p-10 text-center`}
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
        /* Tabel dibungkus kartu yang sama dengan kartu di etalase dan pustaka,
           jadi halamannya sepadan meski isinya baris, bukan kartu. Tabelnya
           sendiri sudah menggulir mendatar saat kolomnya tidak muat. */
        <div
          className={`overflow-hidden rounded-2xl border ${hairline} bg-white`}
        >
          <Table>
            <TableHeader>
              <TableRow className={`${hairline} hover:bg-transparent`}>
                <TableHead className="px-5 font-medium text-brand/60 sm:px-6">
                  Produk
                </TableHead>
                <TableHead className="font-medium text-brand/60">
                  Tanggal
                </TableHead>
                <TableHead className="font-medium text-brand/60">
                  Jumlah
                </TableHead>
                <TableHead className="font-medium text-brand/60">
                  Status
                </TableHead>
                <TableHead className="px-5 text-right font-medium text-brand/60 sm:px-6">
                  <span className="sr-only">Rincian</span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pesanan.map((p) => (
                <TableRow
                  key={p.id}
                  className={`${hairline} group hover:bg-cream/50`}
                >
                  <TableCell className="px-5 py-4 font-medium whitespace-normal text-brand sm:px-6">
                    <Link
                      href={`/peserta/pesanan/${p.id}`}
                      className="transition-colors hover:text-brand-orange"
                    >
                      {p.testName}
                    </Link>
                  </TableCell>
                  <TableCell className="py-4 font-normal whitespace-nowrap text-brand/60">
                    {tanggal.format(p.createdAt)}
                  </TableCell>
                  <TableCell className="py-4 font-medium whitespace-nowrap text-brand">
                    {formatPrice(p.amount)}
                  </TableCell>
                  <TableCell className="py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                        warnaStatus[p.status] ?? "bg-cream text-brand/50"
                      }`}
                    >
                      {LABEL_ORDER[p.status] ?? p.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right sm:px-6">
                    <Link
                      href={`/peserta/pesanan/${p.id}`}
                      aria-label={`Rincian pesanan ${p.testName}`}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-lg border ${hairline} px-3.5 text-sm font-normal whitespace-nowrap text-brand transition-colors group-hover:border-brand-orange group-hover:bg-brand-orange group-hover:text-white`}
                    >
                      Rincian
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

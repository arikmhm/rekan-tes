import { ArrowRight, BookMarked } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/authz";
import { JENIS, type JenisProduk } from "@/lib/catalog";
import { listOrdersForUser } from "@/lib/order";

import {
  hitungJenis,
  SaringanJenis,
  URUTAN_JENIS,
} from "../_components/saringan-jenis";
import { KartuPustaka, type MilikPeserta } from "./_components/kartu-pustaka";

export const metadata: Metadata = { title: "Pustaka" };

// Status pengerjaan berubah sepanjang sesi, jadi halaman ini membaca ulang
// database setiap kali dibuka.
export const dynamic = "force-dynamic";

const hairline = "border-[#105C78]/20";

/**
 * Produk yang sudah dibayar beserta jalan masuk untuk memakainya. Isinya
 * disaring dari pesanan lunas, bukan tabel tersendiri: kepemilikan produk hari
 * ini memang lahir dari order yang berstatus `paid`.
 */
export default async function PustakaPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string }>;
}) {
  const user = await requireUser();

  // Semua isi pustaka hari ini lahir dari order simulasi — jenis lain belum
  // punya jalur pemenuhan sama sekali. Jenisnya tetap dilekatkan di sini supaya
  // penyaringnya tinggal membaca data, bukan dirombak saat jenis lain terbit.
  const milik: MilikPeserta[] = (await listOrdersForUser(user.id))
    .filter((o) => o.status === "paid")
    .map((o) => ({
      orderId: o.id,
      jenis: "simulasi" as JenisProduk,
      nama: o.testName,
      attemptId: o.attemptId,
      attemptStatus: o.attemptStatus,
      attemptScore: o.attemptScore,
      accessExpiresAt: o.accessExpiresAt,
    }));

  // Penyaring hidup di URL, sama seperti etalase: hasilnya bisa ditautkan dan
  // tetap jalan tanpa JavaScript.
  const dipilih = (await searchParams).jenis;
  const aktif = URUTAN_JENIS.find((j) => j === dipilih) ?? null;
  const tampil = aktif ? milik.filter((m) => m.jenis === aktif) : milik;

  return (
    <div className="mx-auto w-full max-w-6xl p-4 pt-5 sm:p-6 sm:pt-6">
      <SaringanJenis
        dasar="/peserta/pustaka"
        aktif={aktif}
        jumlah={hitungJenis(milik)}
        total={milik.length}
      />

      {tampil.length === 0 ? (
        <div
          className={`mt-8 rounded-2xl border border-dashed ${hairline} bg-white p-10 text-center`}
        >
          <BookMarked className="mx-auto size-5 text-brand/30" aria-hidden />
          <h2 className="mt-3 text-lg font-medium text-brand">
            {aktif
              ? `Belum punya ${JENIS[aktif].label.toLowerCase()}`
              : "Pustaka masih kosong"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 font-normal text-brand/60">
            Produk yang pembayarannya sudah lunas langsung muncul di sini,
            lengkap dengan tombol untuk memakainya.
          </p>
          <Link
            href={aktif ? "/peserta/pustaka" : "/peserta"}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
          >
            {aktif ? "Lihat semua isi pustaka" : "Lihat produk"}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      ) : (
        // Lebar kartu mengikuti ruang yang tersisa di sebelah sidebar, bukan
        // lebar jendela — sama seperti etalase.
        <div className="@container mt-6">
          <ul className="grid gap-5 @3xl:grid-cols-2">
            {tampil.map((m) => (
              <li key={m.orderId}>
                <KartuPustaka milik={m} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

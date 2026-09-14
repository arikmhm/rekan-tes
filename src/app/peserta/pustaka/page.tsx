import { ArrowRight, BookMarked, CalendarClock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/authz";
import { JENIS, type JenisProduk } from "@/lib/catalog";
import { listOrdersForUser } from "@/lib/order";

import { LABEL_ATTEMPT, selesai, tanggalSingkat } from "../_components/label";

export const metadata: Metadata = { title: "Pustaka" };

// Status pengerjaan berubah sepanjang sesi, jadi halaman ini membaca ulang
// database setiap kali dibuka.
export const dynamic = "force-dynamic";

const hairline = "border-[#105C78]/20";

const URUTAN_JENIS = Object.keys(JENIS) as JenisProduk[];

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
  const milik = (await listOrdersForUser(user.id))
    .filter((o) => o.status === "paid")
    .map((o) => ({ ...o, jenis: "simulasi" as JenisProduk }));

  // Penyaring hidup di URL, sama seperti katalog: hasilnya bisa ditautkan dan
  // tetap jalan tanpa JavaScript.
  const dipilih = (await searchParams).jenis;
  const aktif = URUTAN_JENIS.find((j) => j === dipilih) ?? null;
  const tampil = aktif ? milik.filter((m) => m.jenis === aktif) : milik;

  return (
    <div className="mx-auto w-full max-w-4xl p-4 pt-5 sm:p-6 sm:pt-6">
      <h1 className="text-2xl font-medium tracking-[-0.01em] text-brand">
        {aktif ? JENIS[aktif].label : "Pustaka"}
      </h1>
      <p className="mt-1.5 text-sm leading-6 font-normal text-brand/60">
        {aktif
          ? JENIS[aktif].ringkas
          : "Produk yang sudah kamu beli. Pakai kapan saja selama masa aksesnya masih berjalan."}
      </p>

      {tampil.length === 0 ? (
        <div
          className={`mt-7 rounded-2xl border border-dashed ${hairline} bg-white p-10 text-center`}
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
        <ul className="mt-7 grid gap-4 lg:grid-cols-2">
          {tampil.map((m) => {
            const rampung = selesai(m.attemptStatus);

            return (
              <li
                key={m.id}
                className={`flex flex-col rounded-2xl border ${hairline} bg-white p-6`}
              >
                <span className="inline-flex w-fit rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-brand/70">
                  {JENIS[m.jenis].label}
                </span>
                <p className="mt-3 text-lg leading-snug font-medium text-brand">
                  {m.testName}
                </p>

                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="font-normal text-brand/60">Pengerjaan</dt>
                    <dd className="font-medium text-brand">
                      {LABEL_ATTEMPT[m.attemptStatus ?? "not_started"] ??
                        m.attemptStatus}
                    </dd>
                  </div>
                  {m.attemptScore != null && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="font-normal text-brand/60">Skor akhir</dt>
                      <dd className="font-medium text-brand-orange">
                        {m.attemptScore}
                      </dd>
                    </div>
                  )}
                  {m.accessExpiresAt && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="font-normal text-brand/60">Masa akses</dt>
                      <dd className="flex items-center gap-1.5 font-medium text-brand">
                        <CalendarClock
                          className="size-4 text-brand/40"
                          aria-hidden
                        />
                        sampai {tanggalSingkat.format(m.accessExpiresAt)}
                      </dd>
                    </div>
                  )}
                </dl>

                <div
                  className={`mt-auto flex flex-wrap items-center justify-between gap-3 border-t ${hairline} pt-5`}
                >
                  <Link
                    href={`/peserta/pesanan/${m.id}`}
                    className="text-sm font-normal text-brand/60 transition-colors duration-300 ease-out hover:text-brand-orange"
                  >
                    Rincian pesanan
                  </Link>

                  {m.attemptId && (
                    <Link
                      href={
                        rampung
                          ? `/peserta/simulasi/${m.attemptId}/hasil`
                          : `/peserta/simulasi/${m.attemptId}`
                      }
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-normal text-white transition-colors duration-300 ease-out hover:bg-brand-orange"
                    >
                      {rampung ? "Lihat hasil" : "Kerjakan"}
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

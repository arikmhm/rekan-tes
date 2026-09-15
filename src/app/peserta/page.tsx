import { TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/authz";

import { DaftarProduk } from "./produk/_components/daftar-produk";

export const metadata: Metadata = { title: "Produk" };

// Daftar produk dibaca ulang tiap permintaan; tanpa ini daftarnya membeku sampai
// deploy berikutnya.
export const dynamic = "force-dynamic";

/**
 * Halaman depan ruang peserta: etalase produk, ditambah peringatan verifikasi
 * email bila masih menggantung — peringatan itu soal akun, bukan soal produk,
 * jadi ia tinggal di sini dan bukan di dalam daftarnya.
 */
export default async function PesertaPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string }>;
}) {
  const user = await requireUser();

  return (
    <div className="mx-auto w-full  p-4 pt-5 sm:p-6 sm:pt-6">
      {!user.emailVerified && (
        <Link
          href="/peserta/profil"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-brand-orange/30 bg-brand-orange/10 px-5 py-4 transition-colors hover:border-brand-orange"
        >
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0 text-brand-orange"
            aria-hidden
          />
          <p className="text-sm leading-6 font-normal text-brand">
            Email belum diverifikasi. Verifikasi dulu sebelum bisa membeli
            produk — kirim ulang tautannya dari halaman profil.
          </p>
        </Link>
      )}

      <DaftarProduk jenis={(await searchParams).jenis} />
    </div>
  );
}

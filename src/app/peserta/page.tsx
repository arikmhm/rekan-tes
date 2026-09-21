import { TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/authz";
import { listBanners } from "@/lib/produk";

import { EtalaseProduk } from "../_components/etalase-produk";
import { Spanduk } from "../_components/spanduk";

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
    <div className="mx-auto w-full max-w-6xl p-4 pt-5 sm:p-6 sm:pt-6">
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

      {/* Spanduk yang sama dengan halaman produk publik, diatur dari panel
          admin yang sama pula. Sorotan bawaan etalase dimatikan karena itu akan
          jadi korsel kedua yang menempel tepat di bawah korsel pertama. */}
      <Spanduk slides={await listBanners()} />

      <div className="mt-8">
        <EtalaseProduk
          jenis={(await searchParams).jenis}
          dasar="/peserta"
          detail="/peserta/produk"
          sorotan={false}
        />
      </div>
    </div>
  );
}

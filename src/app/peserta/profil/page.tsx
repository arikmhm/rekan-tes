import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/authz";

import { ResendVerification } from "../../_components/resend-verification";

export const metadata: Metadata = { title: "Profil" };

const hairline = "border-[#105C78]/20";

export default async function ProfilPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto w-full max-w-2xl p-4 pt-5 sm:p-6 sm:pt-6">
      <h1 className="text-2xl font-medium tracking-[-0.01em] text-brand">
        Profil
      </h1>
      <p className="mt-1.5 text-sm leading-6 font-normal text-brand/60">
        Identitas akun yang dipakai untuk masuk dan menerima bukti transaksi.
      </p>

      <section className={`mt-7 rounded-2xl border ${hairline} bg-white p-6`}>
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-normal text-brand/50">Username</dt>
            <dd className="mt-1 font-medium text-brand">
              {user.username ?? user.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-normal text-brand/50">Email</dt>
            <dd className="mt-1 font-medium text-brand">{user.email}</dd>
          </div>
        </dl>

        {!user.emailVerified && (
          <div className="mt-6 rounded-xl border border-brand-orange/30 bg-brand-orange/10 p-5">
            <p className="text-sm leading-6 font-normal text-brand">
              Email belum diverifikasi. Verifikasi dulu sebelum bisa membeli
              produk.
            </p>
            <div className="mt-4">
              <ResendVerification email={user.email} />
            </div>
          </div>
        )}

        <p
          className={`mt-6 border-t ${hairline} pt-5 text-sm font-normal text-brand/60`}
        >
          Ingin mengganti password?{" "}
          <Link
            className="font-medium text-brand transition-colors duration-300 ease-out hover:text-brand-orange"
            href="/lupa-password"
          >
            Minta tautan setel ulang
          </Link>
          .
        </p>
      </section>
    </div>
  );
}

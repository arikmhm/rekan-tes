import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/authz";
import { formatPrice } from "@/lib/format";
import { listOrdersForUser } from "@/lib/order";

import { ResendVerification } from "../_components/resend-verification";
import { SiteShell } from "../_components/site-shell";

export const metadata: Metadata = { title: "Akun saya" };

// Riwayat pesanan dibaca dari database pada setiap permintaan, sama seperti
// katalog, supaya status order yang baru saja berubah selalu ikut terbaca.
export const dynamic = "force-dynamic";

const tanggal = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" });

export default async function AkunPage() {
  const user = await requireUser();
  const orders = await listOrdersForUser(user.id);

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Akun saya</h1>

        <section className="mt-10 rounded-3xl border border-black/8 bg-white p-7">
          <h2 className="text-lg font-semibold">Info akun</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Username</dt>
              <dd className="mt-1 font-semibold">{user.username ?? user.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="mt-1 font-semibold">{user.email}</dd>
            </div>
          </dl>

          {!user.emailVerified && (
            <div className="mt-5 rounded-2xl border border-brand/15 bg-mint/60 p-4">
              <p className="text-sm leading-6 text-brand-dark">
                Email belum diverifikasi. Verifikasi dulu sebelum bisa membeli sesi simulasi.
              </p>
              <div className="mt-3">
                <ResendVerification email={user.email} />
              </div>
            </div>
          )}

          <Link
            href="/lupa-password"
            className="mt-5 inline-block text-sm font-semibold text-brand hover:text-brand-dark"
          >
            Ganti password
          </Link>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Riwayat pesanan</h2>

          {orders.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-dashed border-black/12 bg-white p-10 text-center">
              <p className="text-sm leading-6 text-muted-foreground">
                Belum ada pesanan.{" "}
                <Link className="font-semibold hover:underline" href="/tes">
                  Lihat katalog simulasi
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/order/${order.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/8 bg-white px-5 py-4 transition hover:border-brand/30"
                  >
                    <div>
                      <p className="font-semibold">{order.testName}</p>
                      <p className="text-xs text-muted-foreground">{tanggal.format(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-brand-dark">
                        {formatPrice(order.amount)}
                      </span>
                      <span className="rounded-full bg-cream px-3 py-1.5 text-xs font-semibold">
                        {order.status}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </SiteShell>
  );
}

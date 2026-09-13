import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/authz";
import { formatPrice } from "@/lib/format";
import { listOrdersForUser } from "@/lib/order";

import { ResendVerification } from "../_components/resend-verification";

export const metadata: Metadata = { title: "Dashboard" };

// Riwayat pesanan dibaca dari database pada setiap permintaan, sama seperti
// katalog, supaya status order dan attempt yang baru saja berubah selalu
// ikut terbaca.
export const dynamic = "force-dynamic";

const tanggal = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" });

const labelAttempt: Record<string, string> = {
  not_started: "Belum dimulai",
  in_progress: "Sedang dikerjakan",
  submitted: "Selesai",
  submitted_by_timeout: "Selesai (waktu habis)",
  expired: "Kedaluwarsa",
};

export default async function AkunPage() {
  const user = await requireUser();
  const orders = await listOrdersForUser(user.id);

  return (
    <div className="mx-auto max-w-4xl p-4 pt-2 sm:p-6 sm:pt-3">
      <h1 className="text-2xl font-semibold tracking-tight">Halo, {user.username ?? user.name}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Ringkasan akun dan riwayat pesananmu.</p>

      <section className="mt-8 rounded-3xl border border-black/8 bg-white p-7">
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
      </section>

      <section className="mt-8">
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
              <li
                key={order.id}
                className="rounded-2xl border border-black/8 bg-white px-5 py-4 transition hover:border-brand/30"
              >
                <Link href={`/order/${order.id}`} className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{order.testName}</p>
                    <p className="text-xs text-muted-foreground">{tanggal.format(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-brand-dark">{formatPrice(order.amount)}</span>
                    <span className="rounded-full bg-cream px-3 py-1.5 text-xs font-semibold">{order.status}</span>
                  </div>
                </Link>

                {order.attemptId && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-black/8 pt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Sesi pengerjaan:</span>
                      <span className="font-semibold">
                        {labelAttempt[order.attemptStatus ?? "not_started"] ?? order.attemptStatus}
                      </span>
                      {order.attemptScore != null && (
                        <span className="text-muted-foreground">· Skor {order.attemptScore}</span>
                      )}
                    </div>
                    <Link
                      href={
                        order.attemptStatus === "submitted" ||
                        order.attemptStatus === "submitted_by_timeout"
                          ? `/attempt/${order.attemptId}/hasil`
                          : `/attempt/${order.attemptId}`
                      }
                      className="text-sm font-semibold text-brand hover:text-brand-dark"
                    >
                      {order.attemptStatus === "submitted" ||
                      order.attemptStatus === "submitted_by_timeout"
                        ? "Lihat hasil"
                        : "Buka sesi"}
                    </Link>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

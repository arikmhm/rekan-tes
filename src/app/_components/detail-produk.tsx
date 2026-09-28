import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { ACCESS_DAYS, getPublishedTest, JENIS } from "@/lib/produk";
import { formatDuration, formatPrice } from "@/lib/format";

import { CheckoutButton } from "./checkout-button";

const hairline = "border-[#105C78]/20";

type Tes = NonNullable<Awaited<ReturnType<typeof getPublishedTest>>>;

export function DetailProduk({
  tes,
  kembali,
  tautanGratis = false,
}: {
  tes: Tes;
  kembali: { href: string; teks: string };
  /** Dimatikan di ruang peserta agar tidak keluar dari kerangkanya. */
  tautanGratis?: boolean;
}) {
  return (
    <>
      <Link
        href={kembali.href}
        className="group inline-flex items-center gap-2 text-sm font-normal text-brand/70 transition-colors hover:text-brand-orange"
      >
        <ArrowLeft
          className="size-4 transition-transform group-hover:-translate-x-1"
          aria-hidden
        />
        {kembali.teks}
      </Link>

      <div className="mt-6">
        <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-brand/70">
          {JENIS.simulasi.label}
        </span>

        <h1 className="mt-4 max-w-3xl text-3xl leading-tight font-medium tracking-[-0.01em] text-brand sm:text-4xl">
          {tes.name}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 font-normal text-brand/80">
          {tes.description}
        </p>
      </div>

      <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_21rem] lg:items-start">
        <div className="lg:order-first">
          <h2 className="text-lg font-medium text-brand">
            Urutan subtes
          </h2>
          <p className="mt-1 text-sm font-normal text-brand/60">
            Dikerjakan berurutan, masing-masing berwaktu.
          </p>

          <ol className="mt-4 space-y-3">
            {tes.subtests.map((s) => (
              <li
                key={s.id}
                className={`rounded-2xl border ${hairline} bg-white p-5`}
              >
                <div className="flex flex-wrap items-start gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand font-mono text-xs font-medium text-white">
                    {String(s.position).padStart(2, "0")}
                  </span>
                  <div className="min-w-45 flex-1">
                    <p className="font-medium text-brand">{s.name}</p>
                    {s.description && (
                      <p className="mt-1 text-sm leading-6 font-normal text-brand/60">
                        {s.description}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm font-normal text-brand/60">
                    {s.questionLimit} soal <span aria-hidden>·</span>{" "}
                    {formatDuration(s.durationSeconds)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside
          className={`order-first rounded-2xl border ${hairline} bg-white p-6 sm:p-7 lg:order-none lg:sticky lg:top-8`}
        >
          <p className="text-3xl font-medium text-brand-orange">
            {formatPrice(tes.priceAmount)}
          </p>

          <dl className={`mt-5 space-y-2.5 border-t ${hairline} pt-5 text-sm`}>
            {[
              ["Total soal", `${tes.questionCount} soal`],
              ["Total durasi", formatDuration(tes.durationSeconds)],
              ["Masa akses", `${ACCESS_DAYS} hari`],
            ].map(([label, nilai]) => (
              <div key={label} className="flex items-center justify-between">
                <dt className="font-normal text-brand/60">{label}</dt>
                <dd className="font-medium text-brand">{nilai}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6">
            <CheckoutButton slug={tes.slug} />
          </div>

          {tautanGratis && (
            <Link
              href="/simulasi"
              className={`group mt-5 flex items-center justify-between gap-2 border-t ${hairline} pt-5 text-sm font-normal text-brand transition-colors hover:text-brand-orange`}
            >
              Coba 10 soal gratis dulu
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          )}

          <p className="mt-5 text-xs leading-5 font-normal text-brand/50">
            Dengan membeli kamu menyetujui{" "}
            <Link className="underline hover:text-brand-orange" href="/syarat">
              syarat layanan
            </Link>
            ,{" "}
            <Link className="underline hover:text-brand-orange" href="/refund">
              kebijakan refund
            </Link>
            , dan{" "}
            <Link className="underline hover:text-brand-orange" href="/privasi">
              kebijakan privasi
            </Link>
            .
          </p>
        </aside>
      </div>
    </>
  );
}

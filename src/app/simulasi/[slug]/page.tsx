import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteShell } from "../../_components/site-shell";
import { TombolMulai } from "../../_components/tombol-mulai";
import { getPaket, isiPerSubtes, paketSimulasi } from "../data";

export function generateStaticParams() {
  return paketSimulasi.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const paket = getPaket((await params).slug);
  if (!paket) return { title: "Simulasi tidak ditemukan" };

  return {
    title: `${paket.nama} · Simulasi gratis`,
    description: paket.ringkas,
  };
}

const hairline = "border-[#105C78]/20";

export default async function SimulasiDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const paket = getPaket((await params).slug);

  if (!paket) {
    notFound();
  }

  const menit = Math.round(paket.durasiDetik / 60);
  const isi = isiPerSubtes(paket);

  return (
    <SiteShell>
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="relative mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
          <Link
            href="/simulasi"
            className="group inline-flex items-center gap-2 text-sm font-normal text-brand/70 transition-colors hover:text-brand-orange"
          >
            <ArrowLeft
              className="size-4 transition-transform group-hover:-translate-x-1"
              aria-hidden
            />
            Semua simulasi gratis
          </Link>

          <div className="mt-6">
            <h1 className="max-w-3xl text-3xl leading-tight font-medium tracking-[-0.01em] text-brand sm:text-4xl">
              {paket.nama}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 font-normal text-brand/80">
              {paket.ringkas}
            </p>
          </div>

          <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_21rem] lg:items-start">
            <div className="lg:order-first">
              <h2 className="text-lg font-medium text-brand">Isi paket</h2>
              <p className="mt-1 text-sm font-normal text-brand/60">
                Satu hitung mundur untuk semua soal; nomor bebas dilompati.
              </p>

              <ol className="mt-4 space-y-3">
                {isi.map((bagian, i) => (
                  <li
                    key={bagian.nama}
                    className={`flex flex-wrap items-center gap-4 rounded-2xl border ${hairline} bg-white p-5`}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand font-mono text-xs font-medium text-white">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="min-w-45 flex-1 font-medium text-brand">
                      {bagian.nama}
                    </p>
                    <p className="shrink-0 text-sm font-normal text-brand/60">
                      {bagian.jumlah} soal
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <aside
              className={`order-first rounded-2xl border ${hairline} bg-white p-6 sm:p-7 lg:order-none lg:sticky lg:top-8`}
            >
              <p className="text-3xl font-medium text-brand-orange">Gratis</p>

              <dl
                className={`mt-5 space-y-2.5 border-t ${hairline} pt-5 text-sm`}
              >
                {[
                  ["Jumlah soal", `${paket.soal.length} soal`],
                  ["Durasi", `${menit} menit`],
                ].map(([label, nilai]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4"
                  >
                    <dt className="font-normal text-brand/60">{label}</dt>
                    <dd className="text-right font-medium text-brand">
                      {nilai}
                    </dd>
                  </div>
                ))}
              </dl>

              <TombolMulai
                href={`/simulasi/${paket.slug}/mulai`}
                jumlahSoal={paket.soal.length}
                menit={menit}
              />
              <p
                className={`mt-5 border-t ${hairline} pt-5 text-xs leading-5 font-normal text-brand/60`}
              >
                Hasilnya tidak disimpan. Untuk riwayat hasil, pilih{" "}
                <Link
                  href="/produk"
                  className="font-medium text-brand underline transition-colors hover:text-brand-orange"
                >
                  simulasi berbayar
                </Link>
                .
              </p>
            </aside>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[url('/patterns/endless-constellation.svg')] bg-repeat opacity-[0.07] mask-[linear-gradient(to_top,black,transparent)]"
        />
      </div>
    </SiteShell>
  );
}

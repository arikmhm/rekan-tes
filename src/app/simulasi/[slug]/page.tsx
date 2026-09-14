import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Clock,
  FileText,
  Gauge,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteShell } from "../../_components/site-shell";
import { getPaket, isiPerSubtes, paketSimulasi } from "../data";

// Paketnya statis dan sedikit, jadi seluruh rutenya bisa disiapkan saat build:
// halaman ini tidak pernah menyentuh basis data.
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

  const yangDidapat = [
    {
      Ikon: Clock,
      judul: "Waktu berjalan",
      isi: `Hitung mundur ${menit} menit untuk seluruh paket, sama seperti tes sungguhan.`,
    },
    {
      Ikon: Gauge,
      judul: "Peta kecepatan",
      isi: "Tiap soal dinilai dua sumbu sekaligus: benar-salah dan cepat-lambat.",
    },
    {
      Ikon: ClipboardList,
      judul: "Pembahasan tiap soal",
      isi: "Kunci jawaban dan langkah pengerjaannya terbuka begitu sesi dikirim.",
    },
  ];

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
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
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-orange/12 px-3 py-1.5 text-xs font-medium text-brand-orange">
            <Sparkles className="size-3.5" aria-hidden />
            Gratis, tanpa daftar
          </span>

          <h1 className="mt-5 max-w-3xl text-4xl leading-[1.15] font-medium tracking-[-0.01em] text-brand sm:text-5xl">
            {paket.nama}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 font-normal text-brand/80">
            {paket.ringkas}
          </p>
        </div>

        {/* Kartu mulai diletakkan lebih dulu di layar sempit supaya tombolnya
            tidak terkubur di bawah rincian isi paket. */}
        <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_21rem] lg:items-start">
          <div className="lg:order-first">
            <ul className="grid gap-3 sm:grid-cols-3">
              {yangDidapat.map(({ Ikon, judul, isi }) => (
                <li
                  key={judul}
                  className={`rounded-2xl border ${hairline} bg-white p-5`}
                >
                  <Ikon className="size-5 text-brand-orange" aria-hidden />
                  <p className="mt-3 text-sm font-medium text-brand">{judul}</p>
                  <p className="mt-1.5 text-xs leading-5 font-normal text-brand/60">
                    {isi}
                  </p>
                </li>
              ))}
            </ul>

            <h2 className="mt-12 text-2xl font-medium tracking-[-0.01em] text-brand">
              Isi paket
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 font-normal text-brand/60">
              Semua soal berada dalam satu sesi dengan satu hitung mundur. Nomor
              soal bebas dilompati, dan jawaban bisa diubah selama waktunya
              belum habis.
            </p>

            <ol className="mt-6 space-y-3">
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
            <p className="mt-1 text-xs font-normal text-brand/50">
              tanpa akun, tanpa batas percobaan
            </p>

            <dl
              className={`mt-5 space-y-2.5 border-t ${hairline} pt-5 text-sm`}
            >
              {[
                ["Jumlah soal", `${paket.soal.length} soal`],
                ["Durasi", `${menit} menit`],
                ["Hasil", "langsung setelah dikirim"],
              ].map(([label, nilai]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4"
                >
                  <dt className="font-normal text-brand/60">{label}</dt>
                  <dd className="text-right font-medium text-brand">{nilai}</dd>
                </div>
              ))}
            </dl>

            <Link
              href={`/simulasi/${paket.slug}/mulai`}
              className="group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
            >
              Mulai sekarang
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
            <p className="mt-3 text-center text-xs leading-5 font-normal text-brand/50">
              Waktu mulai berjalan begitu halaman pengerjaan terbuka.
            </p>

            <p className="mt-5 flex items-start gap-2 border-t border-[#105C78]/20 pt-5 text-xs leading-5 font-normal text-brand/60">
              <FileText
                className="mt-0.5 size-4 shrink-0 text-brand/40"
                aria-hidden
              />
              Jawaban dan skornya tidak disimpan ke mana pun. Untuk riwayat
              hasil yang tersimpan, pilih simulasi di{" "}
              <Link
                href="/tes"
                className="font-medium text-brand underline transition-colors hover:text-brand-orange"
              >
                katalog
              </Link>
              .
            </p>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}

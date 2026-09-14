import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Clock,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ACCESS_DAYS, getPublishedTest, JENIS } from "@/lib/catalog";
import { formatDuration, formatPrice } from "@/lib/format";

import { CheckoutButton } from "../../_components/checkout-button";
import { SiteShell } from "../../_components/site-shell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const tes = await getPublishedTest((await params).slug);
  if (!tes) return { title: "Tes tidak ditemukan" };

  return { title: tes.name, description: tes.description };
}

const hairline = "border-[#105C78]/20";

export default async function TesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const tes = await getPublishedTest((await params).slug);

  if (!tes) {
    notFound();
  }

  // Dipakai sebagai pembanding panjang bilah durasi tiap subtes, sehingga
  // pengunjung melihat subtes mana yang paling menyita waktu tanpa membandingkan
  // angka satu per satu.
  const durasiTerpanjang = Math.max(
    ...tes.subtests.map((s) => s.durationSeconds),
    1,
  );

  const yangDidapat = [
    {
      Ikon: Clock,
      judul: "Waktu berjalan per subtes",
      isi: "Hitung mundur dan penutupan otomatis persis seperti tes sungguhan.",
    },
    {
      Ikon: ClipboardList,
      judul: "Skor dan pembahasan",
      isi: "Selesai mengerjakan, skor per subtes dan kunci tiap soal langsung terbuka.",
    },
    {
      Ikon: CalendarClock,
      judul: `Akses ${ACCESS_DAYS} hari`,
      isi: "Beli sekarang, kerjakan saat kamu siap dalam masa akses itu.",
    },
  ];

  return (
    <SiteShell>
      <div className="relative overflow-hidden">
        {/* Pola yang sama dengan katalog, hanya di kepala halaman lalu lenyap. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[url('/patterns/jigsaw.svg')] bg-repeat opacity-[0.04] mask-[linear-gradient(to_bottom,black,transparent)]"
        />

        <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <Link
            href="/tes"
            className="group inline-flex items-center gap-2 text-sm font-normal text-brand/70 transition-colors hover:text-brand-orange"
          >
            <ArrowLeft
              className="size-4 transition-transform group-hover:-translate-x-1"
              aria-hidden
            />
            Semua produk
          </Link>

          <div className="mt-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-orange/12 px-3 py-1.5 text-xs font-medium text-brand-orange">
              <span
                className="size-1.5 rounded-full bg-brand-orange"
                aria-hidden
              />
              {JENIS.simulasi.label} · {tes.subtests.length} subtes ·{" "}
              {tes.questionCount} soal · {formatDuration(tes.durationSeconds)}
            </span>

            <h1 className="mt-5 max-w-3xl text-4xl leading-[1.15] font-medium tracking-[-0.01em] text-brand sm:text-5xl">
              {tes.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 font-normal text-brand/80">
              {tes.description}
            </p>
          </div>

          {/* Kartu beli diletakkan lebih dulu di layar sempit supaya harga dan
            tombolnya tidak terkubur di bawah daftar subtes. */}
          <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_21rem] lg:items-start">
            <div className="lg:order-first">
              <ul className="grid gap-3 sm:grid-cols-3">
                {yangDidapat.map(({ Ikon, judul, isi }) => (
                  <li
                    key={judul}
                    className={`rounded-2xl border ${hairline} bg-white p-5`}
                  >
                    <Ikon className="size-5 text-brand-orange" aria-hidden />
                    <p className="mt-3 text-sm font-medium text-brand">
                      {judul}
                    </p>
                    <p className="mt-1.5 text-xs leading-5 font-normal text-brand/60">
                      {isi}
                    </p>
                  </li>
                ))}
              </ul>

              <h2 className="mt-12 text-2xl font-medium tracking-[-0.01em] text-brand">
                Urutan subtes
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 font-normal text-brand/60">
                Subtes dikerjakan berurutan. Setiap subtes memiliki batas waktu
                sendiri dan tidak dapat dibuka kembali setelah dikumpulkan.
              </p>

              <ol className="mt-6 space-y-3">
                {tes.subtests.map((s) => (
                  <li
                    key={s.id}
                    className={`rounded-2xl border ${hairline} bg-white p-5 transition-colors hover:border-brand-orange`}
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

                    {/* Bilah sebanding durasi: subtes terpanjang jadi acuan penuh,
                      jadi porsi waktu tiap bagian terbaca sekilas. */}
                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-brand/10">
                      <div
                        className="h-full rounded-full bg-brand-orange/70"
                        style={{
                          width: `${(s.durationSeconds / durasiTerpanjang) * 100}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Kartu beli menempel saat daftar subtes digulir: harga dan tombolnya
              tidak perlu dicari lagi setelah pengunjung selesai membaca. */}
            <aside
              className={`order-first rounded-2xl border ${hairline} bg-white p-6 sm:p-7 lg:order-none lg:sticky lg:top-8`}
            >
              <p className="text-3xl font-medium text-brand-orange">
                {formatPrice(tes.priceAmount)}
              </p>
              <p className="mt-1 text-xs font-normal text-brand/50">
                sekali bayar untuk satu kali pengerjaan
              </p>

              <dl
                className={`mt-5 space-y-2.5 border-t ${hairline} pt-5 text-sm`}
              >
                {[
                  ["Total soal", `${tes.questionCount} soal`],
                  ["Total durasi", formatDuration(tes.durationSeconds)],
                  ["Masa akses", `${ACCESS_DAYS} hari`],
                ].map(([label, nilai]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <dt className="font-normal text-brand/60">{label}</dt>
                    <dd className="font-medium text-brand">{nilai}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6">
                <CheckoutButton slug={tes.slug} />
              </div>

              <p className="mt-4 flex items-start gap-2 text-xs leading-5 font-normal text-brand/60">
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0 text-brand/40"
                  aria-hidden
                />
                Pembayaran QRIS: kodenya muncul di halaman pesanan dan bisa
                dipindai dari aplikasi bank atau dompet digital mana pun.
              </p>

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

              <p className="mt-5 text-xs leading-5 font-normal text-brand/50">
                Dengan membeli kamu menyetujui{" "}
                <Link
                  className="underline hover:text-brand-orange"
                  href="/syarat"
                >
                  syarat layanan
                </Link>
                ,{" "}
                <Link
                  className="underline hover:text-brand-orange"
                  href="/refund"
                >
                  kebijakan refund
                </Link>
                , dan{" "}
                <Link
                  className="underline hover:text-brand-orange"
                  href="/privasi"
                >
                  kebijakan privasi
                </Link>
                .
              </p>
            </aside>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

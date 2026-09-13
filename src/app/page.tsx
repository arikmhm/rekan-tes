import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountNav } from "./_components/account-nav";
import { HeroPreview } from "./_components/hero-preview";
import { LegalLinks } from "./_components/site-shell";
import { getSession } from "@/lib/authz";

const materi = [
  { nama: "Numerik", uji: "Hitung cepat dan logika angka" },
  { nama: "Verbal", uji: "Sinonim, antonim, analogi kata" },
  { nama: "Logika & Figural", uji: "Pola dan penalaran visual" },
  { nama: "Ketelitian", uji: "Akurasi dan kecepatan mengoreksi" },
  { nama: "Bahasa Inggris", uji: "Grammar dan reading dasar" },
  { nama: "Pengetahuan Perbankan", uji: "Istilah dan konsep dasar bank" },
];

const steps = [
  {
    number: "01",
    title: "Pilih & bayar",
    description: "Cek subtes, harga, dan durasinya. Bayar pakai QRIS.",
  },
  {
    number: "02",
    title: "Kerjakan per subtes",
    description: "Waktunya jalan tiap subtes, mirip ujian asli.",
  },
  {
    number: "03",
    title: "Lihat hasil",
    description: "Cek skor dan ringkasan jawabanmu.",
  },
];

// Sinkron dengan ACCESS_DAYS di src/lib/catalog.ts. Ditulis literal supaya
// landing page tidak ikut mengimpor modul database.
const ACCESS_DAYS = 30;

const hairline = "border-[#105C78]/20";

export default async function Home() {
  // Landing page ini murni untuk pengunjung anonim. Yang sudah login diarahkan
  // ke halaman kerja mereka masing-masing, bukan disodori materi promosi lagi.
  const session = await getSession();
  if (session) {
    redirect(session.user.role === "admin" ? "/admin" : "/akun");
  }

  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#105C78]">
      <header className={`relative z-10 border-b ${hairline} bg-white`}>
        <nav
          aria-label="Navigasi utama"
          className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8"
        >
          <a href="#top" className="flex items-center gap-3 font-semibold tracking-tight transition-opacity hover:opacity-70">
            <span className="grid size-9 place-items-center rounded-[4px] bg-[#105C78] text-sm font-bold text-white">
              RT
            </span>
            <span className="text-lg">Rekan Tes</span>
          </a>
          <div className="flex items-center gap-3 text-sm font-normal text-[#105C78] sm:gap-7">
            <Link className="transition hover:text-[#F68B1F]" href="/tes">
              Katalog
            </Link>
            <a className="hidden transition hover:text-[#F68B1F] sm:inline" href="#cara-kerja">
              Cara kerja
            </a>
            <a className="hidden transition hover:text-[#F68B1F] sm:inline" href="#materi">
              Materi
            </a>
            <AccountNav />
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="mx-auto flex max-w-3xl flex-col items-center px-5 py-20 text-center sm:px-8 sm:py-28">
          <h1 className="max-w-xl text-4xl leading-[1.2] font-medium tracking-[-0.01em] text-[#105C78] sm:text-5xl lg:text-[52px]">
            Setiap Kesempatan Layak Dipersiapkan.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 font-normal text-[#105C78]/80">
            Persiapkan dirimu untuk kesempatan yang kamu tunggu.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              className="group flex h-12 items-center justify-center gap-2 rounded-[4px] bg-[#105C78] px-6 text-center text-sm font-normal text-white transition-all hover:-translate-y-0.5 hover:bg-[#F68B1F] active:translate-y-0"
              href="/tes"
            >
              Lihat katalog simulasi
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link
              className={`flex h-12 items-center justify-center rounded-[4px] border ${hairline} bg-white px-6 text-center text-sm font-normal text-[#105C78] transition-all hover:-translate-y-0.5 hover:bg-[#105C78] hover:text-white active:translate-y-0`}
              href="/daftar"
            >
              Buat akun gratis
            </Link>
          </div>
        </section>

        {/* Tangkapan layar ilustratif produk, biar kelihatan beneran seperti apa,
            bukan cuma diceritakan. Tab subtesnya sungguhan bisa diklik. Slot ini
            bisa diganti video simulasi yang looping begitu asetnya tersedia. */}
        <div className="mx-auto max-w-xl px-5 pb-24 sm:px-8 sm:pb-32">
          <HeroPreview />
          <p className="mt-8 text-center text-xs leading-5 font-normal text-[#105C78]/50">
            Ilustrasi tampilan, bukan soal ujian resmi.
          </p>
        </div>

        <div className={`border-y ${hairline} bg-[#105C78]/5`}>
          <div className="mx-auto flex max-w-6xl flex-wrap justify-center divide-x divide-[#105C78]/20 px-5 py-4 text-sm font-normal text-[#105C78]/80 sm:px-8">
            <span className="px-4 first:pl-0 last:pr-0">QRIS instan</span>
            <span className="px-4 first:pl-0 last:pr-0">Timer tiap subtes</span>
            <span className="px-4 first:pl-0 last:pr-0">Akses {ACCESS_DAYS} hari</span>
            <span className="px-4 first:pl-0 last:pr-0">Email terverifikasi</span>
          </div>
        </div>

        <section id="cara-kerja" className={`border-b ${hairline} bg-white`}>
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <h2 className="max-w-2xl text-3xl font-medium tracking-[-0.01em] text-[#105C78] sm:text-4xl">
              Alurnya cuma tiga langkah.
            </h2>
            <div className={`mt-10 grid gap-px overflow-hidden rounded-[6px] border ${hairline} bg-[#105C78]/20 md:grid-cols-3`}>
              {steps.map((step) => (
                <article key={step.number} className="bg-white p-7 sm:p-8">
                  <p className="font-mono text-3xl font-medium text-[#F68B1F]">{step.number}</p>
                  <h3 className="mt-6 text-xl font-medium text-[#105C78]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 font-normal text-[#105C78]/70">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="materi" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <h2 className="max-w-2xl text-3xl font-medium tracking-[-0.01em] text-[#105C78] sm:text-4xl">
            Yang sering diuji saat seleksi kerja bank.
          </h2>
          <div className={`mt-10 overflow-hidden rounded-[6px] border ${hairline}`}>
            {materi.map((m, i) => (
              <div
                key={m.nama}
                className={`flex flex-col justify-between gap-1 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 ${
                  i > 0 ? `border-t ${hairline}` : ""
                }`}
              >
                <p className="font-medium text-[#105C78]">{m.nama}</p>
                <p className="text-sm font-normal text-[#105C78]/60">{m.uji}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="status" className="px-5 pb-16 sm:px-8 sm:pb-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 overflow-hidden rounded-[6px] bg-[#105C78] px-7 py-10 text-white sm:px-10 sm:py-12">
            <h2 className="text-3xl font-medium tracking-[-0.01em]">Katalog & pembayaran aktif sekarang.</h2>
            <p className="max-w-2xl text-sm leading-6 font-normal text-white/80">
              Daftar, pilih simulasi, dan bayar QRIS: semua sudah bisa. Halaman pengerjaan soal masih kami siapkan.
            </p>
          </div>
        </section>
      </main>

      <footer className={`border-t ${hairline} bg-white`}>
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-xs leading-5 font-normal text-[#105C78]/60 sm:px-8">
          <LegalLinks />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Rekan Tes. Platform simulasi independen.</p>
            <p>Fokus kami sekarang: simulasi tes masuk kerja di bank.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

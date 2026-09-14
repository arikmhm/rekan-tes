import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountNav } from "./_components/account-nav";
import { HeroPreview } from "./_components/hero-preview";
import { PhoneChat } from "./_components/phone-chat";
import { TestPreview } from "./_components/test-preview";
import { LegalLinks } from "./_components/site-shell";
import { getSession } from "@/lib/authz";

const langkah = [
  {
    judul: "Pilih simulasi",
    isi: "Katalog berisi simulasi tes masuk bank beserta rincian subtes, jumlah soal, dan durasinya.",
  },
  {
    judul: "Bayar sekali lewat QRIS",
    isi: "Sekali bayar untuk satu simulasi. Akses pengerjaan aktif begitu pembayaran terkonfirmasi.",
  },
  {
    judul: "Kerjakan, lalu baca pembahasan",
    isi: "Waktu berjalan per subtes seperti tes sungguhan. Selesai mengerjakan, skor dan kunci tiap soal langsung terbuka.",
  },
];

const hairline = "border-[#105C78]/20";

export default async function Home() {
  // Landing page ini murni untuk pengunjung anonim. Yang sudah login diarahkan
  // ke halaman kerja mereka masing-masing, bukan disodori materi promosi lagi.
  const session = await getSession();
  if (session) {
    redirect(session.user.role === "admin" ? "/admin" : "/akun");
  }

  return (
    <div className="min-h-screen bg-white text-brand">
      <header className={`relative z-10 border-b ${hairline} bg-white`}>
        <nav
          aria-label="Navigasi utama"
          className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8"
        >
          <a
            href="#top"
            className="flex items-center gap-3 font-semibold tracking-tight transition-opacity hover:opacity-70"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
              RT
            </span>
            <span className="text-lg">Rekan Tes</span>
          </a>
          <div className="flex items-center gap-3 text-sm font-normal text-brand sm:gap-7">
            <Link className="transition hover:text-brand-orange" href="/tes">
              Katalog
            </Link>
            <a
              className="hidden transition hover:text-brand-orange sm:inline"
              href="#mulai"
            >
              Mulai
            </a>
            <a
              className="hidden transition hover:text-brand-orange sm:inline"
              href="#coba"
            >
              Coba gratis
            </a>
            <AccountNav />
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-16 text-center sm:px-8 sm:py-20">
          <h1 className="max-w-xl text-4xl leading-[1.2] font-medium tracking-[-0.01em] text-brand sm:text-5xl lg:text-[52px]">
            Setiap Kesempatan Layak Dipersiapkan.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 font-normal text-brand/80">
            Persiapkan dirimu untuk kesempatan yang kamu tunggu.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              className="group flex h-12 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-center text-sm font-normal text-white transition-all  hover:bg-brand-orange active:translate-y-0"
              href="/tes"
            >
              Lihat katalog simulasi
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
            <Link
              className={`flex h-12 items-center justify-center rounded-lg border ${hairline} bg-white px-6 text-center text-sm font-normal text-brand transition-all  hover:bg-brand hover:text-white active:translate-y-0`}
              href="/daftar"
            >
              Buat akun gratis
            </Link>
          </div>
        </section>

        {/* Tangkapan layar ilustratif produk, biar kelihatan beneran seperti apa,
            bukan cuma diceritakan. Tab subtesnya sungguhan bisa diklik. Slot ini
            bisa diganti video simulasi yang looping begitu asetnya tersedia. */}
        <div className="mx-auto w-full max-w-xl px-5 pb-16 sm:px-8 sm:pb-20">
          <HeroPreview />
        </div>

        <section
          id="mulai"
          className={`border-b ${hairline} bg-white px-5 pt-16 sm:px-8 sm:pt-20`}
        >
          <div className="mx-auto max-w-6xl bg-brand-orange/80 px-5 pt-16 sm:pt-8 sm:px-8 rounded-t-2xl sm:rounded-t-xl">
            <h2 className="mx-auto max-w-xl text-center text-3xl font-medium tracking-[-0.01em] text-white sm:text-4xl">
              Bingung Harus Mulai dari Mana?
            </h2>
            <div className="mt-8 flex justify-center">
              <PhoneChat />
            </div>
          </div>
        </section>

        <section id="coba" className="mx-auto max-w-6xl py-16  sm:py-24">
          <TestPreview />
        </section>

        {/* Penutup halaman: alurnya dulu, baru ajakan. Pengunjung yang sudah
            mencoba simulasi di atas tinggal perlu tahu langkah setelahnya. */}
        <section id="cara-kerja" className="px-5 pb-16 sm:px-8 sm:pb-24">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[6px] bg-brand px-7 py-10 text-white sm:px-10 sm:py-14">
            <h2 className="max-w-xl text-3xl font-medium tracking-[-0.01em] sm:text-4xl">
              Bayar sekali per simulasi, kerjakan saat kamu siap.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 font-normal text-white/80">
              Tanpa langganan dan tanpa paket tahunan. Tiga langkah dari memilih
              simulasi sampai membaca pembahasan tiap soal.
            </p>

            <ol className="mt-10 grid gap-px overflow-hidden rounded-[6px] bg-white/15 sm:grid-cols-3">
              {langkah.map((l, i) => (
                <li key={l.judul} className="bg-brand p-6 sm:p-7">
                  <span className="font-mono text-xs font-medium text-brand-orange">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-3 font-medium">{l.judul}</p>
                  <p className="mt-2 text-sm leading-6 font-normal text-white/70">
                    {l.isi}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                className="group flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-normal text-brand transition-colors hover:bg-brand-orange hover:text-white"
                href="/tes"
              >
                Lihat katalog simulasi
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
              <Link
                className="flex h-12 items-center justify-center rounded-lg border border-white/30 px-6 text-sm font-normal text-white transition-colors hover:bg-white hover:text-brand"
                href="/daftar"
              >
                Buat akun gratis
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={`border-t ${hairline} bg-white`}>
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-xs leading-5 font-normal text-brand/60 sm:px-8">
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

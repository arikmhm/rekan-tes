import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PhoneChat } from "./_components/phone-chat";
import { SiteFooter, SiteHeader } from "./_components/site-shell";
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
      <SiteHeader />

      <main id="top">
        <section className="relative overflow-hidden">
          {/* Pola rasi bintang di latar hero. Opasitasnya sengaja sangat rendah
              dan dilebur ke bawah, jadi ia memberi tekstur tanpa ikut bersaing
              dengan judul maupun tombol di atasnya. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[url('/patterns/endless-constellation.svg')] bg-repeat opacity-[0.09] mask-[linear-gradient(to_bottom,black,transparent)]"
          />

          <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-16 text-center sm:px-8 sm:py-20">
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
          </div>
        </section>

        {/* Rekaman sesi pengerjaan sebagai gambar produk: berjalan sendiri,
            mengulang, tanpa suara, dan tidak menerima klik sama sekali — ini
            gambar yang bergerak, bukan pemutar video yang perlu dilayani. */}
        <div className="mx-auto w-full max-w-6xl pb-16 px-5 sm:px-0 md:px-0 sm:pb-20">
          <video
            src="/hero.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden
            tabIndex={-1}
            className={`pointer-events-none w-full rounded-lg border ${hairline} bg-cream`}
          />
        </div>
        <section id="mulai" className={` bg-white px-5  sm:px-8`}>
          <div className="mx-auto max-w-6xl bg-brand-orange/80 px-5 pt-16 sm:pt-24 sm:px-8 rounded-t-2xl sm:rounded-t-2xl">
            <h2 className="mx-auto max-w-xl text-center text-3xl font-medium tracking-[-0.01em] text-white sm:text-4xl">
              Bingung Harus Mulai dari Mana?
            </h2>
            <div className="mt-8 flex justify-center">
              <PhoneChat />
            </div>
          </div>
        </section>
        {/* Simulasi percobaannya sendiri tinggal di /simulasi. Menanamkannya di
            sini berarti setiap pengunjung beranda ikut mengunduh mesin kuisnya,
            padahal cuma sebagian yang benar-benar mencoba. */}
        <section id="coba" className="bg-gray-50 px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="max-w-lg text-3xl leading-tight font-medium tracking-[-0.01em] text-brand sm:text-4xl">
                Coba simulasinya sekarang — tanpa daftar.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 font-normal text-brand/70">
                Kerjakan paket contoh sampai selesai, lalu lihat skor, peta
                kecepatan tiap soal, dan pembahasan jawabannya.
              </p>
            </div>
            <Link
              className="group flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
              href="/simulasi"
            >
              Mulai simulasi gratis
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </section>

        {/* Penutup halaman: alurnya dulu, baru ajakan. Pengunjung yang sudah
            mencoba simulasi di atas tinggal perlu tahu langkah setelahnya. */}
        <section
          id="cara-kerja"
          className="relative overflow-hidden px-5 py-16 sm:px-8 sm:pb-24"
        >
          {/* Pola yang sama dengan hero, kali ini menutup halaman: ia menebal ke
              bawah sehingga kaki halaman tidak berakhir sebagai putih kosong. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-[url('/patterns/endless-constellation.svg')] bg-repeat opacity-[0.09] mask-[linear-gradient(to_top,black,transparent)]"
          />

          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-brand px-7 py-10 text-white sm:px-10 sm:py-14">
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

      <SiteFooter />
    </div>
  );
}

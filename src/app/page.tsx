import Link from "next/link";

import { AccountNav } from "./_components/account-nav";
import { LegalLinks } from "./_components/site-shell";

const categories = [
  "Numerik",
  "Verbal",
  "Logika & Figural",
  "Ketelitian",
  "Bahasa Inggris",
  "Pengetahuan Perbankan",
];

const steps = [
  {
    number: "01",
    title: "Pilih simulasi",
    description: "Lihat cakupan subtes, jumlah soal, durasi, dan harga sebelum membeli.",
  },
  {
    number: "02",
    title: "Kerjakan per subtes",
    description: "Ikuti urutan dan batas waktu seperti kondisi tes yang sebenarnya.",
  },
  {
    number: "03",
    title: "Pelajari hasil",
    description: "Tinjau skor, statistik jawaban, kunci, dan pembahasan setiap soal.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-ink">
      <header className="relative z-10 border-b border-black/8 bg-background/90">
        <nav
          aria-label="Navigasi utama"
          className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8"
        >
          <a href="#top" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-brand text-sm font-bold text-white">
              RT
            </span>
            <span className="text-lg">Rekan Tes</span>
          </a>
          <div className="hidden items-center gap-7 text-sm text-muted-foreground sm:flex">
            <Link className="transition hover:text-ink" href="/tes">
              Katalog
            </Link>
            <a className="transition hover:text-ink" href="#cara-kerja">
              Cara kerja
            </a>
            <a className="transition hover:text-ink" href="#cakupan">
              Cakupan tes
            </a>
            <AccountNav />
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="relative mx-auto grid max-w-6xl gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-28">
          {/* Dekoratif: harus tidak pernah menerima klik. Tanpa
              `pointer-events-none`, lingkaran ini menutupi navigasi kanan atas. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-48 -top-36 -z-0 size-[520px] rounded-full bg-mint/70 blur-3xl"
          />
          <div className="relative z-10">
            <p className="mb-5 inline-flex rounded-full border border-brand/15 bg-mint px-4 py-2 text-xs font-bold tracking-[0.16em] text-brand-dark uppercase">
              Simulasi tes kerja perbankan
            </p>
            <h1 className="max-w-3xl text-5xl leading-[1.03] font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Lebih siap sebelum hari tes tiba.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Latihan terstruktur dengan batas waktu, progres tersimpan, serta hasil dan pembahasan yang membantu menemukan area terlemahmu.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                className="rounded-full bg-brand px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-dark"
                href="/tes"
              >
                Lihat katalog simulasi
              </Link>
              <a
                className="rounded-full border border-black/10 bg-white px-6 py-3.5 text-center text-sm font-bold transition hover:border-brand/30"
                href="#cara-kerja"
              >
                Pelajari cara kerja
              </a>
            </div>
            <p className="mt-6 max-w-xl text-xs leading-5 text-muted-foreground">
              Rekan Tes adalah platform latihan independen, bukan penyelenggara atau mitra resmi rekrutmen bank. Pembayaran hanya untuk sesi simulasi dan tidak menjamin kelulusan.
            </p>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 -z-10 rotate-2 rounded-[2rem] bg-brand/10" />
            <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-2xl shadow-black/8 sm:p-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-brand uppercase">
                    Produk pertama
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Core Aptitude Perbankan
                  </h2>
                </div>
                <span className="rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  Segera hadir
                </span>
              </div>
              <div className="my-7 h-px bg-black/8" />
              <dl className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-cream p-4">
                  <dt className="text-xs text-muted-foreground">Model sesi</dt>
                  <dd className="mt-1 font-semibold">Sekali beli</dd>
                </div>
                <div className="rounded-2xl bg-cream p-4">
                  <dt className="text-xs text-muted-foreground">Format soal</dt>
                  <dd className="mt-1 font-semibold">Pilihan ganda</dd>
                </div>
                <div className="rounded-2xl bg-cream p-4">
                  <dt className="text-xs text-muted-foreground">Pengerjaan</dt>
                  <dd className="mt-1 font-semibold">Timer per subtes</dd>
                </div>
                <div className="rounded-2xl bg-cream p-4">
                  <dt className="text-xs text-muted-foreground">Setelah tes</dt>
                  <dd className="mt-1 font-semibold">Hasil & bahasan</dd>
                </div>
              </dl>
              <div className="mt-7 rounded-2xl border border-brand/15 bg-mint/60 p-4 text-sm leading-6 text-brand-dark">
                Harga, jumlah soal, dan durasi akan ditampilkan secara transparan sebelum checkout.
              </div>
            </div>
          </div>
        </section>

        <section id="cara-kerja" className="border-y border-black/8 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <p className="text-sm font-bold text-brand">Cara kerja</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Satu alur sederhana dari latihan sampai evaluasi.
            </h2>
            <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-black/8 bg-black/8 md:grid-cols-3">
              {steps.map((step) => (
                <article key={step.number} className="bg-white p-7 sm:p-8">
                  <p className="font-mono text-sm font-semibold text-brand">{step.number}</p>
                  <h3 className="mt-8 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="cakupan" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-sm font-bold text-brand">Fokus latihan MVP</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Kemampuan inti untuk seleksi perbankan.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground lg:justify-self-end">
              Setiap produk dapat menggabungkan beberapa subtes dengan urutan, durasi, jumlah soal, dan bobot yang berbeda.
            </p>
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <li
                key={category}
                className="flex items-center gap-4 rounded-2xl border border-black/8 bg-white px-5 py-5 font-semibold shadow-sm shadow-black/[0.02]"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mint font-mono text-xs text-brand-dark">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {category}
              </li>
            ))}
          </ul>
        </section>

        <section id="status" className="px-5 pb-16 sm:px-8 sm:pb-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-7 overflow-hidden rounded-[2rem] bg-brand-dark px-7 py-10 text-white sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-200">Status pengembangan</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">MVP sedang dibangun.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/75">
                Katalog dan akun sudah dapat dipakai. Pembayaran dan sesi pengerjaan belum dibuka, jadi halaman ini belum menerima transaksi.
              </p>
            </div>
            <span className="shrink-0 self-start rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold lg:self-auto">
              Belum menerima pembayaran
            </span>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/8 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-xs leading-5 text-muted-foreground sm:px-8">
          <LegalLinks />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Rekan Tes. Platform simulasi independen.</p>
            <p>Fokus awal: simulasi tes masuk kerja perbankan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

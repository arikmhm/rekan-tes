import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PhoneChat } from "./_components/phone-chat";
import { SiteFooter, SiteHeader } from "./_components/site-shell";
import { getSession } from "@/lib/authz";

/**
 * Tiga sorotan produk di section "coba". Gambarnya menyusul — lihat
 * BingkaiLayar untuk cara menukar penampung dengan tangkapan layar sungguhan.
 */
const sorotan = [
  {
    judul: "Rasanya seperti tes beneran",
    kalimat: "Waktu jalan terus, walau halamannya kamu tutup.",
    tanda: ["Timer per subtes", "Peta nomor soal", "Tersimpan otomatis"],
    gambar: { src: "/layar/simulasi.png", lebar: 1197, tinggi: 684 },
  },
  {
    judul: "Nilaimu bocor di mana? Kelihatan",
    kalimat: "Skor dan analisisnya keluar begitu kamu selesai.",
    tanda: ["Skor per subtes", "Peta jawaban", "Tempo pengerjaan"],
    gambar: { src: "/layar/analisis.png", lebar: 1119, tinggi: 582 },
  },
  {
    judul: "Salah pun ada penjelasannya",
    kalimat: "Kunci dan alasannya terbuka, bukan cuma skor.",
    tanda: ["Pembahasan tiap soal", "Kunci tiap opsi", "Bisa dibaca ulang"],
    gambar: { src: "/layar/pembahasan.png", lebar: 1112, tinggi: 600 },
  },
];

const hairline = "border-[#105C78]/20";

/**
 * Produk yang belum terbit. Gambarannya dibuat dari markup biasa, bukan
 * tangkapan layar, karena halamannya memang belum ada — menampilkan layar palsu
 * sama saja menjanjikan sesuatu yang belum bisa ditagih.
 */
const menyusul = [
  {
    judul: "Soal tes",
    isi: "Kumpulan soal beserta pembahasannya, dikerjakan sesuka tempomu.",
    Gambar: GambarSoal,
  },
  {
    judul: "Ebook",
    isi: "Bahan bacaan yang bisa diunduh dan dibaca kapan saja.",
    Gambar: GambarEbook,
  },
];

export default async function Home() {
  // Landing page ini murni untuk pengunjung anonim. Yang sudah login diarahkan
  // ke halaman kerja mereka masing-masing, bukan disodori materi promosi lagi.
  const session = await getSession();
  if (session) {
    redirect(session.user.role === "admin" ? "/admin" : "/peserta");
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
                href="/produk"
              >
                Lihat produk
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
        {/* <section id="mulai" className={` bg-white px-5  sm:px-8`}>
          <div className="mx-auto max-w-6xl bg-brand-orange/80 px-5 pt-16 sm:pt-24 sm:px-8 rounded-t-2xl sm:rounded-t-2xl">
            <h2 className="mx-auto max-w-xl text-center text-3xl font-medium tracking-[-0.01em] text-white sm:text-4xl">
              Bingung Harus Mulai dari Mana?
            </h2>
            <div className="mt-8 flex justify-center">
              <PhoneChat />
            </div>
          </div>
        </section> */}
        {/* Simulasi percobaannya sendiri tinggal di /simulasi. Menanamkannya di
            sini berarti setiap pengunjung beranda ikut mengunduh mesin kuisnya,
            padahal cuma sebagian yang benar-benar mencoba. */}
        {/* Warna latarnya sendiri: seksi ini memamerkan produknya, jadi ia
            perlu terbaca sebagai satu blok utuh di antara seksi putih. */}
        <section id="coba" className="bg-gray-50 px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <span className="text-xs font-medium tracking-wide text-brand-orange uppercase">
              Yang kamu dapat
            </span>
            <h2 className="mt-3 max-w-2xl text-3xl leading-tight font-medium tracking-[-0.01em] text-brand sm:text-4xl">
              Latihannya semirip mungkin dengan hari-H.
            </h2>

            {/* Gambar berganti sisi tiap blok supaya mata tidak membaca tiga
                susunan yang persis sama. */}
            <div className="mt-12 space-y-14 sm:mt-14 sm:space-y-20">
              {sorotan.map((s, i) => (
                <article
                  key={s.gambar.src}
                  className="grid items-end gap-x-10 gap-y-5 lg:grid-cols-12"
                >
                  <div
                    className={`lg:col-span-8 ${i % 2 === 1 ? "lg:order-2" : ""}`}
                  >
                    <BingkaiLayar gambar={s.gambar} alt={s.judul} />
                  </div>

                  <div
                    className={`lg:col-span-4 lg:pb-6 ${i % 2 === 1 ? "lg:order-1" : ""}`}
                  >
                    <h3 className="text-2xl leading-snug font-medium tracking-[-0.01em] text-brand">
                      {s.judul}
                    </h3>
                    <p className="mt-2 text-base leading-7 font-normal text-brand/70">
                      {s.kalimat}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {s.tanda.map((teks) => (
                        <li
                          key={teks}
                          className="rounded-full bg-white px-2.5 py-1 text-xs font-normal text-brand/70"
                        >
                          {teks}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>

            {/* Ajakan baru muncul setelah pengunjung melihat barangnya. */}
            <div
              className={`mt-14 flex flex-col items-start gap-5 border-t ${hairline} pt-10 sm:mt-20 sm:flex-row sm:items-center sm:justify-between`}
            >
              <p className="text-2xl font-medium tracking-[-0.01em] text-brand">
                Coba dulu, gratis.{" "}
                <span className="font-normal text-brand/60">
                  Sepuluh soal, tanpa daftar.
                </span>
              </p>
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
          </div>
        </section>

        {/* Penutup halaman: alurnya dulu, baru ajakan. Pengunjung yang sudah
            mencoba simulasi di atas tinggal perlu tahu langkah setelahnya. */}
        {/* Etalase singkat di kaki beranda: apa saja yang dijual, satu
            kalimat masing-masing. Rinciannya urusan halaman produk. */}
        <section
          id="produk"
          className="relative overflow-hidden px-5 py-16 sm:px-8 sm:pb-24"
        >
          {/* Pola yang sama dengan hero, kali ini menutup halaman: ia menebal ke
              bawah sehingga kaki halaman tidak berakhir sebagai putih kosong. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-[url('/patterns/endless-constellation.svg')] bg-repeat opacity-[0.09] mask-[linear-gradient(to_top,black,transparent)]"
          />

          <div className="relative mx-auto max-w-6xl">
            <h2 className="text-3xl leading-tight font-medium tracking-[-0.01em] text-brand sm:text-4xl">
              Produk
            </h2>
            <p className="mt-3 text-base leading-7 font-normal text-brand/70">
              Bayar sekali per produk. Tanpa langganan, tanpa paket tahunan.
            </p>

            <div className="mt-10 grid gap-4 lg:grid-cols-2 lg:grid-rows-2">
              {/* Simulasi memegang kartu besar: ia satu-satunya yang sudah
                  bisa dibeli hari ini. */}
              <article
                className={`flex flex-col justify-between overflow-hidden rounded-2xl border ${hairline} bg-white lg:row-span-2`}
              >
                <div className="-mr-10 mt-8 ml-8 overflow-hidden rounded-tl-xl border-t border-l border-brand/20 bg-cream/40 p-2 sm:-mr-12 sm:ml-10">
                  <Image
                    src="/layar/simulasi.png"
                    alt="Layar pengerjaan simulasi"
                    width={1197}
                    height={684}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className={`w-full rounded-tl-lg border-t border-l ${hairline}`}
                  />
                </div>

                <div className="p-7 sm:p-8">
                  <h3 className="text-xl font-medium tracking-[-0.01em] text-brand">
                    Simulasi tes
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-6 font-normal text-brand/70">
                    Dikerjakan berwaktu seperti tes aslinya. Skor dan
                    pembahasannya terbuka begitu kamu selesai.
                  </p>
                  <Link
                    href="/produk"
                    className="group mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand transition-colors hover:text-brand-orange"
                  >
                    Lihat produk
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </Link>
                </div>
              </article>

              {menyusul.map(({ judul, isi, Gambar }) => (
                <article
                  key={judul}
                  className={`flex items-center gap-4 overflow-hidden rounded-2xl border ${hairline} bg-white`}
                >
                  <div className="flex-1 p-7 sm:p-8">
                    <span className="inline-flex rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-brand/60">
                      Segera
                    </span>
                    <h3 className="mt-3 text-xl font-medium tracking-[-0.01em] text-brand">
                      {judul}
                    </h3>
                    <p className="mt-2 text-sm leading-6 font-normal text-brand/70">
                      {isi}
                    </p>
                  </div>

                  {/* Gambaran isi produk, bukan tangkapan layar: barangnya
                      memang belum ada, jadi jangan berpura-pura sudah. */}
                  <div
                    className="hidden w-40 shrink-0 self-stretch sm:block lg:w-44"
                    aria-hidden
                  >
                    <Gambar />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/**
 * Bingkai tangkapan layar produk: matras putih tipis dengan bayangan rendah,
 * supaya gambar antarmuka yang latarnya juga terang tidak lumer ke latar seksi.
 */
function BingkaiLayar({
  gambar,
  alt,
}: {
  /** Ukuran asli berkasnya ikut dikirim agar ruangnya dipesan sebelum gambar
      selesai diunduh — tanpa itu isi halaman melompat saat gambar mendarat. */
  gambar: { src: string; lebar: number; tinggi: number };
  alt: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border ${hairline} bg-white p-2 shadow-[0_18px_50px_-30px_rgba(16,92,120,0.45)]`}
    >
      <Image
        src={gambar.src}
        alt={alt}
        width={gambar.lebar}
        height={gambar.tinggi}
        sizes="(min-width: 1024px) 66vw, 100vw"
        className={`w-full rounded-lg border ${hairline}`}
      />
    </div>
  );
}

/** Gambaran bank soal: beberapa pilihan jawaban, satu di antaranya terpilih. */
function GambarSoal() {
  return (
    <div className="flex h-full flex-col justify-center gap-2 bg-cream/40 py-6 pr-6 pl-4">
      {["A", "B", "C"].map((huruf, i) => (
        <div
          key={huruf}
          className={`flex items-center gap-2 rounded-lg border bg-white px-2.5 py-2 ${
            i === 1 ? "border-brand" : hairline
          }`}
        >
          <span
            className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-medium ${
              i === 1
                ? "bg-brand text-white"
                : "border border-brand/30 text-brand/40"
            }`}
          >
            {huruf}
          </span>
          <span className="h-1.5 flex-1 rounded-full bg-brand/10" />
        </div>
      ))}
    </div>
  );
}

/** Gambaran ebook: tumpukan halaman dengan sampul di depan. */
function GambarEbook() {
  return (
    <div className="relative grid h-full place-items-center bg-cream/40 py-6">
      <div
        className={`absolute h-28 w-20 rotate-6 rounded-lg border ${hairline} bg-white`}
      />
      <div
        className={`absolute h-28 w-20 -rotate-6 rounded-lg border ${hairline} bg-white`}
      />
      <div
        className={`relative flex h-28 w-20 flex-col justify-end gap-1.5 rounded-lg border ${hairline} bg-brand p-3`}
      >
        <span className="h-1.5 w-8 rounded-full bg-brand-orange" />
        <span className="h-1 w-full rounded-full bg-white/30" />
        <span className="h-1 w-2/3 rounded-full bg-white/30" />
      </div>
    </div>
  );
}

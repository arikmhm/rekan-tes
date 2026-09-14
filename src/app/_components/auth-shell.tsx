import { ArrowRight, ClipboardList, Clock, Wallet } from "lucide-react";
import Link from "next/link";

const sorotan = [
  {
    Ikon: Clock,
    judul: "Waktu berjalan per subtes",
    isi: "Hitung mundur dan penutupan otomatis seperti tes sungguhan.",
  },
  {
    Ikon: ClipboardList,
    judul: "Skor dan pembahasan",
    isi: "Selesai mengerjakan, skor per subtes dan kunci tiap soal langsung terbuka.",
  },
  {
    Ikon: Wallet,
    judul: "Bayar sekali per simulasi",
    isi: "Tanpa langganan dan tanpa paket tahunan.",
  },
];

/**
 * Kerangka halaman akun: panel bermerek di kiri, formulir di kanan. Panelnya
 * dilepas di bawah lg — di layar sempit ia hanya akan mendorong formulir turun,
 * padahal formulir itulah yang dicari orang saat membuka halaman ini.
 */
export function AuthShell({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand px-10 py-12 text-white lg:flex lg:flex-col xl:px-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[url('/patterns/endless-constellation.svg')] bg-repeat opacity-[0.18] mask-[linear-gradient(to_bottom,black,transparent)]"
        />
        {/* Kotak oranye miring yang separuh keluar bingkai: aksen yang sama
            dipakai beranda, cukup untuk memecah bidang biru tanpa gambar. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 size-80 rotate-12 rounded-[3rem] border border-brand-orange/30 bg-brand-orange/10"
        />

        <Link
          href="/"
          className="relative w-fit text-lg font-semibold tracking-tight transition-opacity hover:opacity-70"
        >
          Rekan Tes
        </Link>

        <div className="relative my-auto max-w-md py-12">
          <h2 className="text-4xl leading-[1.15] font-medium tracking-[-0.01em]">
            Setiap Kesempatan Layak Dipersiapkan.
          </h2>

          <ul className="mt-10 space-y-6">
            {sorotan.map(({ Ikon, judul, isi }) => (
              <li key={judul} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10">
                  <Ikon className="size-5 text-brand-orange" aria-hidden />
                </span>
                <div>
                  <p className="font-medium">{judul}</p>
                  <p className="mt-1 text-sm leading-6 font-normal text-white/70">
                    {isi}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/simulasi"
          className="group relative flex w-fit items-center gap-2 text-sm font-normal text-white/80 transition-colors duration-300 ease-out hover:text-white"
        >
          Belum yakin? Coba simulasi gratis dulu
          <ArrowRight
            className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </aside>

      <div className="flex flex-1 flex-col px-5 py-10 sm:px-8 sm:py-14">
        {/* Jalan pulang saat panel kiri tidak tampil. */}
        <Link
          href="/"
          className="w-fit text-lg font-semibold tracking-tight text-brand transition-opacity hover:opacity-70 lg:hidden"
        >
          Rekan Tes
        </Link>

        <div className="mx-auto my-auto w-full max-w-sm py-10">
          <h1 className="text-3xl font-medium tracking-[-0.01em] text-brand">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 font-normal text-brand/70">
            {description}
          </p>

          {children}

          <p className="mt-7 text-sm font-normal text-brand/70">{footer}</p>
        </div>
      </div>
    </main>
  );
}

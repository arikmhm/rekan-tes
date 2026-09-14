"use client";

import { ArrowRight, Clock, FileText, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

const hairline = "border-[#105C78]/20";

/**
 * Tombol mulai beserta konfirmasinya. Memakai elemen <dialog> bawaan peramban,
 * jadi modalitas, jebakan fokus, tombol Esc, dan latar gelapnya ditangani
 * platform — tanpa pustaka dialog sendiri.
 *
 * Konfirmasinya bukan basa-basi: begitu halaman pengerjaan terbuka, hitung
 * mundur langsung berjalan dan tidak bisa dijeda.
 */
export function TombolMulai({
  href,
  jumlahSoal,
  menit,
}: {
  href: string;
  jumlahSoal: number;
  menit: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="group mt-6 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
      >
        Mulai sekarang
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-1"
          aria-hidden
        />
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="judul-konfirmasi"
        className={`m-auto w-[min(26rem,calc(100vw-2.5rem))] rounded-2xl border ${hairline} bg-white p-0 text-brand shadow-[0_24px_60px_rgba(16,92,120,0.22)] backdrop:bg-brand/40`}
      >
        <div className="p-6 sm:p-7">
          <h2
            id="judul-konfirmasi"
            className="text-xl font-medium tracking-[-0.01em] text-brand"
          >
            Mulai sesi sekarang?
          </h2>
          <p className="mt-2 text-sm leading-6 font-normal text-brand/70">
            Hitung mundur berjalan begitu halaman pengerjaan terbuka dan tidak
            bisa dijeda. Siapkan tempat yang tenang dulu.
          </p>

          <dl
            className={`mt-5 flex gap-6 border-y ${hairline} py-4 text-sm font-normal text-brand/70`}
          >
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-brand/40" aria-hidden />
              <dt className="sr-only">Jumlah soal</dt>
              <dd>{jumlahSoal} soal</dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-brand/40" aria-hidden />
              <dt className="sr-only">Durasi</dt>
              <dd>{menit} menit</dd>
            </div>
          </dl>

          <p className="mt-4 flex items-start gap-2 text-xs leading-5 font-normal text-brand/60">
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0 text-brand-orange"
              aria-hidden
            />
            Menutup halaman di tengah sesi berarti mengulang dari awal — tidak
            ada jawaban yang tersimpan.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row-reverse">
            <Link
              href={href}
              className="group inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
            >
              Ya, mulai
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>

            {/* method="dialog" menutup modal tanpa JavaScript tambahan. */}
            <form method="dialog" className="flex-1">
              <button
                type="submit"
                className={`h-11 w-full cursor-pointer rounded-lg border ${hairline} text-sm font-normal text-brand transition-colors hover:bg-brand hover:text-white`}
              >
                Belum, nanti saja
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}

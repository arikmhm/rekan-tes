"use client";

import { Image as ImageIcon } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const hairline = "border-[#105C78]/20";

/**
 * Menukarnya dengan gambar sungguhan: taruh berkasnya di `public/spanduk/`,
 * lalu ganti isi tiap CarouselItem dengan
 *   <Image src={`/${berkas}`} alt="…" width={1600} height={600}
 *          className="h-full w-full rounded-2xl object-cover" />
 * dan impor `Image` dari "next/image".
 */
const spanduk = ["spanduk/1.png", "spanduk/2.png", "spanduk/3.png"];

/**
 * Spanduk di kepala halaman produk. Gambarnya menyusul; sampai itu tiba tiap
 * bidang memegang tempatnya dan menyebutkan berkas yang ditunggu.
 */
export function Spanduk() {
  return (
    <Carousel opts={{ loop: true }} className="group/spanduk">
      <CarouselContent>
        {spanduk.map((berkas) => (
          <CarouselItem key={berkas}>
            <div
              className={`grid aspect-16/6 place-items-center rounded-2xl border border-dashed ${hairline} bg-cream/60`}
            >
              <div className="px-6 text-center">
                <ImageIcon
                  className="mx-auto size-6 text-brand/25"
                  aria-hidden
                />
                <p className="mt-2 font-mono text-xs font-normal text-brand/40">
                  {berkas}
                </p>
                <p className="mt-0.5 font-mono text-[11px] font-normal text-brand/30">
                  1600 × 600
                </p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Panah hanya muncul saat kursor ada di atas spanduk; di layar sentuh
          geseran jari sudah menanganinya. */}
      <CarouselPrevious
        className={`left-4 hidden border ${hairline} bg-white/90 text-brand opacity-0 transition-opacity group-hover/spanduk:opacity-100 focus-visible:opacity-100 sm:inline-flex`}
      />
      <CarouselNext
        className={`right-4 hidden border ${hairline} bg-white/90 text-brand opacity-0 transition-opacity group-hover/spanduk:opacity-100 focus-visible:opacity-100 sm:inline-flex`}
      />
    </Carousel>
  );
}

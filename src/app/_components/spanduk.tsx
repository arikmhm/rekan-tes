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

type Slide = { id: string; imageUrl: string; alt: string };

/**
 * Spanduk di kepala halaman produk. Isinya diatur admin di `/admin/spanduk`;
 * selama belum ada satu pun, satu bidang kosong memegang tempatnya supaya tata
 * letak halaman tidak berubah begitu spanduk pertama masuk.
 *
 * Gambarnya dilayani CDN penyimpanan objek, jadi dipakai `<img>` biasa —
 * melewatkannya lagi ke pengoptimal hanya menambah satu perjalanan tanpa
 * menghemat apa pun.
 */
export function Spanduk({ slides }: { slides: Slide[] }) {
  if (slides.length === 0) return <Kosong />;

  return (
    <Carousel opts={{ loop: true }} className="group/spanduk">
      <CarouselContent>
        {slides.map((s) => (
          <CarouselItem key={s.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.imageUrl}
              alt={s.alt}
              width={1600}
              height={600}
              className={`aspect-16/6 w-full rounded-2xl border ${hairline} bg-cream/60 object-cover`}
            />
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

/** Tempat spanduk saat belum ada isinya; ukurannya sama persis dengan slide. */
function Kosong() {
  return (
    <div
      className={`grid aspect-16/6 place-items-center rounded-2xl border border-dashed ${hairline} bg-cream/60`}
    >
      <div className="px-6 text-center">
        <ImageIcon className="mx-auto size-6 text-brand/25" aria-hidden />
        <p className="mt-2 font-mono text-xs font-normal text-brand/40">
          belum ada spanduk
        </p>
        <p className="mt-0.5 font-mono text-[11px] font-normal text-brand/30">
          1600 × 600
        </p>
      </div>
    </div>
  );
}

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

/**
 * Korsel sorotan. Penggeserannya memakai scroll-snap milik peramban — sentuhan,
 * roda, dan papan ketik sudah ditangani di sana — sehingga tombol panah tinggal
 * memanggil scrollBy, tanpa pustaka korsel sama sekali.
 */
export function Korsel({ children }: { children: React.ReactNode }) {
  const jalur = useRef<HTMLDivElement>(null);

  function geser(arah: 1 | -1) {
    const el = jalur.current;
    if (el) el.scrollBy({ left: arah * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="group/korsel relative">
      <div
        ref={jalur}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {/* Panah hanya untuk tetikus: di layar sentuh geseran jari sudah cukup,
          dan tombol melayang justru menutupi isi slide. */}
      {[
        {
          arah: -1 as const,
          Ikon: ChevronLeft,
          label: "Sorotan sebelumnya",
          sisi: "left-3",
        },
        {
          arah: 1 as const,
          Ikon: ChevronRight,
          label: "Sorotan berikutnya",
          sisi: "right-3",
        },
      ].map(({ arah, Ikon, label, sisi }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          onClick={() => geser(arah)}
          className={`absolute top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-brand opacity-0 shadow-sm transition-opacity duration-300 ease-out group-hover/korsel:opacity-100 focus-visible:opacity-100 sm:grid ${sisi}`}
        >
          <Ikon className="size-5" aria-hidden />
        </button>
      ))}
    </div>
  );
}

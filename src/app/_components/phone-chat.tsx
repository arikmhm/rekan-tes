"use client";

import { useEffect, useRef, useState } from "react";

const percakapan = [
  { kanan: true, teks: "duh, seleksi bank makin ketat ya sekarang" },
  { kanan: true, teks: "bingung mau mulai dari mana" },
  { kanan: false, teks: "santai, gausah dipikirin ribet-ribet" },
  { kanan: false, teks: "mulai aja dari latihan soal" },
  { kanan: false, teks: "pelan-pelan juga gapapa, yang penting mulai" },
];

/**
 * Bingkai separuh HP: sengaja tidak dibuat penuh (tanpa bezel bawah/tombol
 * home) supaya kelihatan seperti layar HP yang nongol dari bawah, bukan
 * mockup device utuh. Bubble muncul bertahap saat kartu ini masuk viewport.
 */
export function PhoneChat() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mx-auto w-full max-w-sm">
      <div className="rounded-t-[2.5rem] border border-b-0 border-brand/15 bg-white px-5 pt-4 pb-7 shadow-[0_8px_30px_-18px_rgba(16,92,120,0.35)] sm:px-6">
        <div className="mx-auto h-1.5 w-16 rounded-full bg-brand/15" />
        <div className="mt-6 space-y-2.5">
          {percakapan.map((pesan, i) => (
            <div key={i} className={`flex ${pesan.kanan ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed transition-all duration-500 ease-out ${
                  pesan.kanan ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-brand/8 text-brand"
                } ${visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
                style={{ transitionDelay: visible ? `${i * 350}ms` : "0ms" }}
              >
                {pesan.kanan ? (
                  pesan.teks
                ) : pesan.teks.includes("latihan") ? (
                  <>
                    {pesan.teks.split("latihan")[0]}
                    <span className="underline decoration-brand-orange decoration-2 underline-offset-4">
                      latihan
                    </span>
                    {pesan.teks.split("latihan")[1]}
                  </>
                ) : (
                  pesan.teks
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

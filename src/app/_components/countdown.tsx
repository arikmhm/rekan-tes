"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Menghitung waktu berlalu sejak mount, bukan jam peramban, agar jam klien yang
 * salah setel tidak berpengaruh. Di nol, server yang memutuskan subtes ditutup.
 */
export function Countdown({ remainingSeconds }: { remainingSeconds: number }) {
  const router = useRouter();
  const [sisa, setSisa] = useState(remainingSeconds);

  useEffect(() => {
    // Tik pertama (≤500 ms) yang menyelaraskan state dengan nilai server baru,
    // bukan setState di badan efek.
    const mulai = Date.now();

    const tik = setInterval(() => {
      const berlalu = Math.round((Date.now() - mulai) / 1000);
      setSisa(Math.max(0, remainingSeconds - berlalu));
    }, 500);

    return () => clearInterval(tik);
  }, [remainingSeconds]);

  useEffect(() => {
    if (sisa <= 0) router.refresh();
  }, [sisa, router]);

  return (
    <span role="timer" aria-live="off" className="font-mono tabular-nums">
      {jamMenitDetik(sisa)}
    </span>
  );
}

function jamMenitDetik(detik: number) {
  const bagian = [Math.floor(detik / 3600), Math.floor(detik / 60) % 60, detik % 60];
  return bagian
    .slice(bagian[0] === 0 ? 1 : 0)
    .map((n, i) => (i === 0 && bagian[0] === 0 ? String(n) : String(n).padStart(2, "0")))
    .join(":");
}

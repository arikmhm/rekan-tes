"use client";

import { useEffect, useState } from "react";

/**
 * Bingkai header yang menempel di puncak layar: menyingkir saat halaman digulir
 * turun agar isi halaman dapat ruang penuh, lalu muncul lagi begitu pengunjung
 * menggulir naik sedikit saja — tanpa harus kembali ke puncak halaman.
 */
export function HeaderGeser({ children }: { children: React.ReactNode }) {
  const [sembunyi, setSembunyi] = useState(false);

  useEffect(() => {
    let terakhir = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      // Gulir sependek beberapa piksel — termasuk pantulan di ujung halaman —
      // diabaikan supaya header tidak berkedip naik-turun.
      if (Math.abs(y - terakhir) < 8) return;
      // Sepanjang masih di dekat puncak header selalu tampil, jadi ia tidak
      // sempat menghilang tepat saat halaman baru dibuka.
      setSembunyi(y > terakhir && y > 80);
      terakhir = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 border-b border-[#105C78]/20 bg-white transition-transform duration-300 ease-out ${
        sembunyi ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {children}
    </header>
  );
}

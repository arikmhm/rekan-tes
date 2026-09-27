"use client";

import { useEffect, useState } from "react";

export function HeaderGeser({ children }: { children: React.ReactNode }) {
  const [sembunyi, setSembunyi] = useState(false);

  useEffect(() => {
    let terakhir = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      // Abaikan gulir kecil (termasuk pantulan) agar header tidak berkedip.
      if (Math.abs(y - terakhir) < 8) return;
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "cn";

const items = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/kategori", label: "Kategori" },
  { href: "/admin/soal", label: "Bank soal" },
  { href: "/admin/subtes", label: "Subtes" },
  { href: "/admin/tes", label: "Produk tes" },
];

/** Navigasi admin dengan penanda halaman aktif. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi admin" className="-mb-4 mt-3 flex gap-1 overflow-x-auto">
      {items.map((item) => {
        const aktif = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={aktif ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 pb-3 text-sm font-medium whitespace-nowrap transition",
              aktif
                ? "border-primary text-foreground"
                : "text-muted-foreground border-transparent hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

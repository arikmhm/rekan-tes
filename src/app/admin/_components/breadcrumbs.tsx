"use client";

import { usePathname } from "next/navigation";
import { Fragment } from "react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const label: Record<string, string> = {
  kategori: "Kategori soal",
  soal: "Bank soal",
  baru: "Baru",
  subtes: "Subtes",
  tes: "Produk tes",
};

/** Segmen id tampil sebagai "Detail" alih-alih memuat datanya ulang. */
export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segmen = pathname.split("/").filter(Boolean).slice(1);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {segmen.length === 0 ? (
            <BreadcrumbPage>Dasbor</BreadcrumbPage>
          ) : (
            <BreadcrumbLink render={<Link href="/admin" />}>Dasbor</BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {segmen.map((s, i) => {
          const href = `/admin/${segmen.slice(0, i + 1).join("/")}`;
          const teks = label[s] ?? (s.length > 20 ? "Detail" : s);
          const terakhir = i === segmen.length - 1;

          // Separator sudah <li>; menyarangkannya memicu galat hidrasi.
          return (
            <Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {terakhir ? (
                  <BreadcrumbPage>{teks}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={href} />}>{teks}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

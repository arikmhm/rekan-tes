"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const label: Record<string, string> = {
  pesanan: "Pesanan",
  pustaka: "Pustaka",
  profil: "Profil",
};

const labelJenis: Record<string, string> = {
  simulasi: "Simulasi",
  "bank-soal": "Soal",
  materi: "Ebook",
};

/**
 * Jejak halaman ruang peserta. Halaman depan berisi daftar produk, jadi
 * jejaknya sekaligus menggantikan judul halaman. Di pustaka, jenis yang sedang
 * disaring ikut jadi remah terakhir meski ia hidup di query, bukan di path.
 */
export function PesertaBreadcrumbs() {
  const pathname = usePathname();
  const jenis = useSearchParams().get("jenis");
  const segmen = pathname.split("/").filter(Boolean).slice(1);

  // Di halaman depan, "Produk" ikut jadi remah agar jejaknya tetap menyebut
  // isi halaman alih-alih berhenti di nama ruangnya.
  const remah =
    segmen.length === 0
      ? [{ href: "/peserta", teks: "Produk" }]
      : segmen.map((s, i) => ({
          href: `/peserta/${segmen.slice(0, i + 1).join("/")}`,
          teks: label[s] ?? s,
        }));

  if (segmen[0] === "pustaka" && jenis && labelJenis[jenis]) {
    remah.push({
      href: `/peserta/pustaka?jenis=${jenis}`,
      teks: labelJenis[jenis],
    });
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/peserta" />}>
            Dasbor
          </BreadcrumbLink>
        </BreadcrumbItem>

        {remah.map(({ href, teks }, i) => {
          const terakhir = i === remah.length - 1;

          // Separator sudah berupa <li>, jadi ia bersaudara dengan item,
          // bukan anaknya. Menyarangkannya memicu galat hidrasi.
          return (
            <Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {terakhir ? (
                  <BreadcrumbPage>{teks}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={href} />}>
                    {teks}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

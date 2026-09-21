"use client";

import { ArrowLeft, ArrowRight, CheckIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper";

export type LangkahTes = {
  judul: string;
  /** Belum bisa dibuka; dipakai halaman produk baru yang belum punya id. */
  nonaktif?: boolean;
  isi: React.ReactNode;
};

/**
 * Kerangka langkah penyusunan produk. Isinya dirender di server dan dititipkan
 * sebagai prop, jadi hanya perpindahan langkah yang berjalan di peramban.
 *
 * Tidak ada keadaan yang ditahan di sini: tiap langkah menyimpan sendiri ke
 * database saat disubmit. Stepper-nya menata urutan kerja, bukan menampung
 * draft yang belum tersimpan.
 */
export function StepperTes({ awal, langkah }: { awal: number; langkah: LangkahTes[] }) {
  const [aktif, setAktif] = useState(awal);

  return (
    <Stepper
      value={aktif}
      onValueChange={setAktif}
      className="space-y-8"
      indicators={{ completed: <CheckIcon className="size-3.5" /> }}
    >
      <div className="flex justify-center">
        <StepperNav className="max-w-xl">
          {langkah.map((l, i) => (
            <StepperItem
              key={l.judul}
              step={i + 1}
              // Centang murni soal posisi: langkah di belakang yang sudah
              // dilewati. Kelengkapan datanya tidak dipakai di sini — menandai
              // langkah di depan sebagai selesai membuat penanda posisi hilang,
              // dan syarat terbit toh sudah dirinci di langkah terakhir.
              disabled={l.nonaktif}
              className="relative flex-1 items-start"
            >
              <StepperTrigger className="flex flex-col gap-2.5">
                {/* Selesai dan sedang dibuka memakai warna yang sama di komponen
                    aslinya, jadi langkah aktif diberi cincin dan judul tebal. */}
                <StepperIndicator className="data-[state=active]:ring-primary/30 data-[state=active]:ring-4">
                  {i + 1}
                </StepperIndicator>
                <StepperTitle className="data-[state=active]:font-semibold data-[state=inactive]:text-muted-foreground">
                  {l.judul}
                </StepperTitle>
              </StepperTrigger>
              {i < langkah.length - 1 && (
                <StepperSeparator className="group-data-[state=completed]/step:bg-primary absolute inset-x-0 top-3 left-[calc(50%+0.875rem)] m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem+0.225rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none" />
              )}
            </StepperItem>
          ))}
        </StepperNav>
      </div>

      <StepperPanel>
        {langkah.map((l, i) => (
          // Kolom minmax(0,1fr) menahan lebar kolom agar tidak ikut isi
          // terpanjang; tanpa itu tabel dan ringkasan menarik halaman melewati
          // tepi layar ponsel.
          <StepperContent
            key={l.judul}
            value={i + 1}
            className="grid grid-cols-[minmax(0,1fr)] gap-4"
          >
            {l.isi}

            {/* Navigasi antarlangkah. Tidak menyimpan apa pun: tiap langkah
                punya tombol simpannya sendiri, ini hanya berpindah halaman. */}
            <div className="flex gap-3">
              {i > 0 && (
                <Button type="button" variant="outline" onClick={() => setAktif(i)}>
                  <ArrowLeft className="size-4" />
                  Kembali
                </Button>
              )}
              {i < langkah.length - 1 && (
                <Button
                  type="button"
                  className="ml-auto"
                  disabled={langkah[i + 1].nonaktif}
                  onClick={() => setAktif(i + 2)}
                >
                  Lanjut
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </StepperContent>
        ))}
      </StepperPanel>
    </Stepper>
  );
}

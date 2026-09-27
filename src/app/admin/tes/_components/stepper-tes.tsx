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
  /** Produk baru yang belum punya id. */
  nonaktif?: boolean;
  isi: React.ReactNode;
};

/** Isi langkah dirender server; tiap langkah menyimpan sendiri, stepper tidak menahan draft. */
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
              // Centang hanya menandai posisi, bukan kelengkapan data.
              disabled={l.nonaktif}
              className="relative flex-1 items-start"
            >
              <StepperTrigger className="flex flex-col gap-2.5">
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
          // minmax(0,1fr): tanpa itu isi terpanjang menarik halaman melewati layar.
          <StepperContent
            key={l.judul}
            value={i + 1}
            className="grid grid-cols-[minmax(0,1fr)] gap-4"
          >
            {l.isi}

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

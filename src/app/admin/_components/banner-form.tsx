"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { moveBanner, removeBanner, saveBanner } from "@/lib/admin";

import { FormError } from "./shell";

type Spanduk = {
  id: string;
  imageUrl: string;
  alt: string;
};

/** Formulir satu spanduk: dipakai untuk menambah maupun menyunting. */
export function BannerForm({ spanduk }: { spanduk?: Spanduk }) {
  const [error, action, pending] = useActionState(saveBanner, null);
  const uid = spanduk?.id ?? "baru";

  return (
    <form action={action} className="grid gap-4">
      {spanduk && <input type="hidden" name="id" value={spanduk.id} />}

      <Field>
        <FieldLabel htmlFor={`imageUrl-${uid}`}>Alamat gambar</FieldLabel>
        <Input
          id={`imageUrl-${uid}`}
          name="imageUrl"
          required
          type="url"
          inputMode="url"
          defaultValue={spanduk?.imageUrl}
          placeholder="https://cdn.contoh.com/spanduk-1.jpg"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor={`alt-${uid}`}>Teks alternatif</FieldLabel>
        <Input
          id={`alt-${uid}`}
          name="alt"
          required
          defaultValue={spanduk?.alt}
          placeholder="Promo paket simulasi UTBK, diskon 30 persen"
        />
      </Field>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : spanduk ? "Simpan perubahan" : "Tambah spanduk"}
        </Button>
      </div>

      <FormError message={error} />
    </form>
  );
}

/**
 * Satu baris spanduk: pratinjau gambarnya, urutannya, dan formulir suntingnya.
 * Pratinjau memakai `<img>` biasa — gambarnya sudah dilayani CDN penyimpanan
 * objek, jadi melewatkannya lagi ke pengoptimal hanya menambah perjalanan.
 */
export function BannerRow({
  spanduk,
  pertama,
  terakhir,
}: {
  spanduk: Spanduk;
  pertama: boolean;
  terakhir: boolean;
}) {
  return (
    <details className="group bg-card rounded-xl border">
      <summary className="hover:bg-muted/40 flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={spanduk.imageUrl}
          alt=""
          className="bg-muted h-12 w-32 shrink-0 rounded-md object-cover"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{spanduk.alt}</span>
          <span className="text-muted-foreground block truncate font-mono text-xs">
            {spanduk.imageUrl}
          </span>
        </span>
        <span className="text-muted-foreground text-xs group-open:hidden">Sunting</span>
      </summary>

      <div className="grid gap-4 border-t p-4">
        <BannerForm spanduk={spanduk} />

        <div className="flex flex-wrap gap-2 border-t pt-4">
          <form action={moveBanner}>
            <input type="hidden" name="id" value={spanduk.id} />
            <input type="hidden" name="arah" value="naik" />
            <Button type="submit" variant="ghost" size="sm" disabled={pertama}>
              ↑ Naikkan
            </Button>
          </form>
          <form action={moveBanner}>
            <input type="hidden" name="id" value={spanduk.id} />
            <input type="hidden" name="arah" value="turun" />
            <Button type="submit" variant="ghost" size="sm" disabled={terakhir}>
              ↓ Turunkan
            </Button>
          </form>
          <form action={removeBanner} className="ml-auto">
            <input type="hidden" name="id" value={spanduk.id} />
            <Button type="submit" variant="ghost" size="sm" className="text-destructive">
              Hapus
            </Button>
          </form>
        </div>
      </div>
    </details>
  );
}

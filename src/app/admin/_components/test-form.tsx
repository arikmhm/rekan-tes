"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";
import { saveTest } from "@/lib/admin";

import { FormError } from "./shell";

type Tes = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceAmount: number;
  status: string;
};

const STATUS = ["draft", "published", "archived"];

/**
 * Formulir produk tes. Status `published` hanya diterima server bila seluruh
 * subtes sudah lengkap, jadi tombol ini juga berfungsi sebagai tombol terbit.
 */
export function TestForm({ tes }: { tes?: Tes }) {
  const [error, action, pending] = useActionState(saveTest, null);
  const uid = tes?.id ?? "baru";

  return (
    <form action={action} className="grid gap-5">
      {tes && <input type="hidden" name="id" value={tes.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`tes-name-${uid}`}>Nama tes</Label>
          <Input
            id={`tes-name-${uid}`}
            name="name"
            required
            defaultValue={tes?.name}
            placeholder="Simulasi Tes Masuk Bank"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`tes-slug-${uid}`}>Slug</Label>
          <Input
            id={`tes-slug-${uid}`}
            name="slug"
            required
            defaultValue={tes?.slug}
            placeholder="simulasi-tes-masuk-bank"
            className="lowercase"
          />
          <p className="text-muted-foreground text-xs">Menjadi alamat halaman: /tes/slug</p>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`tes-desc-${uid}`}>Deskripsi</Label>
        <Textarea
          id={`tes-desc-${uid}`}
          name="description"
          required
          rows={3}
          defaultValue={tes?.description}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`tes-price-${uid}`}>Harga (rupiah)</Label>
          <Input
            id={`tes-price-${uid}`}
            name="priceAmount"
            type="number"
            min={0}
            step={1000}
            required
            defaultValue={tes?.priceAmount ?? 0}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`tes-status-${uid}`}>Status</Label>
          <SelectNative id={`tes-status-${uid}`} name="status" defaultValue={tes?.status ?? "draft"}>
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectNative>
        </div>
      </div>

      <FormError message={error} />

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : tes ? "Simpan tes" : "Buat tes"}
        </Button>
      </div>
    </form>
  );
}

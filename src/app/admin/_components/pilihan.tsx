"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export type Opsi = { value: string; label: string };

/**
 * Satu kolom pilihan untuk formulir admin: combobox shadcn yang bisa diketik
 * untuk menyaring, menggantikan `select` bawaan yang kaku.
 *
 * Nilainya tetap ikut terkirim sebagai FormData lewat `name`, karena Base UI
 * merender input tersembunyi sendiri dan memakai `value` dari opsi bentuk
 * `{ value, label }`. Jadi seluruh Server Action dan formulir filter GET tidak
 * perlu diubah sama sekali.
 *
 * ponytail: kalau daftarnya sampai ratusan dan penyaringan di peramban mulai
 * terasa berat, ganti `items` dengan pencarian ke server.
 */
export function Pilihan({
  id,
  name,
  opsi,
  defaultValue = "",
  value,
  onUbah,
  placeholder = "Pilih…",
  required,
  disabled,
}: {
  id?: string;
  /** Nama kolom FormData. Kosongkan pada pemakaian terkendali. */
  name?: string;
  opsi: Opsi[];
  defaultValue?: string;
  /** Diisi hanya untuk pemakaian terkendali, berpasangan dengan `onUbah`. */
  value?: string;
  onUbah?: (nilai: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const cari = (nilai: string) => opsi.find((o) => o.value === nilai) ?? null;

  return (
    <Combobox
      items={opsi}
      name={name}
      required={required}
      disabled={disabled}
      {...(value === undefined
        ? { defaultValue: cari(defaultValue) }
        : { value: cari(value), onValueChange: (o: Opsi | null) => onUbah?.(o?.value ?? "") })}
      itemToStringLabel={(o: Opsi) => o.label}
    >
      <ComboboxInput id={id} placeholder={placeholder} />
      <ComboboxContent>
        <ComboboxEmpty>Tidak ada yang cocok.</ComboboxEmpty>
        <ComboboxList>
          {(o: Opsi) => (
            <ComboboxItem key={o.value} value={o}>
              {o.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

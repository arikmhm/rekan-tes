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
 * Combobox yang tetap terkirim sebagai FormData lewat `name` (Base UI merender
 * input tersembunyi), jadi Server Action dan form GET tidak berubah.
 *
 * ponytail: penyaringan di peramban; ganti dengan pencarian server bila ratusan.
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
  name?: string;
  opsi: Opsi[];
  defaultValue?: string;
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

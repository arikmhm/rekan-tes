import * as React from "react";

import { cn } from "cn";

/**
 * `select` bawaan peramban dengan tampilan sama seperti `Input`.
 *
 * Dipakai menggantikan Select milik Radix karena seluruh formulir admin
 * dikirim sebagai form biasa ke Server Action: elemen native ikut terkirim
 * tanpa JavaScript, bekerja pada form GET, dan memberi daftar panjang
 * pengalaman asli perangkat, termasuk ketik-untuk-mencari.
 */
function SelectNative({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select-native"
      className={cn(
        "border-input bg-background flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { SelectNative };

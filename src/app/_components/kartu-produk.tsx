import { CalendarClock, Clock, FileText, Layers } from "lucide-react";
import Link from "next/link";

import { JENIS, type FaktaProduk, type Produk } from "@/lib/produk";
import { formatPrice } from "@/lib/format";

const hairline = "border-[#105C78]/20";

const IKON: Record<FaktaProduk["ikon"], typeof Layers> = {
  subtes: Layers,
  soal: FileText,
  durasi: Clock,
  akses: CalendarClock,
};

export function KartuProduk({
  produk,
  href,
}: {
  produk: Produk;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`flex h-full flex-col rounded-2xl border ${hairline} bg-white p-5 transition-colors hover:border-brand-orange`}
    >
      <span className="w-fit rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-brand/70">
        {JENIS[produk.jenis].label}
      </span>

      <h2 className="mt-3 mb-4 text-lg leading-snug font-medium text-brand">
        {produk.nama}
      </h2>

      <div className={`mt-auto flex flex-col gap-3 border-t ${hairline} pt-4`}>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-normal text-brand/60">
          {produk.fakta.map(({ ikon, teks }) => {
            const Ikon = IKON[ikon];
            return (
              <span key={teks} className="flex items-center gap-1.5">
                <Ikon className="size-4 text-brand/40" aria-hidden />
                {teks}
              </span>
            );
          })}
        </div>
        <p className="text-lg font-medium text-brand-orange">
          {formatPrice(produk.harga)}
        </p>
      </div>
    </Link>
  );
}

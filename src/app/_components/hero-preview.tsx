"use client";

import { Clock, ListChecks, Save } from "lucide-react";
import { useState } from "react";

const hairline = "border-[#105C78]/20";

const contohSubtes = [
  {
    nama: "Numerik",
    timer: "01:45",
    prompt:
      "3 pekerja menyelesaikan sebuah proyek dalam 8 hari. Kalau ada 4 pekerja, proyek yang sama selesai dalam berapa hari?",
    opsi: [
      { label: "A", teks: "5 hari" },
      { label: "B", teks: "6 hari", benar: true },
      { label: "C", teks: "8 hari" },
      { label: "D", teks: "10 hari" },
    ],
  },
  {
    nama: "Verbal",
    timer: "00:50",
    prompt: 'Sinonim dari kata "genuine" adalah?',
    opsi: [
      { label: "A", teks: "Palsu" },
      { label: "B", teks: "Asli", benar: true },
      { label: "C", teks: "Rumit" },
      { label: "D", teks: "Mahal" },
    ],
  },
  {
    nama: "Logika & Figural",
    timer: "01:10",
    prompt: "Lanjutan dari deret 2, 4, 8, 16, ... adalah?",
    opsi: [
      { label: "A", teks: "18" },
      { label: "B", teks: "24" },
      { label: "C", teks: "32", benar: true },
      { label: "D", teks: "36" },
    ],
  },
];

/**
 * Tangkapan layar ilustratif produk, bukan sesi ujian sungguhan (label
 * disclaimer di bawah kartu tetap ada). Tab subtesnya bisa diklik dan
 * memang mengganti soal yang ditampilkan, bukan sekadar dekorasi.
 */
export function HeroPreview() {
  const [aktif, setAktif] = useState(0);
  const subtes = contohSubtes[aktif];

  return (
    <div className="relative pb-8">
      <div aria-hidden className="absolute -right-6 -bottom-14 -z-10 size-40 rounded-[6px] bg-[#F68B1F]" />

      <div className={`rounded-[8px] border ${hairline} bg-white`}>
        <div className={`flex items-center justify-between border-b ${hairline} px-5 py-4 sm:px-6`}>
          <div className="flex items-center gap-2 text-sm font-medium text-[#105C78]">
            <ListChecks className="size-4" aria-hidden />
            Simulasi / {subtes.nama}
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#105C78] px-2.5 py-1 font-mono text-xs font-medium text-white">
            <Clock className="size-3.5" aria-hidden />
            {subtes.timer}
          </span>
        </div>

        <div className="relative px-5 py-6 sm:px-6 sm:py-7">
          <span className="inline-flex items-center rounded-[4px] bg-[#105C78]/10 px-2.5 py-1 text-xs font-medium text-[#105C78]">
            Sedang dikerjakan
          </span>
          <p className="mt-4 text-base leading-7 font-normal text-[#105C78]">{subtes.prompt}</p>
          <div className="mt-5 space-y-2">
            {subtes.opsi.map((opsi) => (
              <div
                key={opsi.label}
                className={`flex items-center gap-3 rounded-[4px] border p-3 ${
                  opsi.benar ? "border-[#105C78] bg-[#105C78]/5" : `${hairline} bg-white`
                }`}
              >
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium ${
                    opsi.benar ? "bg-[#105C78] text-white" : "border border-[#105C78]/30 text-[#105C78]/50"
                  }`}
                >
                  {opsi.label}
                </span>
                <span className="text-sm font-normal text-[#105C78]">{opsi.teks}</span>
              </div>
            ))}
          </div>

          <div
            className={`absolute right-5 -bottom-3 hidden max-w-56 items-start gap-2.5 rounded-[6px] border ${hairline} bg-white p-3 shadow-[0_4px_16px_rgba(16,92,120,0.12)] sm:flex`}
          >
            <Save className="mt-0.5 size-4 shrink-0 text-[#105C78]" aria-hidden />
            <div>
              <p className="text-xs font-medium text-[#105C78]">Jawaban tersimpan otomatis</p>
              <p className="mt-0.5 text-xs font-normal text-[#105C78]/60">Tersimpan beberapa detik lalu</p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute inset-x-0 -bottom-6 mx-auto flex w-fit gap-1 rounded-full border ${hairline} bg-white p-1`}
      >
        {contohSubtes.map((s, i) => (
          <button
            key={s.nama}
            type="button"
            onClick={() => setAktif(i)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:text-sm ${
              i === aktif ? "bg-[#105C78] text-white" : "text-[#105C78]/70 hover:text-[#105C78]"
            }`}
          >
            {s.nama}
          </button>
        ))}
      </div>
    </div>
  );
}

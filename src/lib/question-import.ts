/**
 * Pembacaan soal dari JSON dan bentuk soal baru yang diterima Server Action.
 * Berdiri di luar `admin.ts` karena file `"use server"` hanya boleh mengekspor
 * fungsi async, dan agar parser-nya dapat diuji tanpa database.
 */

import { z } from "zod";

import { OPTION_LABELS } from "./question-input";

/** Bentuk yang sudah siap disimpan; kategori sudah berupa id, bukan kode. */
export const soalBaruSchema = z.object({
  categoryId: z.string().min(1, "kategori wajib dipilih"),
  prompt: z.string().trim().min(5, "pertanyaan minimal 5 karakter"),
  explanation: z.string().trim().min(1, "pembahasan wajib diisi"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  options: z
    .array(z.object({ content: z.string().trim().min(1), isCorrect: z.boolean() }))
    .min(2, "butuh minimal dua pilihan")
    .max(OPTION_LABELS.length, `maksimal ${OPTION_LABELS.length} pilihan`),
});

export type SoalBaru = z.infer<typeof soalBaruSchema>;

/**
 * Bentuk JSON yang diminta dari penyusun soal atau model AI. Memakai istilah
 * Indonesia karena itu yang dibaca manusia saat menyusun promptnya.
 */
const jsonSchema = z.array(
  z.object({
    kategori: z.string().trim().min(1),
    tingkat: z.enum(["easy", "medium", "hard"]).default("medium"),
    pertanyaan: z.string().trim().min(1),
    pembahasan: z.string().trim().min(1),
    opsi: z.array(z.string().trim().min(1)).min(2).max(OPTION_LABELS.length),
    benar: z.union([z.number().int(), z.string().trim().min(1)]),
  }),
);

/**
 * Menerjemahkan `benar` menjadi indeks pilihan. Nomor urut (1) dan label huruf
 * ("B") dua-duanya diterima: keluaran model berganti-ganti di antara keduanya,
 * dan menolak salah satunya hanya menciptakan impor gagal yang tidak perlu.
 */
function indeksBenar(benar: number | string, jumlah: number) {
  if (typeof benar === "number") {
    return benar >= 1 && benar <= jumlah ? benar - 1 : -1;
  }

  const huruf = OPTION_LABELS.indexOf(benar.trim().toUpperCase());
  if (huruf >= 0 && huruf < jumlah) return huruf;

  const angka = Number(benar);
  return Number.isInteger(angka) && angka >= 1 && angka <= jumlah ? angka - 1 : -1;
}

/**
 * Masalah pertama pada satu soal, atau null bila lengkap. Dipakai pratinjau di
 * peramban dan pemeriksaan di server, sehingga aturannya tidak bisa berbeda
 * antara yang dilihat admin dan yang benar-benar disimpan.
 *
 * Berbeda dari formulir satuan, penyimpanan massal menuntut soal yang sudah
 * utuh: yang diimpor adalah keluaran jadi, bukan coretan setengah jalan.
 */
export function masalahSoal(soal: unknown): string | null {
  const parsed = soalBaruSchema.safeParse(soal);
  if (!parsed.success) return parsed.error.issues[0].message;

  if (parsed.data.options.filter((o) => o.isCorrect).length !== 1) {
    return "pilih tepat satu jawaban benar";
  }

  return null;
}

export type HasilBaca = {
  soal: SoalBaru[];
  /** Satu pesan per soal yang ditolak; soal lain tetap terbaca. */
  galat: string[];
};

/**
 * Membaca teks JSON menjadi daftar soal. Soal yang bermasalah dilaporkan per
 * nomor dan tidak menggugurkan sisanya — impor 50 soal tidak layak batal hanya
 * karena satu kode kategori salah ketik.
 *
 * `kategori` memetakan kode kategori ke id.
 */
export function bacaJson(teks: string, kategori: Map<string, string>): HasilBaca {
  let mentah: unknown;
  try {
    mentah = JSON.parse(teks);
  } catch {
    return { soal: [], galat: ["Teksnya bukan JSON yang sah."] };
  }

  // Satu objek tunggal ikut diterima; model kadang mengembalikannya tanpa array.
  const parsed = jsonSchema.safeParse(Array.isArray(mentah) ? mentah : [mentah]);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const nomor = typeof issue.path[0] === "number" ? `Soal ${issue.path[0] + 1}: ` : "";
    return { soal: [], galat: [`${nomor}${issue.path.slice(1).join(".")} ${issue.message}`.trim()] };
  }

  const soal: SoalBaru[] = [];
  const galat: string[] = [];

  parsed.data.forEach((baris, i) => {
    const categoryId = kategori.get(baris.kategori.trim().toUpperCase());
    if (!categoryId) {
      galat.push(`Soal ${i + 1}: kategori "${baris.kategori}" tidak ada di bank soal.`);
      return;
    }

    const benar = indeksBenar(baris.benar, baris.opsi.length);
    if (benar < 0) {
      galat.push(`Soal ${i + 1}: kunci jawaban "${baris.benar}" tidak menunjuk salah satu pilihan.`);
      return;
    }

    soal.push({
      categoryId,
      prompt: baris.pertanyaan,
      explanation: baris.pembahasan,
      difficulty: baris.tingkat,
      options: baris.opsi.map((content, urutan) => ({ content, isCorrect: urutan === benar })),
    });
  });

  return { soal, galat };
}

/** Contoh yang ditempel admin ke prompt AI-nya. */
export const CONTOH_JSON = `[
  {
    "kategori": "TIU",
    "tingkat": "medium",
    "pertanyaan": "Jika 3x + 6 = 21, berapakah nilai x?",
    "pembahasan": "3x = 21 - 6 = 15, sehingga x = 5.",
    "opsi": ["3", "4", "5", "6"],
    "benar": "C"
  }
]`;

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getResult } from "@/lib/attempt";

import {
  PapanHasil,
  type SoalHasil,
  type SubtesHasil,
} from "../../../_components/papan-hasil";

export const metadata: Metadata = { title: "Hasil sesi" };

// Hasil dibaca ulang setiap permintaan: subtes bisa saja baru tertutup karena
// waktunya habis tepat sebelum halaman ini dibuka.
export const dynamic = "force-dynamic";

const tanggal = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
});

/**
 * Label pendek untuk sumbu radar. Nama subtes panjang membuat sumbunya
 * bertumpuk, jadi nama beberapa kata disingkat jadi inisialnya — "Tes Wawasan
 * Kebangsaan" menjadi "TWK".
 *
 * ponytail: murni tebakan dari bentuk namanya. Kalau nanti subtes perlu label
 * pendek yang benar-benar terkendali, tambahkan kolomnya di tabel subtes.
 */
function singkatkan(nama: string) {
  const kata = nama.split(/\s+/).filter(Boolean);
  if (kata.length < 2) return nama.slice(0, 12);
  return kata
    .map((k) => k[0])
    .join("")
    .toUpperCase()
    .slice(0, 5);
}

export default async function HasilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hasil = await getResult(id);

  if (!hasil) {
    notFound();
  }

  // Sesi yang belum tuntas tidak punya hasil, dan kuncinya belum boleh terbaca.
  if (!hasil.selesai) {
    redirect(`/peserta/simulasi/${id}`);
  }

  const { attempt, subtes, total } = hasil;

  // Nomor soal dibuat berurut untuk seluruh sesi, bukan per subtes, supaya peta
  // jawaban dan panel pembahasan menunjuk soal yang sama.
  let urut = 0;
  const papan: SubtesHasil[] = subtes.map((s) => ({
    testSubtestId: s.testSubtestId,
    nama: s.name,
    singkat: singkatkan(s.name),
    benar: s.benar,
    salah: s.salah,
    kosong: s.kosong,
    skor: s.skor,
    maksimal: s.maksimal,
    soal: s.soal.map((q): SoalHasil => ({
      assignmentId: q.assignmentId,
      nomor: ++urut,
      subtes: s.name,
      prompt: q.prompt,
      weight: q.weight,
      dijawab: q.dijawab,
      isCorrect: q.isCorrect,
      selectedOptionId: q.selectedOptionId,
      options: q.options.map((o) => ({
        id: o.id,
        label: o.label,
        content: o.content,
        isCorrect: o.isCorrect,
      })),
      explanation: q.explanation,
    })),
  }));

  const durasi = subtes.reduce((n, s) => n + s.durationSeconds, 0);

  // Waktu terpakai dijumlahkan per subtes, bukan diambil dari rentang mulai
  // sampai kumpul: di antara dua subtes ada jeda yang bukan waktu mengerjakan.
  // Subtes yang tertutup karena waktunya habis dihitung sepenuh jatahnya.
  const tercatat = subtes.map((s) =>
    s.startedAt && s.submittedAt
      ? Math.round((s.submittedAt.getTime() - s.startedAt.getTime()) / 1000)
      : s.startedAt
        ? s.durationSeconds
        : null,
  );
  const terpakai = tercatat.includes(null)
    ? null
    : tercatat.reduce((n: number, d) => n + (d ?? 0), 0);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 pt-5 sm:p-6 sm:pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-brand/60">Hasil sesi</p>
          <h1 className="mt-1 text-2xl leading-snug font-medium tracking-[-0.01em] text-brand">
            {attempt.testName}
          </h1>
        </div>
        {attempt.submittedAt && (
          <p className="text-xs font-normal text-brand/50">
            Dikumpulkan {tanggal.format(attempt.submittedAt)}
            {attempt.status === "submitted_by_timeout" && " karena waktu habis"}
          </p>
        )}
      </div>

      <div className="mt-5">
        <PapanHasil
          subtes={papan}
          total={total}
          durasi={durasi}
          terpakai={terpakai}
        />
      </div>
    </div>
  );
}

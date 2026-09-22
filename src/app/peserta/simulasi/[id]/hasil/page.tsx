import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getResult } from "@/lib/attempt";
import { labelSubtes } from "@/lib/format";

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
  // Waktu terpakai tiap subtes dihitung dari jam server. Subtes yang tertutup
  // karena waktunya habis dihitung sepenuh jatahnya, dan yang belum pernah
  // dibuka tidak punya angka sama sekali.
  const tercatat = subtes.map((s) =>
    s.startedAt && s.submittedAt
      ? Math.round((s.submittedAt.getTime() - s.startedAt.getTime()) / 1000)
      : s.startedAt
        ? s.durationSeconds
        : null,
  );

  let urut = 0;
  // Label sumbu disiapkan sekaligus supaya dua subtes tidak berakhir dengan
  // singkatan yang sama — "Kesamaan Dasar" dan "Ketelitian Dasar" keduanya "KD".
  const singkat = labelSubtes(subtes.map((s) => s.name));

  const papan: SubtesHasil[] = subtes.map((s, i) => ({
    testSubtestId: s.testSubtestId,
    nama: s.name,
    singkat: singkat[i],
    benar: s.benar,
    salah: s.salah,
    kosong: s.kosong,
    skor: s.skor,
    maksimal: s.maksimal,
    detik: tercatat[i],
    jatah: s.durationSeconds,
    soal: s.soal.map((q): SoalHasil => ({
      assignmentId: q.assignmentId,
      nomor: ++urut,
      subtes: s.name,
      prompt: q.prompt,
      weight: q.weight,
      dijawab: q.dijawab,
      isCorrect: q.isCorrect,
      detik: q.detik,
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

  // Dijumlahkan per subtes, bukan diambil dari rentang mulai sampai kumpul: di
  // antara dua subtes ada jeda yang bukan waktu mengerjakan.
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

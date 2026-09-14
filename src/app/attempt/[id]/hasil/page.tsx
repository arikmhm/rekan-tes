import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getResult } from "@/lib/attempt";

import { SiteShell } from "../../../_components/site-shell";

export const metadata: Metadata = { title: "Hasil sesi" };

// Hasil dibaca ulang setiap permintaan: subtes bisa saja baru tertutup karena
// waktunya habis tepat sebelum halaman ini dibuka.
export const dynamic = "force-dynamic";

const tanggal = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" });

export default async function HasilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hasil = await getResult(id);

  if (!hasil) {
    notFound();
  }

  // Sesi yang belum tuntas tidak punya hasil, dan kuncinya belum boleh terbaca.
  if (!hasil.selesai) {
    redirect(`/attempt/${id}`);
  }

  const { attempt, subtes, total } = hasil;

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-sm font-bold text-brand">Hasil sesi</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {attempt.testName}
        </h1>
        {attempt.submittedAt && (
          <p className="mt-3 text-sm text-muted-foreground">
            Dikumpulkan {tanggal.format(attempt.submittedAt)}
            {attempt.status === "submitted_by_timeout" && " karena waktu habis"}.
          </p>
        )}

        <div className="mt-8 rounded-3xl border border-brand/15 bg-mint/60 p-7">
          <p className="text-sm font-semibold text-brand-dark">Skor akhir</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-brand-dark">
            {total.skor}
            <span className="text-xl text-brand-dark/60"> / {total.maksimal}</span>
          </p>
          <dl className="mt-6 grid grid-cols-3 gap-3">
            {[
              ["Benar", total.benar],
              ["Salah", total.salah],
              ["Kosong", total.kosong],
            ].map(([label, nilai]) => (
              <div key={label} className="rounded-2xl bg-white p-4 text-center">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-xl font-semibold">{nilai}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs leading-5 text-brand-dark/70">
            Skor adalah jumlah bobot soal yang dijawab benar. Jawaban salah dan kosong bernilai nol,
            tanpa pengurangan nilai. Perbandingan dengan peserta lain belum ditampilkan karena data
            pembandingnya belum memadai.
          </p>
        </div>

        <h2 className="mt-12 text-lg font-semibold">Skor per subtes</h2>
        <ul className="mt-4 space-y-3">
          {subtes.map((s) => (
            <li
              key={s.testSubtestId}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-black/8 bg-white p-5"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint font-mono text-xs font-semibold text-brand-dark">
                {String(s.position).padStart(2, "0")}
              </span>
              <div className="min-w-45 flex-1">
                <p className="font-semibold">{s.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s.benar} benar · {s.salah} salah · {s.kosong} kosong
                </p>
              </div>
              <p className="text-lg font-semibold text-brand-dark">
                {s.skor}
                <span className="text-sm text-muted-foreground"> / {s.maksimal}</span>
              </p>
            </li>
          ))}
        </ul>

        <h2 className="mt-12 text-lg font-semibold">Pembahasan</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Jawabanmu dibandingkan dengan kunci yang berlaku saat sesi ini dikerjakan.
        </p>

        {subtes.map((s) => (
          <section key={s.testSubtestId} className="mt-8">
            <h3 className="text-sm font-bold text-brand">{s.name}</h3>

            <ol className="mt-4 space-y-4">
              {s.soal.map((q) => (
                <li key={q.assignmentId} className="rounded-3xl border border-black/8 bg-white p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Soal {q.nomor} · bobot {q.weight}
                    </p>
                    <Tanda dijawab={q.dijawab} benar={q.isCorrect === true} />
                  </div>

                  <p className="mt-3 text-base leading-7 whitespace-pre-line">{q.prompt}</p>

                  <ul className="mt-4 space-y-2">
                    {q.options.map((o) => {
                      const dipilih = o.id === q.selectedOptionId;

                      return (
                        <li
                          key={o.id}
                          className={`flex items-start gap-3 rounded-2xl border p-3 text-sm ${
                            o.isCorrect
                              ? "border-brand/40 bg-mint/50"
                              : dipilih
                                ? "border-red-200 bg-red-50"
                                : "border-black/8"
                          }`}
                        >
                          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-cream text-xs font-bold">
                            {o.label}
                          </span>
                          <span className="flex-1 leading-6">{o.content}</span>
                          <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                            {o.isCorrect && "kunci"}
                            {dipilih && !o.isCorrect && "pilihanmu"}
                            {dipilih && o.isCorrect && " · pilihanmu"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-4 rounded-2xl bg-cream/60 p-4">
                    <p className="text-xs font-semibold text-muted-foreground">Pembahasan</p>
                    <p className="mt-2 text-sm leading-7 whitespace-pre-line">{q.explanation}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}

        <Link
          href="/peserta"
          className="mt-12 inline-block text-sm font-semibold text-brand hover:text-brand-dark"
        >
          Kembali ke dashboard
        </Link>
      </div>
    </SiteShell>
  );
}

/** Penanda ringkas per soal; warna saja tidak cukup untuk pembaca layar. */
function Tanda({ dijawab, benar }: { dijawab: boolean; benar: boolean }) {
  const [teks, kelas] = !dijawab
    ? ["Kosong", "bg-cream text-muted-foreground"]
    : benar
      ? ["Benar", "bg-mint text-brand-dark"]
      : ["Salah", "bg-red-50 text-red-700"];

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${kelas}`}>{teks}</span>;
}

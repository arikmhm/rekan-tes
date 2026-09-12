import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonClass } from "@/app/_components/form";
import { getTest, listSubtests, moveTestSubtest, removeAssignment, removeTestSubtest } from "@/lib/admin";

import { AdminShell, StatusBadge } from "../../_components/shell";
import {
  AddAssignmentForm,
  AddSubtestForm,
  SubtestConfigForm,
} from "../../_components/test-config";
import { TestForm } from "../../_components/test-form";

export const metadata: Metadata = { title: "Sunting tes" };

export default async function TesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tes, semuaSubtes] = await Promise.all([getTest(id), listSubtests()]);

  if (!tes) {
    notFound();
  }

  const terpakai = new Set(tes.subtests.map((s) => s.subtestId));
  const tersedia = semuaSubtes.filter((s) => !terpakai.has(s.id) && s.status !== "archived");

  return (
    <AdminShell
      title="Sunting tes"
      description="Tes hanya dapat diterbitkan bila setiap subtes memiliki soal terbit yang cukup dan sekategori."
      action={<StatusBadge status={tes.status} />}
    >
      {tes.locked && (
        <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900/80">
          Tes ini sudah pernah dikerjakan. Susunan subtes dan soalnya dibekukan agar hasil attempt
          lama tetap dapat dibaca; nama, deskripsi, harga, dan status masih dapat diperbarui.
        </p>
      )}

      <div className="rounded-2xl border border-black/8 bg-white p-6">
        <TestForm tes={tes} />
      </div>

      <h2 className="mt-10 text-lg font-semibold">Subtes dalam tes ini</h2>

      {tes.subtests.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-black/12 p-8 text-center text-sm text-muted">
          Belum ada subtes. Tambahkan minimal satu subtes sebelum menerbitkan tes.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {tes.subtests.map((s, index) => (
            <li key={s.id}>
              <details className="rounded-2xl border border-black/8 bg-white">
                <summary className="flex cursor-pointer flex-wrap items-center gap-3 p-5">
                  <span className="font-mono text-sm text-muted">#{s.position}</span>
                  <code className="rounded-lg bg-cream px-2 py-1 text-xs font-semibold">
                    {s.code}
                  </code>
                  <span className="font-semibold">{s.name}</span>
                  <StatusBadge status={s.subtestStatus} />
                  <span className="text-xs text-muted">
                    {Math.round(s.durationSeconds / 60)} menit
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      s.assignments.length >= s.questionLimit ? "text-brand-dark" : "text-amber-700"
                    }`}
                  >
                    {s.assignments.length}/{s.questionLimit} soal
                  </span>
                </summary>

                <div className="space-y-6 border-t border-black/8 p-5">
                  {tes.locked ? (
                    <p className="text-sm text-muted">
                      Durasi {Math.round(s.durationSeconds / 60)} menit, {s.questionLimit} soal.
                    </p>
                  ) : (
                    <>
                      <SubtestConfigForm
                        id={s.id}
                        durationSeconds={s.durationSeconds}
                        questionLimit={s.questionLimit}
                      />
                      <div className="flex flex-wrap gap-2">
                        <form action={moveTestSubtest}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="arah" value="naik" />
                          <button type="submit" disabled={index === 0} className={buttonClass}>
                            Naikkan urutan
                          </button>
                        </form>
                        <form action={moveTestSubtest}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="arah" value="turun" />
                          <button
                            type="submit"
                            disabled={index === tes.subtests.length - 1}
                            className={buttonClass}
                          >
                            Turunkan urutan
                          </button>
                        </form>
                        <form action={removeTestSubtest}>
                          <input type="hidden" name="id" value={s.id} />
                          <button type="submit" className={buttonClass}>
                            Keluarkan dari tes
                          </button>
                        </form>
                      </div>
                    </>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold">Soal yang ditugaskan</h3>
                    {s.assignments.length === 0 ? (
                      <p className="mt-2 text-sm text-muted">Belum ada soal.</p>
                    ) : (
                      <ul className="mt-2 divide-y divide-black/6">
                        {s.assignments.map((a) => (
                          <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                            <span className="font-mono text-xs text-muted">#{a.position}</span>
                            <Link
                              href={`/admin/soal/${a.questionId}`}
                              className="min-w-0 flex-1 truncate text-sm hover:underline"
                            >
                              {a.prompt}
                            </Link>
                            <span className="text-xs text-muted">bobot {a.weight}</span>
                            {(a.status !== "published" || a.categoryId !== s.categoryId) && (
                              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                                {a.status !== "published" ? a.status : "beda kategori"}
                              </span>
                            )}
                            {!tes.locked && (
                              <form action={removeAssignment}>
                                <input type="hidden" name="id" value={a.id} />
                                <button type="submit" className="text-xs font-semibold text-red-700">
                                  Hapus
                                </button>
                              </form>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {!tes.locked && (
                    <AddAssignmentForm testSubtestId={s.id} candidates={s.candidates} />
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      {!tes.locked && (
        <div className="mt-6 rounded-2xl border border-black/8 bg-white p-6">
          <h2 className="font-semibold">Tambah subtes ke tes</h2>
          {tersedia.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              Semua subtes yang tersedia sudah dipakai di tes ini.{" "}
              <Link href="/admin/subtes" className="font-semibold hover:underline">
                Buat subtes baru
              </Link>
              .
            </p>
          ) : (
            <div className="mt-4">
              <AddSubtestForm testId={tes.id} pilihan={tersedia} />
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}

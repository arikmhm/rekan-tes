import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getTest,
  listSubtests,
  moveTestSubtest,
  removeAssignment,
  removeTestSubtest,
} from "@/lib/admin";
import { formatDuration } from "@/lib/format";

import { AdminShell, EmptyState, StatusBadge } from "../../_components/shell";
import { AddAssignmentForm, AddSubtestForm, SubtestConfigForm } from "../../_components/test-config";
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
  const soalKurang = tes.subtests.some((s) => s.assignments.length < s.questionLimit);

  return (
    <AdminShell
      title={tes.name}
      description="Tes hanya dapat diterbitkan bila setiap subtes memiliki soal terbit yang cukup dan sekategori."
      action={
        <div className="flex items-center gap-3">
          <StatusBadge status={tes.status} />
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/tes" />}>
            Kembali
          </Button>
        </div>
      }
    >
      {tes.locked && (
        <Alert className="mb-6 border-amber-300 bg-amber-50 text-amber-900">
          <AlertTitle>Tes ini sudah pernah dikerjakan</AlertTitle>
          <AlertDescription className="text-amber-900/80">
            Susunan subtes dan soalnya dibekukan agar hasil attempt lama tetap dapat dibaca. Nama,
            deskripsi, harga, dan status masih dapat diperbarui.
          </AlertDescription>
        </Alert>
      )}

      {!tes.locked && tes.status !== "published" && soalKurang && (
        <Alert className="mb-6">
          <AlertTitle>Belum siap terbit</AlertTitle>
          <AlertDescription>
            Masih ada subtes yang jumlah soalnya kurang dari target. Lengkapi dulu sebelum mengubah
            status menjadi published.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi produk</CardTitle>
        </CardHeader>
        <CardContent>
          <TestForm tes={tes} />
        </CardContent>
      </Card>

      <h2 className="mt-8 text-lg font-semibold">Subtes dalam tes ini</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Urutan di bawah adalah urutan pengerjaan peserta.
      </p>

      {tes.subtests.length === 0 ? (
        <div className="mt-4">
          <EmptyState>
            Belum ada subtes. Tambahkan minimal satu subtes sebelum menerbitkan tes.
          </EmptyState>
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {tes.subtests.map((s, index) => {
            const cukup = s.assignments.length >= s.questionLimit;

            return (
              <details key={s.id} className="group bg-card rounded-xl border">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4 hover:bg-muted/40">
                  <span className="bg-muted grid size-7 shrink-0 place-items-center rounded-md font-mono text-xs font-semibold">
                    {s.position}
                  </span>
                  <span className="font-medium">{s.name}</span>
                  <code className="text-muted-foreground font-mono text-xs">{s.code}</code>
                  <StatusBadge status={s.subtestStatus} />
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      {formatDuration(s.durationSeconds)}
                    </span>
                    <Badge variant={cukup ? "default" : "destructive"}>
                      {s.assignments.length}/{s.questionLimit} soal
                    </Badge>
                  </div>
                </summary>

                <div className="grid gap-5 border-t p-4">
                  {tes.locked ? (
                    <p className="text-muted-foreground text-sm">
                      Durasi {formatDuration(s.durationSeconds)}, {s.questionLimit} soal.
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
                          <Button type="submit" variant="ghost" size="sm" disabled={index === 0}>
                            ↑ Naikkan
                          </Button>
                        </form>
                        <form action={moveTestSubtest}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="arah" value="turun" />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            disabled={index === tes.subtests.length - 1}
                          >
                            ↓ Turunkan
                          </Button>
                        </form>
                        <form action={removeTestSubtest}>
                          <input type="hidden" name="id" value={s.id} />
                          <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                            Keluarkan dari tes
                          </Button>
                        </form>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold">Soal yang ditugaskan</h3>
                    {s.assignments.length === 0 ? (
                      <p className="text-muted-foreground mt-2 text-sm">Belum ada soal.</p>
                    ) : (
                      <ul className="mt-2 divide-y">
                        {s.assignments.map((a) => (
                          <li key={a.id} className="flex flex-wrap items-center gap-3 py-2.5">
                            <span className="text-muted-foreground w-6 shrink-0 font-mono text-xs">
                              {a.position}
                            </span>
                            <Link
                              href={`/admin/soal/${a.questionId}`}
                              className="min-w-0 flex-1 truncate text-sm hover:underline"
                            >
                              {a.prompt}
                            </Link>
                            <span className="text-muted-foreground text-xs">bobot {a.weight}</span>
                            {(a.status !== "published" || a.categoryId !== s.categoryId) && (
                              <Badge variant="destructive">
                                {a.status !== "published" ? a.status : "beda kategori"}
                              </Badge>
                            )}
                            {!tes.locked && (
                              <form action={removeAssignment}>
                                <input type="hidden" name="id" value={a.id} />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                >
                                  Hapus
                                </Button>
                              </form>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {!tes.locked && (
                    <AddAssignmentForm
                      testSubtestId={s.id}
                      candidates={s.candidates}
                      kurang={Math.max(0, s.questionLimit - s.assignments.length)}
                    />
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}

      {!tes.locked && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Tambah subtes ke tes</CardTitle>
          </CardHeader>
          <CardContent>
            {tersedia.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Semua subtes yang tersedia sudah dipakai di tes ini.{" "}
                <Link href="/admin/subtes" className="text-primary font-medium hover:underline">
                  Buat subtes baru
                </Link>
                .
              </p>
            ) : (
              <AddSubtestForm testId={tes.id} pilihan={tersedia} />
            )}
          </CardContent>
        </Card>
      )}
    </AdminShell>
  );
}

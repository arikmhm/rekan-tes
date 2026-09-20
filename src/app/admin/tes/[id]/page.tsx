import { Check, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTest,
  listSubtests,
  moveTestSubtest,
  removeAssignment,
  removeTestSubtest,
} from "@/lib/admin";
import { formatDuration, formatPrice } from "@/lib/format";

import { AdminShell, EmptyState, StatusBadge } from "../../_components/shell";
import { AddAssignmentForm, AddSubtestForm, SubtestConfigForm } from "../../_components/test-config";
import { TestForm } from "../../_components/test-form";
import { FormulirTerbit } from "../_components/formulir-terbit";
import { StepperTes } from "../_components/stepper-tes";

export const metadata: Metadata = { title: "Sunting tes" };

export default async function TesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tes, semuaSubtes] = await Promise.all([getTest(id), listSubtests()]);

  if (!tes) {
    notFound();
  }

  const terpakai = new Set(tes.subtests.map((s) => s.subtestId));
  const tersedia = semuaSubtes.filter((s) => !terpakai.has(s.id) && s.status !== "archived");

  const adaSubtes = tes.subtests.length > 0;
  const soalLengkap = adaSubtes && tes.subtests.every((s) => s.assignments.length >= s.questionLimit);
  const subtesTerbit = adaSubtes && tes.subtests.every((s) => s.subtestStatus === "published");
  const terbit = tes.status === "published";

  // Langkah dibuka pada pekerjaan yang benar-benar tersisa, bukan selalu dari
  // awal: menyunting produk yang sudah jadi hampir selalu soal menerbitkan.
  const awal = !adaSubtes ? 2 : !soalLengkap ? 3 : terbit ? 1 : 4;

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
        <Alert className="border-amber-300 bg-amber-50 text-amber-900">
          <AlertTitle>Tes ini sudah pernah dikerjakan</AlertTitle>
          <AlertDescription className="text-amber-900/80">
            Susunan subtes dan soalnya dibekukan agar hasil attempt lama tetap dapat dibaca. Nama,
            deskripsi, harga, dan status masih dapat diperbarui.
          </AlertDescription>
        </Alert>
      )}

      <StepperTes
        awal={awal}
        langkah={[
          {
            judul: "Informasi",
            selesai: true,
            isi: (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informasi produk</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Nama, alamat halaman, dan harga yang dilihat calon pembeli.
                  </p>
                </CardHeader>
                <CardContent>
                  <TestForm tes={tes} />
                </CardContent>
              </Card>
            ),
          },
          {
            judul: "Subtes",
            selesai: adaSubtes,
            isi: (
              <>
                <p className="text-muted-foreground text-sm">
                  Urutan di bawah adalah urutan pengerjaan peserta.
                </p>

                {!adaSubtes ? (
                  <EmptyState>
                    Belum ada subtes. Tambahkan minimal satu sebelum mengisi soal.
                  </EmptyState>
                ) : (
                  tes.subtests.map((s, index) => (
                    <Card key={s.id}>
                      <CardContent className="grid gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="bg-muted grid size-7 shrink-0 place-items-center rounded-md font-mono text-xs font-semibold">
                            {s.position}
                          </span>
                          <span className="font-medium">{s.name}</span>
                          <code className="text-muted-foreground font-mono text-xs">{s.code}</code>
                          <StatusBadge status={s.subtestStatus} />
                          <span className="text-muted-foreground ml-auto text-xs">
                            {formatDuration(s.durationSeconds)}
                          </span>
                        </div>

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
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  disabled={index === 0}
                                >
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
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                >
                                  Keluarkan dari tes
                                </Button>
                              </form>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}

                {!tes.locked && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Tambah subtes ke tes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {tersedia.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          Semua subtes yang tersedia sudah dipakai di tes ini.{" "}
                          <Link
                            href="/admin/subtes"
                            className="text-primary font-medium hover:underline"
                          >
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
              </>
            ),
          },
          {
            judul: "Soal",
            selesai: soalLengkap,
            isi: !adaSubtes ? (
              <EmptyState>
                Soal ditugaskan per subtes, jadi tambahkan subtesnya lebih dulu di langkah 2.
              </EmptyState>
            ) : (
              <>
                {tes.subtests.map((s) => {
                  const cukup = s.assignments.length >= s.questionLimit;

                  return (
                    <details key={s.id} open={!cukup} className="bg-card rounded-xl border">
                      <summary className="hover:bg-muted/40 flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
                        <span className="bg-muted grid size-7 shrink-0 place-items-center rounded-md font-mono text-xs font-semibold">
                          {s.position}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium">{s.name}</span>
                        <Badge variant={cukup ? "default" : "destructive"}>
                          {s.assignments.length}/{s.questionLimit} soal
                        </Badge>
                      </summary>

                      <div className="grid gap-5 border-t p-4">
                        {s.assignments.length === 0 ? (
                          <p className="text-muted-foreground text-sm">Belum ada soal.</p>
                        ) : (
                          <ul className="divide-y">
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
                                <span className="text-muted-foreground text-xs">
                                  bobot {a.weight}
                                </span>
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
              </>
            ),
          },
          {
            judul: "Terbit",
            selesai: terbit,
            isi: (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tinjau sebelum terbit</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Syarat di bawah diperiksa ulang server saat status diubah, jadi produk tidak
                    pernah sempat terbit dalam keadaan setengah jadi.
                  </p>
                </CardHeader>
                <CardContent className="grid gap-5">
                  <ul className="grid gap-2">
                    <Syarat ok={adaSubtes}>Punya minimal satu subtes</Syarat>
                    <Syarat ok={soalLengkap}>Setiap subtes memenuhi target soalnya</Syarat>
                    <Syarat ok={subtesTerbit}>Semua subtes berstatus published</Syarat>
                  </ul>

                  <dl className="text-muted-foreground grid gap-1 text-sm">
                    <Ringkas label="Harga">{formatPrice(tes.priceAmount)}</Ringkas>
                    <Ringkas label="Subtes">{tes.subtests.length}</Ringkas>
                    <Ringkas label="Soal">
                      {tes.subtests.reduce((n, s) => n + s.questionLimit, 0)}
                    </Ringkas>
                    <Ringkas label="Durasi">
                      {formatDuration(tes.subtests.reduce((n, s) => n + s.durationSeconds, 0))}
                    </Ringkas>
                  </dl>

                  {terbit ? (
                    <>
                      <p className="text-sm">
                        Produk ini tampil di{" "}
                        <Link
                          href={`/produk/${tes.slug}`}
                          className="text-primary font-medium hover:underline"
                        >
                          /produk/{tes.slug}
                        </Link>
                        .
                      </p>
                      <FormulirTerbit
                        tes={tes}
                        tujuan="draft"
                        label="Tarik dari etalase"
                        variant="outline"
                      />
                    </>
                  ) : (
                    <FormulirTerbit tes={tes} tujuan="published" label="Terbitkan produk" />
                  )}
                </CardContent>
              </Card>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}

function Syarat({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {ok ? (
        <Check className="size-4 text-emerald-600" />
      ) : (
        <X className="text-destructive size-4" />
      )}
      <span className={ok ? "" : "text-muted-foreground"}>{children}</span>
    </li>
  );
}

function Ringkas({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{label}</dt>
      <dd className="text-foreground font-medium">{children}</dd>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listCategories, listQuestions } from "@/lib/admin";

import { AdminShell, EmptyState, StatusBadge } from "../_components/shell";

export const metadata: Metadata = { title: "Bank soal" };

/** Filter memakai form GET biasa, sehingga hasilnya bisa dibagikan lewat URL. */
export default async function SoalPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; status?: string; difficulty?: string; q?: string }>;
}) {
  const filter = await searchParams;
  const [kategori, soal] = await Promise.all([listCategories(), listQuestions(filter)]);
  const adaFilter = Boolean(filter.q || filter.categoryId || filter.status || filter.difficulty);

  return (
    <AdminShell
      title="Bank soal"
      description="Soal berdiri independen dari tes. Satu soal dapat dipakai di banyak tes tanpa diduplikasi."
      action={
        <Button nativeButton={false} render={<Link href="/admin/soal/baru" />}>Soal baru</Button>
      }
    >
      <Card>
        <CardContent>
          <form method="get" className="flex flex-wrap items-end gap-3">
            <div className="grid min-w-52 flex-1 gap-2">
              <Label htmlFor="q">Cari pertanyaan</Label>
              <Input id="q" name="q" defaultValue={filter.q ?? ""} placeholder="kata kunci" />
            </div>
            <div className="grid w-36 gap-2">
              <Label htmlFor="categoryId">Kategori</Label>
              <SelectNative id="categoryId" name="categoryId" defaultValue={filter.categoryId ?? ""}>
                <option value="">Semua</option>
                {kategori.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.code}
                  </option>
                ))}
              </SelectNative>
            </div>
            <div className="grid w-36 gap-2">
              <Label htmlFor="status">Status</Label>
              <SelectNative id="status" name="status" defaultValue={filter.status ?? ""}>
                <option value="">Semua</option>
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </SelectNative>
            </div>
            <div className="grid w-36 gap-2">
              <Label htmlFor="difficulty">Kesulitan</Label>
              <SelectNative id="difficulty" name="difficulty" defaultValue={filter.difficulty ?? ""}>
                <option value="">Semua</option>
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </SelectNative>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="outline">
                Terapkan
              </Button>
              {adaFilter && (
                <Button variant="ghost" nativeButton={false} render={<Link href="/admin/soal" />}>
                  Reset
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {soal.length === 0 ? (
        <div className="mt-6">
          <EmptyState>
            {kategori.length === 0
              ? "Buat kategori lebih dulu sebelum menambah soal."
              : "Tidak ada soal yang cocok dengan filter ini."}
          </EmptyState>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground mt-6 mb-2 text-sm">{soal.length} soal</p>
          <div className="bg-card overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Kategori</TableHead>
                  <TableHead>Pertanyaan</TableHead>
                  <TableHead className="w-24">Kesulitan</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {soal.map((s) => (
                  <TableRow key={s.id} className="hover:bg-muted/40">
                    <TableCell>
                      <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
                        {s.categoryCode}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <Link href={`/admin/soal/${s.id}`} className="block truncate hover:underline">
                        {s.prompt}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{s.difficulty}</TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </AdminShell>
  );
}

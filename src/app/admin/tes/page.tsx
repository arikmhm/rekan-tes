import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listTests } from "@/lib/admin";
import { formatPrice } from "@/lib/format";

import { AdminShell, EmptyState, StatusBadge } from "../_components/shell";
import { TestForm } from "../_components/test-form";

export const metadata: Metadata = { title: "Produk tes" };

export default async function TesPage() {
  const tes = await listTests();

  return (
    <AdminShell
      title="Produk tes"
      description="Produk tes menyusun subtes menjadi satu simulasi yang dijual. Susunan subtes dan soalnya diatur pada halaman detail."
    >
      {tes.length === 0 ? (
        <EmptyState>Belum ada produk tes. Buat yang pertama di formulir bawah.</EmptyState>
      ) : (
        <div className="bg-card overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="w-28">Harga</TableHead>
                <TableHead className="w-20">Subtes</TableHead>
                <TableHead className="w-28">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tes.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Link href={`/admin/tes/${t.id}`} className="font-medium hover:underline">
                      {t.name}
                    </Link>
                    <p className="text-muted-foreground font-mono text-xs">/tes/{t.slug}</p>
                  </TableCell>
                  <TableCell className="text-sm">{formatPrice(t.priceAmount)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{t.subtestCount}</TableCell>
                  <TableCell>
                    <StatusBadge status={t.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Tes baru</CardTitle>
          <p className="text-muted-foreground text-sm">
            Simpan sebagai draft dulu, lalu susun subtesnya sebelum menerbitkan.
          </p>
        </CardHeader>
        <CardContent>
          <TestForm />
        </CardContent>
      </Card>
    </AdminShell>
  );
}

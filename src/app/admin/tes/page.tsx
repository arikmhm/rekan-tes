import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listTests } from "@/lib/admin";
import { formatPrice } from "@/lib/format";

import { AdminShell, EmptyState, StatusBadge } from "../_components/shell";

export const metadata: Metadata = { title: "Produk tes" };

export default async function TesPage() {
  const tes = await listTests();

  return (
    <AdminShell
      title="Produk tes"
      description="Produk tes menyusun subtes menjadi satu simulasi yang dijual. Susunan subtes dan soalnya diatur pada halaman detail."
      action={
        <Button nativeButton={false} render={<Link href="/admin/tes/baru" />}>
          Produk baru
        </Button>
      }
    >
      {tes.length === 0 ? (
        <EmptyState>Belum ada produk tes. Mulai dari tombol &ldquo;Produk baru&rdquo;.</EmptyState>
      ) : (
        <div className="bg-card overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="w-28">Harga</TableHead>
                <TableHead className="w-20">Subtes</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tes.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Link href={`/admin/tes/${t.id}`} className="font-medium hover:underline">
                      {t.name}
                    </Link>
                    <p className="text-muted-foreground font-mono text-xs">/produk/{t.slug}</p>
                  </TableCell>
                  <TableCell className="text-sm">{formatPrice(t.priceAmount)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{t.subtestCount}</TableCell>
                  <TableCell>
                    <StatusBadge status={t.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Mencoba produk seperti peserta, tanpa menyimpan apa pun. */}
                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={<Link href={`/pratinjau/${t.id}`} />}
                    >
                      Coba
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminShell>
  );
}

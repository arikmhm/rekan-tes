import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listOrdersForAdmin } from "@/lib/admin-order";
import { formatPrice } from "@/lib/format";

import { AdminShell, EmptyState, OrderBadge } from "../_components/shell";

export const metadata: Metadata = { title: "Pesanan" };

const tanggal = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

export default async function PesananPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const filter = await searchParams;
  const pesanan = await listOrdersForAdmin(filter);
  const adaFilter = Boolean(filter.q || filter.status);

  return (
    <AdminShell
      title="Pesanan"
      description="Cari pesanan peserta untuk menelusuri pembayaran dan sesi pengerjaannya. Penggantian akses dilakukan dari halaman detail."
    >
      <Card>
        <CardContent>
          <form method="get" className="flex flex-wrap items-end gap-3">
            <div className="grid min-w-64 flex-1 gap-2">
              <Label htmlFor="q">Cari</Label>
              <Input
                id="q"
                name="q"
                defaultValue={filter.q ?? ""}
                placeholder="username, email, nomor invoice, atau id pesanan"
              />
            </div>
            <div className="grid w-40 gap-2">
              <Label htmlFor="status">Status</Label>
              <SelectNative id="status" name="status" defaultValue={filter.status ?? ""}>
                <option value="">Semua</option>
                {["pending", "paid", "expired", "cancelled", "refunded"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectNative>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="outline">
                Terapkan
              </Button>
              {adaFilter && (
                <Button variant="ghost" nativeButton={false} render={<Link href="/admin/pesanan" />}>
                  Reset
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {pesanan.length === 0 ? (
        <EmptyState>
          {adaFilter
            ? "Tidak ada pesanan yang cocok dengan pencarian ini."
            : "Belum ada pesanan yang masuk."}
        </EmptyState>
      ) : (
        <Card>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Peserta</TableHead>
                  <TableHead>Tes</TableHead>
                  <TableHead>Nilai</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sesi</TableHead>
                  <TableHead>Dibuat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pesanan.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link
                        href={`/admin/pesanan/${p.id}`}
                        className="font-medium hover:underline"
                      >
                        {p.username ?? p.email}
                      </Link>
                      <p className="text-muted-foreground text-xs">{p.email}</p>
                    </TableCell>
                    <TableCell className="text-sm">{p.testName}</TableCell>
                    <TableCell className="text-sm">
                      {formatPrice(p.amount)}
                      {p.grantedBy && (
                        <Badge variant="secondary" className="ml-2">
                          pengganti
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <OrderBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {p.attemptStatus ?? "—"}
                      {p.finalScore != null && ` · ${p.finalScore}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {tanggal.format(p.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </AdminShell>
  );
}

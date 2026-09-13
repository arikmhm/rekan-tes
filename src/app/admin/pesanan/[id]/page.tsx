import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrderForAdmin } from "@/lib/admin-order";
import { formatPrice } from "@/lib/format";
import { orderPaymentMismatch } from "@/lib/order-consistency";

import { GrantAccessForm } from "../../_components/grant-access-form";
import { AdminShell, EmptyState, OrderBadge } from "../../_components/shell";

export const metadata: Metadata = { title: "Detail pesanan" };

const tanggal = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

export default async function PesananDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderForAdmin(id);

  if (!order) {
    notFound();
  }

  const selisih = orderPaymentMismatch(order, order.payments);

  return (
    <AdminShell
      title={order.username ?? order.email}
      description={`Pesanan ${order.testName}`}
      action={
        <div className="flex items-center gap-3">
          <OrderBadge status={order.status} />
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/pesanan" />}>
            Kembali
          </Button>
        </div>
      }
    >
      {selisih && (
        <Alert variant="destructive">
          <AlertTitle>Status pesanan tidak cocok dengan pembayarannya</AlertTitle>
          <AlertDescription>
            {selisih} Status tidak diperbaiki otomatis agar penyebabnya bisa diperiksa dulu.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Baris label="Id">
              <code className="text-xs">{order.id}</code>
            </Baris>
            <Baris label="Peserta">
              {order.username ?? "—"} · {order.email}
            </Baris>
            <Baris label="Tes">{order.testName}</Baris>
            <Baris label="Nilai">{formatPrice(order.amount)}</Baris>
            <Baris label="Dibuat">{tanggal.format(order.createdAt)}</Baris>
            <Baris label="Masa akses">
              {order.accessExpiresAt ? tanggal.format(order.accessExpiresAt) : "—"}
            </Baris>
            {order.grantedBy && (
              <>
                <Baris label="Diberikan admin">{order.pemberi ?? order.grantedBy}</Baris>
                <Baris label="Alasan">{order.grantReason}</Baris>
                <Baris label="Menggantikan">
                  {order.replacesOrderId ? (
                    <Link
                      href={`/admin/pesanan/${order.replacesOrderId}`}
                      className="font-medium hover:underline"
                    >
                      <code className="text-xs">{order.replacesOrderId}</code>
                    </Link>
                  ) : (
                    "—"
                  )}
                </Baris>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sesi pengerjaan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {order.attempt ? (
              <>
                <Baris label="Status">{order.attempt.status}</Baris>
                <Baris label="Dimulai">
                  {order.attempt.startedAt ? tanggal.format(order.attempt.startedAt) : "—"}
                </Baris>
                <Baris label="Dikumpulkan">
                  {order.attempt.submittedAt ? tanggal.format(order.attempt.submittedAt) : "—"}
                </Baris>
                <Baris label="Skor akhir">{order.attempt.finalScore ?? "—"}</Baris>
              </>
            ) : (
              <p className="text-muted-foreground">
                Belum ada sesi. Attempt dibuat otomatis begitu pembayaran diterima.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Percobaan pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {order.payments.length === 0 ? (
            <div className="px-6">
              <EmptyState>Belum ada percobaan pembayaran untuk pesanan ini.</EmptyState>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Nilai</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibayar</TableHead>
                  <TableHead>Dibuat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <code className="text-xs">{p.externalId}</code>
                      <p className="text-muted-foreground text-xs">{p.provider}</p>
                    </TableCell>
                    <TableCell className="text-sm">{formatPrice(p.amount)}</TableCell>
                    <TableCell>
                      <OrderBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {p.paidAt ? tanggal.format(p.paidAt) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {tanggal.format(p.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Penggantian akses</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          {order.pengganti.length > 0 && (
            <div className="grid gap-2">
              <p className="text-sm font-medium">Sudah pernah diberikan pengganti</p>
              {order.pengganti.map((g) => (
                <div key={g.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/pesanan/${g.id}`} className="font-medium hover:underline">
                      <code className="text-xs">{g.id}</code>
                    </Link>
                    <Badge variant="secondary">{tanggal.format(g.createdAt)}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-2 leading-6">{g.grantReason}</p>
                </div>
              ))}
            </div>
          )}

          <GrantAccessForm orderId={order.id} />
        </CardContent>
      </Card>
    </AdminShell>
  );
}

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] items-start gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

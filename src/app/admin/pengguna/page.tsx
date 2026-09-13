import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listUsersForAdmin } from "@/lib/admin-user";

import { AdminShell, EmptyState } from "../_components/shell";

export const metadata: Metadata = { title: "Pengguna" };

const tanggal = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

export default async function PenggunaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; verified?: string }>;
}) {
  const filter = await searchParams;
  const pengguna = await listUsersForAdmin(filter);
  const adaFilter = Boolean(filter.q || filter.role || filter.verified);

  return (
    <AdminShell
      title="Pengguna"
      description="Daftar akun beserta ringkasan pesanannya. Role diberikan lewat database, bukan dari panel ini, supaya hak admin tidak pernah bisa dinaikkan lewat antarmuka."
    >
      <Card>
        <CardContent>
          <form method="get" className="flex flex-wrap items-end gap-3">
            <div className="grid min-w-56 flex-1 gap-2">
              <Label htmlFor="q">Cari</Label>
              <Input id="q" name="q" defaultValue={filter.q ?? ""} placeholder="username atau email" />
            </div>
            <div className="grid w-40 gap-2">
              <Label htmlFor="role">Role</Label>
              <SelectNative id="role" name="role" defaultValue={filter.role ?? ""}>
                <option value="">Semua</option>
                <option value="participant">participant</option>
                <option value="admin">admin</option>
              </SelectNative>
            </div>
            <div className="grid w-40 gap-2">
              <Label htmlFor="verified">Email</Label>
              <SelectNative id="verified" name="verified" defaultValue={filter.verified ?? ""}>
                <option value="">Semua</option>
                <option value="sudah">Terverifikasi</option>
                <option value="belum">Belum verifikasi</option>
              </SelectNative>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="outline">
                Terapkan
              </Button>
              {adaFilter && (
                <Button variant="ghost" nativeButton={false} render={<Link href="/admin/pengguna" />}>
                  Reset
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {pengguna.length === 0 ? (
        <EmptyState>
          {adaFilter
            ? "Tidak ada pengguna yang cocok dengan pencarian ini."
            : "Belum ada pengguna terdaftar."}
        </EmptyState>
      ) : (
        <Card>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Pesanan</TableHead>
                  <TableHead>Sesi selesai</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead className="sr-only">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pengguna.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-medium">{u.username ?? "—"}</p>
                      <p className="text-muted-foreground text-xs">{u.email}</p>
                    </TableCell>
                    <TableCell>
                      {u.role === "admin" ? (
                        <Badge>admin</Badge>
                      ) : (
                        <Badge variant="secondary">participant</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.emailVerified ? (
                        <span className="text-muted-foreground text-sm">terverifikasi</span>
                      ) : (
                        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                          belum
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {u.totalOrder === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <>
                          {u.orderLunas} lunas
                          <span className="text-muted-foreground"> dari {u.totalOrder}</span>
                        </>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {u.sesiSelesai > 0 ? u.sesiSelesai : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {tanggal.format(u.createdAt)}
                      {u.orderTerakhir && (
                        <p>pesan terakhir {tanggal.format(new Date(u.orderTerakhir))}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {u.totalOrder > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          nativeButton={false}
                          render={
                            <Link
                              href={`/admin/pesanan?q=${encodeURIComponent(u.username ?? u.email)}`}
                            />
                          }
                        >
                          Lihat pesanan
                        </Button>
                      )}
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

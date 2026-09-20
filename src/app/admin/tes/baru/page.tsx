import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { AdminShell, EmptyState } from "../../_components/shell";
import { TestForm } from "../../_components/test-form";
import { StepperTes } from "../_components/stepper-tes";

export const metadata: Metadata = { title: "Produk baru" };

/**
 * Langkah pertama berdiri sendiri karena subtes dan soal menempel pada id tes;
 * keduanya baru bisa diisi setelah produknya tersimpan sebagai draft.
 */
export default function TesBaruPage() {
  const menyusul = (apa: string) => (
    <EmptyState>Simpan informasi produk lebih dulu, lalu {apa} di sini.</EmptyState>
  );

  return (
    <AdminShell
      title="Produk baru"
      description="Simpan sebagai draft dulu. Subtes, soal, dan penerbitannya menyusul di langkah berikutnya."
      action={
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/tes" />}>
          Kembali
        </Button>
      }
    >
      <StepperTes
        awal={1}
        langkah={[
          {
            judul: "Informasi",
            selesai: false,
            isi: (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informasi produk</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Nama, alamat halaman, dan harga yang dilihat calon pembeli.
                  </p>
                </CardHeader>
                <CardContent>
                  <TestForm />
                </CardContent>
              </Card>
            ),
          },
          { judul: "Subtes", selesai: false, nonaktif: true, isi: menyusul("susun subtesnya") },
          { judul: "Soal", selesai: false, nonaktif: true, isi: menyusul("tugaskan soalnya") },
          { judul: "Terbit", selesai: false, nonaktif: true, isi: menyusul("terbitkan produknya") },
        ]}
      />
    </AdminShell>
  );
}

import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/authz";
import { listBanners } from "@/lib/produk";

import { BannerForm, BannerRow } from "../_components/banner-form";
import { AdminShell, EmptyState } from "../_components/shell";

export const metadata: Metadata = { title: "Spanduk" };

export default async function SpandukPage() {
  // Daftarnya dibaca lewat fungsi publik, jadi guardnya dipasang di sini.
  await requireAdmin();
  const spanduk = await listBanners();

  return (
    <AdminShell
      title="Spanduk"
      description="Korsel di kepala halaman produk. Unggah gambarnya ke penyimpanan objek, lalu tempel alamat publiknya di sini."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah spanduk</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <BannerForm />
          <p className="text-muted-foreground text-xs leading-5">
            Ukuran yang dipakai tata letaknya 1600 × 600 piksel. Gambar yang
            nisbahnya berbeda tetap tampil, tetapi sisinya akan terpotong.
          </p>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-2.5">
        {spanduk.map((s, index) => (
          <BannerRow
            key={s.id}
            spanduk={s}
            pertama={index === 0}
            terakhir={index === spanduk.length - 1}
          />
        ))}
      </div>

      {spanduk.length === 0 && (
        <div className="mt-6">
          <EmptyState>
            Belum ada spanduk. Selama kosong, halaman produk menampilkan bidang
            kosong bergaris putus-putus sebagai gantinya.
          </EmptyState>
        </div>
      )}
    </AdminShell>
  );
}

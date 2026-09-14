import { redirect } from "next/navigation";

/**
 * Etalase produk tinggal di halaman depan ruang peserta, jadi URL ini hanya
 * mengantar ke sana ketimbang menjadi salinan kedua daftar yang sama.
 */
export default function ProdukPage() {
  redirect("/peserta");
}

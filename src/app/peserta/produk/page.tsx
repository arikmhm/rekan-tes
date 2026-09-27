import { redirect } from "next/navigation";

/** Etalase tinggal di /peserta; URL ini hanya mengantar ke sana. */
export default function ProdukPage() {
  redirect("/peserta");
}

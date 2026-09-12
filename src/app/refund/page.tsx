import type { Metadata } from "next";

import { ACCESS_DAYS } from "@/lib/catalog";

import { KONTAK, LegalDoc, TERAKHIR_DIPERBARUI } from "../_components/site-shell";

export const metadata: Metadata = {
  title: "Kebijakan refund",
  description:
    "Kapan pembelian sesi Rekan Tes dapat dikembalikan, kapan diganti akses baru, dan cara mengajukannya.",
};

export default function RefundPage() {
  return (
    <LegalDoc title="Kebijakan refund" updated={TERAKHIR_DIPERBARUI}>
      <p>
        Sesi simulasi adalah produk digital yang langsung dapat dipakai setelah pembayaran berhasil.
        Karena itu pengembalian dana hanya berlaku pada keadaan tertentu yang dijelaskan di bawah.
      </p>

      <h2>Dana dikembalikan penuh</h2>
      <ul>
        <li>Pembayaran terpotong lebih dari satu kali untuk order yang sama.</li>
        <li>Dana terpotong tetapi hak akses tidak pernah diberikan.</li>
        <li>
          Sesi tidak dapat diakses sama sekali sepanjang masa akses karena kesalahan di pihak kami.
        </li>
        <li>Produk yang kamu beli ditarik oleh kami sebelum kamu sempat mengerjakannya.</li>
      </ul>

      <h2>Dana tidak dikembalikan</h2>
      <ul>
        <li>Pengerjaan sudah dimulai, berapa pun soal yang sempat dikerjakan.</li>
        <li>
          Masa akses {ACCESS_DAYS} hari berakhir tanpa kamu memulai sesi, termasuk karena lupa atau
          berhalangan.
        </li>
        <li>Skor tidak sesuai harapan, atau isi soal dinilai kurang cocok setelah dikerjakan.</li>
        <li>Kendala pada perangkat, peramban, atau koneksi internet di sisi kamu.</li>
        <li>Akun ditangguhkan karena melanggar syarat layanan.</li>
      </ul>

      <h2>Penggantian akses untuk kendala teknis</h2>
      <p>
        Bila sesi terganggu karena kesalahan sistem kami, misalnya jawaban gagal tersimpan atau
        waktu terpotong di luar kewajaran, penyelesaian utamanya adalah penggantian akses: kami
        memberikan hak pengerjaan baru setelah admin memverifikasi kejadiannya. Hasil sesi
        sebelumnya tidak dihapus dan sesi lama tidak dihidupkan ulang, sehingga riwayatmu tetap
        utuh. Penggantian akses tidak mengurangi hakmu meminta pengembalian dana bila kondisinya
        memenuhi bagian pertama halaman ini.
      </p>

      <h2>Cara mengajukan</h2>
      <p>
        Kirim email ke {KONTAK} paling lambat 7 hari setelah kejadian, dari alamat email yang
        terdaftar pada akunmu. Sertakan username, nama produk tes, perkiraan tanggal dan jam
        kejadian, serta penjelasan singkat. Tangkapan layar sangat membantu, tetapi jangan pernah
        mengirimkan password atau data kartu.
      </p>

      <h2>Proses dan waktu</h2>
      <p>
        Kami memverifikasi permintaan paling lama 5 hari kerja dan mengabarkan hasilnya lewat email.
        Bila disetujui, dana dikembalikan melalui penyedia pembayaran ke metode yang kamu pakai saat
        membeli. Waktu dana benar-benar diterima bergantung pada bank atau penerbit metode
        pembayaran tersebut, umumnya beberapa hari kerja setelah kami memproses.
      </p>

      <h2>Perubahan kebijakan</h2>
      <p>
        Kebijakan ini dapat diperbarui. Permintaan yang sudah masuk diproses memakai kebijakan yang
        berlaku pada saat pembelian.
      </p>
    </LegalDoc>
  );
}

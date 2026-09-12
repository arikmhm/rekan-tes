import type { Metadata } from "next";
import Link from "next/link";

import { ACCESS_DAYS } from "@/lib/catalog";

import { KONTAK, LegalDoc, TERAKHIR_DIPERBARUI } from "../_components/site-shell";

export const metadata: Metadata = {
  title: "Syarat layanan",
  description: "Ketentuan pemakaian Rekan Tes: akun, pembelian, pengerjaan, dan batasan konten.",
};

export default function SyaratPage() {
  return (
    <LegalDoc title="Syarat layanan" updated={TERAKHIR_DIPERBARUI}>
      <p>
        Dengan membuat akun atau membeli sesi di Rekan Tes, kamu menyetujui ketentuan di halaman
        ini. Bacalah sebelum melakukan pembayaran.
      </p>

      <h2>Sifat layanan</h2>
      <p>
        Rekan Tes menjual sesi latihan simulasi tes kerja. Kami adalah penyedia latihan independen:
        tidak berafiliasi, bermitra, atau mewakili bank maupun penyelenggara rekrutmen mana pun.
        Soal kami adalah latihan yang disusun sendiri, bukan salinan soal tes resmi. Membeli dan
        mengerjakan simulasi tidak memberi keuntungan apa pun dalam proses seleksi dan tidak
        menjamin kelulusan.
      </p>

      <h2>Akun</h2>
      <ul>
        <li>Satu akun dipakai satu orang. Jangan membagikan kredensial kepada orang lain.</li>
        <li>Data yang kamu daftarkan harus benar dan alamat email harus dapat kamu akses.</li>
        <li>Email wajib diverifikasi sebelum kamu dapat melakukan pembelian.</li>
        <li>Kamu bertanggung jawab atas seluruh aktivitas yang terjadi lewat akunmu.</li>
      </ul>

      <h2>Pembelian dan masa akses</h2>
      <ul>
        <li>Satu pembelian memberikan satu kali pengerjaan untuk satu produk tes.</li>
        <li>
          Harga yang berlaku adalah harga yang ditampilkan saat checkout dan dikunci pada order
          tersebut, meski harga katalog berubah kemudian.
        </li>
        <li>
          Akses berlaku {ACCESS_DAYS} hari sejak pembayaran berhasil. Setelah itu sesi yang belum
          dimulai hangus.
        </li>
        <li>
          Pembayaran diproses penyedia pembayaran pihak ketiga. Status pembayaran yang kami akui
          adalah notifikasi resmi dari penyedia tersebut, bukan tampilan halaman setelah redirect.
        </li>
      </ul>

      <h2>Pengerjaan</h2>
      <ul>
        <li>Subtes dikerjakan berurutan dan setiap subtes memiliki batas waktunya sendiri.</li>
        <li>
          Waktu dihitung dari jam server dan terus berjalan meski peramban ditutup atau koneksi
          terputus.
        </li>
        <li>Subtes dikumpulkan otomatis ketika waktunya habis.</li>
        <li>Subtes yang sudah dikumpulkan tidak dapat dibuka kembali.</li>
        <li>
          Jawaban disimpan otomatis selama sesi aktif. Pastikan koneksimu memadai sebelum memulai.
        </li>
      </ul>

      <h2>Konten dan pemakaian yang dilarang</h2>
      <p>
        Soal, pilihan jawaban, dan pembahasan adalah milik Rekan Tes. Kamu boleh memakainya untuk
        latihan pribadi, tetapi dilarang menyalin, merekam, mengunduh massal, menyebarkan, atau
        memperjualbelikannya. Dilarang pula mengakses sistem di luar antarmuka yang disediakan,
        mengganggu jalannya layanan, atau memakai akun orang lain. Pelanggaran dapat berujung pada
        penangguhan akun tanpa pengembalian dana.
      </p>

      <h2>Ketersediaan layanan</h2>
      <p>
        Kami berusaha menjaga layanan tetap tersedia, tetapi tidak menjanjikan bebas gangguan.
        Pemeliharaan dan gangguan teknis dapat terjadi. Bila gangguan dari pihak kami membuat sesi
        gagal dikerjakan, berlaku{" "}
        <Link className="font-semibold text-brand-dark hover:underline" href="/refund">
          kebijakan refund
        </Link>
        .
      </p>

      <h2>Batasan tanggung jawab</h2>
      <p>
        Layanan disediakan apa adanya untuk keperluan latihan. Kami tidak bertanggung jawab atas
        hasil seleksi kerja, keputusan yang kamu ambil berdasarkan skor latihan, atau kerugian tidak
        langsung yang timbul dari pemakaian layanan. Tanggung jawab kami dibatasi paling banyak
        sebesar nominal yang kamu bayarkan untuk sesi terkait.
      </p>

      <h2>Perubahan</h2>
      <p>
        Syarat ini dapat diperbarui seiring perkembangan layanan. Tanggal pembaruan tercantum di
        atas. Pembelian yang sudah berjalan tetap tunduk pada syarat saat pembelian dilakukan.
      </p>

      <h2>Kontak dan hukum yang berlaku</h2>
      <p>
        Pertanyaan mengenai syarat ini dapat dikirim ke {KONTAK}. Ketentuan ini tunduk pada hukum
        yang berlaku di Republik Indonesia.
      </p>
    </LegalDoc>
  );
}

import type { Metadata } from "next";

import { KONTAK, LegalDoc, TERAKHIR_DIPERBARUI } from "../_components/site-shell";

export const metadata: Metadata = {
  title: "Kebijakan privasi",
  description: "Data yang dikumpulkan Rekan Tes, tujuan pemakaiannya, dan cara mengelolanya.",
};

export default function PrivasiPage() {
  return (
    <LegalDoc title="Kebijakan privasi" updated={TERAKHIR_DIPERBARUI}>
      <p>
        Rekan Tes adalah platform latihan simulasi tes kerja yang berdiri sendiri dan tidak
        berafiliasi dengan penyelenggara rekrutmen mana pun. Halaman ini menjelaskan data yang kami
        kumpulkan saat kamu memakai layanan, alasan kami menyimpannya, dan pilihan yang kamu miliki
        atas data tersebut.
      </p>

      <h2>Data yang kami kumpulkan</h2>
      <ul>
        <li>
          <strong>Data akun:</strong> nama, username, dan alamat email. Password tidak pernah
          disimpan dalam bentuk aslinya, hanya sebagai hash.
        </li>
        <li>
          <strong>Data pengerjaan:</strong> jawaban yang kamu pilih, waktu mulai dan submit setiap
          subtes, serta skor yang dihitung dari jawaban tersebut.
        </li>
        <li>
          <strong>Data transaksi:</strong> produk yang dibeli, nominal, status pembayaran, dan masa
          akses. Nomor kartu, nomor rekening, dan kredensial pembayaran lain tidak pernah masuk ke
          sistem kami; seluruhnya ditangani penyedia pembayaran.
        </li>
        <li>
          <strong>Data teknis:</strong> log permintaan seperti alamat IP, jenis peramban, dan waktu
          akses, yang muncul otomatis saat layanan dijalankan.
        </li>
      </ul>

      <h2>Tujuan pemakaian</h2>
      <p>
        Data dipakai untuk menjalankan akun dan sesi tes, memproses pembayaran serta memberikan hak
        akses, menampilkan hasil dan pembahasan, menjawab pertanyaan atau keluhan, dan menjaga
        layanan dari penyalahgunaan. Kami tidak memakai data untuk profiling di luar kebutuhan
        tersebut dan tidak menjual data kepada siapa pun.
      </p>

      <h2>Pihak ketiga yang memproses data</h2>
      <ul>
        <li>Penyedia hosting dan basis data untuk menyimpan serta menjalankan layanan.</li>
        <li>Penyedia email untuk mengirim verifikasi akun dan tautan reset password.</li>
        <li>
          Penyedia pembayaran untuk memproses transaksi dan mengirimkan notifikasi status
          pembayaran.
        </li>
      </ul>
      <p>
        Masing-masing hanya menerima data yang dibutuhkan untuk fungsinya dan terikat kebijakan
        privasinya sendiri.
      </p>

      <h2>Cookie</h2>
      <p>
        Kami memakai cookie untuk menjaga sesi login. Tanpa cookie tersebut kamu akan keluar setiap
        berpindah halaman. Kami tidak memasang cookie iklan atau pelacak pihak ketiga.
      </p>

      <h2>Penyimpanan dan retensi</h2>
      <p>
        Data akun, hasil tes, dan pembahasan disimpan selama akunmu masih ada. Catatan transaksi
        disimpan lebih lama karena dibutuhkan untuk pembukuan dan penyelesaian sengketa pembayaran.
        Ketika akun dihapus, hasil tes ikut dihapus sementara catatan transaksi disimpan tanpa
        dikaitkan dengan identitasmu.
      </p>

      <h2>Hak kamu</h2>
      <p>
        Kamu dapat meminta salinan, koreksi, atau penghapusan data pribadimu dengan mengirim email
        dari alamat yang terdaftar ke {KONTAK}. Permintaan diproses dalam waktu wajar, kecuali
        data tersebut wajib kami simpan untuk kepentingan hukum atau pembukuan.
      </p>

      <h2>Keamanan</h2>
      <p>
        Password disimpan sebagai hash, seluruh lalu lintas dienkripsi, dan data hasil serta
        transaksi hanya dapat dibaca pemiliknya. Tidak ada sistem yang sepenuhnya bebas risiko, jadi
        jaga kerahasiaan passwordmu dan segera hubungi kami bila melihat aktivitas mencurigakan.
      </p>

      <h2>Perubahan kebijakan</h2>
      <p>
        Kebijakan ini dapat diperbarui bila layanan berubah. Tanggal pembaruan terakhir tercantum di
        atas, dan perubahan yang berdampak besar akan diberitahukan lewat email.
      </p>
    </LegalDoc>
  );
}

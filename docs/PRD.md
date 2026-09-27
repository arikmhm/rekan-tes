# Product Requirements — Rekan Tes

Simulasi tes masuk kerja perbankan, B2C, dibayar per sesi. Peserta memilih tes, membayar satu sesi, mengerjakan subtes berurutan dengan batas waktu, lalu menerima hasil dan pembahasan. Admin menyusun tes dari bank soal yang dipakai ulang lintas tes. Alur per aktor ada di [USECASE.md](./USECASE.md).

Rekan Tes adalah latihan independen: pembayaran di sini bukan biaya rekrutmen bank dan tidak menjamin diterima bekerja. Pernyataan itu tampil sebelum pembelian.

## Aturan produk

### Akses dan pembayaran

- Satu pembelian = satu attempt untuk satu produk tes, berlaku 30 hari setelah pembayaran berhasil. Mengulang berarti membeli sesi baru.
- Login memakai username dan password; email wajib terverifikasi sebelum membeli.
- Harga, subtes, jumlah soal, dan estimasi durasi terlihat sebelum membeli. Order mengunci harga saat checkout.
- Pembayaran memakai QRIS lewat DOKU tanpa meninggalkan aplikasi. Order aktif hanya setelah DOKU mengonfirmasi pembayaran di server, dan konfirmasi berulang tidak memberi attempt kedua.
- Kebijakan privasi, syarat layanan, dan refund tersedia sebelum pembayaran.
- Admin dapat memberi penggantian akses setelah kendala teknis tervalidasi, tanpa menghapus hasil lama.

### Konten

- Kategori awal: Numerical, Verbal, Logical and Figural, Accuracy and Attention, English, dan Banking Knowledge.
- Soal single-choice dengan tepat satu jawaban benar, satu kategori, dan tidak dimiliki tes mana pun; soal masuk tes lewat assignment ke subtes berkategori sama.
- Tes hanya dapat diterbitkan jika setiap subtes memiliki cukup soal yang valid.
- Soal atau tes yang sudah pernah dikerjakan tidak diubah secara substantif, supaya hasil lama tetap sah.

### Pengerjaan dan hasil

- Petunjuk dibaca sebelum timer dimulai. Subtes dikerjakan berurutan; subtes yang sudah dikumpulkan tidak bisa dibuka lagi.
- Timer memakai waktu server dan tetap berjalan saat browser ditutup. Subtes dikumpulkan otomatis ketika waktu habis.
- Jawaban tersimpan otomatis dan pulih setelah reload. Kegagalan menyimpan harus terlihat, tidak boleh diam-diam menghilangkan jawaban.
- Jawaban benar mendapat bobot assignment; salah atau kosong bernilai nol, tanpa pengurangan.
- Hasil menampilkan skor akhir, skor per subtes, jumlah benar/salah/kosong, serta jawaban benar dan pembahasan tiap soal.
- Antarmuka peserta nyaman di ponsel dan koneksi tidak stabil. Data yang dikumpulkan dibatasi pada kebutuhan akun, transaksi, dan pengerjaan.

## Definisi selesai MVP

Tiga seam berikut lulus end-to-end, diuji dari batas aplikasi, bukan fungsi internal:

1. **Penyusunan dan publikasi tes:** hanya tes yang lengkap dan valid yang terbit.
2. **Pembelian dan pemberian akses:** peserta terverifikasi membayar, lalu menerima tepat satu attempt meskipun notifikasi dikirim ulang.
3. **Pengerjaan sampai hasil:** jawaban tersimpan, timer benar setelah reload, timeout mengumpulkan otomatis, dan skor mengikuti bobot.

Kasus wajib: peserta mengakses data peserta lain, non-admin mengubah konten, koneksi putus saat menyimpan, pembayaran kedaluwarsa, notifikasi duplikat, dan waktu habis sebelum jawaban terakhir tersimpan.

## Di luar cakupan

- Menjadi mitra resmi rekrutmen bank atau menjamin kelulusan.
- Diagnosis, psikogram, atau rekomendasi psikologis.
- Soal esai, isian numerik, multiple-answer, atau soal multi-kategori.
- Pengacakan dan snapshot susunan soal per attempt.
- Wawancara, LGD, proctoring, dan pemeriksaan kesehatan.
- Langganan, dompet kredit, atau paket multi-sesi.
- Produk B2B.
- Persentil sebelum data pembanding memadai.

## Metrik awal

- Registrasi yang menyelesaikan verifikasi email.
- Konversi detail produk → order → pembayaran berhasil.
- Attempt berbayar yang diselesaikan.
- Kegagalan autosave dan penggantian akses karena kendala teknis.
- Peserta yang membeli sesi kedua.

## Keputusan terbuka

Memblokir pengisian dan penjualan produk pertama.

| Keputusan | Rekomendasi awal |
|---|---|
| Nama final | Rekan Tes sebagai nama kerja |
| Produk pertama | Core Aptitude Perbankan |
| Harga sesi | Uji Rp19.000–Rp25.000 |
| Blueprint soal | Jumlah dan durasi ditetapkan bersama penyusun konten |

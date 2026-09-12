# Product Requirements Document — Rekan Tes

| Atribut | Nilai |
|---|---|
| Versi | 0.5 (Draft) |
| Tanggal | 20 Agustus 2026 |
| Fokus MVP | Simulasi tes masuk kerja perbankan |
| Model bisnis | B2C, pembayaran per sesi |
| Rancangan database | [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) |
| Keputusan teknis | [TECH_STACK.md](./TECH_STACK.md) |

## Problem Statement

Pencari kerja membutuhkan tempat latihan tes masuk perbankan yang menyerupai kondisi tes sebenarnya: terdiri dari beberapa subtes, memiliki batas waktu, menyimpan progres, dan memberikan hasil serta pembahasan. Materi yang tersedia sering tersebar, tidak terstruktur per kemampuan, atau tidak memberikan umpan balik yang cukup untuk mengetahui kelemahan peserta.

Pengelola platform juga membutuhkan bank soal yang mudah dicari dan digunakan kembali. Soal tidak boleh harus diduplikasi setiap kali tes baru dibuat, sementara setiap tes tetap perlu bebas menentukan kombinasi subtes, durasi, urutan, jumlah soal, dan bobotnya.

Pembayaran harus jelas terpisah dari proses rekrutmen resmi. Pengguna membayar sesi latihan di Rekan Tes, bukan membayar untuk melamar atau memperoleh jaminan diterima bekerja.

## Solution

Rekan Tes menyediakan katalog simulasi tes kerja dengan fokus awal perbankan. Pengguna membuat akun, memilih tes, membayar satu sesi, mengerjakan subtes secara berurutan, lalu menerima hasil dan pembahasan.

Admin mengelola kategori, bank soal, subtes, dan produk tes. Setiap soal memiliki satu kategori tetapi berdiri independen dari tes dan subtes. Admin menugaskan soal ke konfigurasi subtes sehingga soal yang sama dapat digunakan pada beberapa tes tanpa duplikasi.

MVP mendukung soal pilihan ganda dengan satu jawaban benar, pembayaran per sesi, satu attempt per order berbayar, timer berbasis waktu server, autosave, scoring objektif, dan laporan hasil per subtes.

## User Stories

### Peserta

1. Sebagai peserta, saya ingin mendaftar menggunakan username, email, dan password, sehingga saya dapat memiliki akun Rekan Tes.
2. Sebagai peserta, saya ingin memverifikasi email, sehingga akun dan transaksi saya terhubung ke alamat yang valid.
3. Sebagai peserta, saya ingin login, logout, dan mereset password, sehingga saya dapat mengakses akun dengan aman.
4. Sebagai peserta, saya ingin melihat katalog tes yang tersedia, sehingga saya dapat memilih latihan yang relevan.
5. Sebagai peserta, saya ingin melihat harga, subtes, jumlah soal, dan estimasi durasi sebelum membeli, sehingga saya memahami produk yang dibeli.
6. Sebagai peserta, saya ingin melihat pernyataan bahwa produk adalah simulasi independen, sehingga saya tidak menganggap pembayaran sebagai biaya rekrutmen bank.
7. Sebagai peserta, saya ingin membayar satu sesi tes melalui payment gateway, sehingga akses dapat diberikan otomatis setelah pembayaran berhasil.
8. Sebagai peserta, saya ingin melihat status pembayaran, sehingga saya mengetahui apakah akses tes sudah aktif.
9. Sebagai peserta, saya ingin harga order tetap sama setelah checkout, sehingga perubahan harga produk tidak mengubah transaksi saya.
10. Sebagai peserta, saya ingin satu order berbayar memberikan satu attempt, sehingga hak akses saya jelas.
11. Sebagai peserta, saya ingin memulai tes dalam masa akses yang ditentukan, sehingga saya tidak harus langsung mengerjakannya setelah membayar.
12. Sebagai peserta, saya ingin membaca petunjuk sebelum timer dimulai, sehingga saya memahami aturan pengerjaan.
13. Sebagai peserta, saya ingin mengerjakan subtes sesuai urutan, sehingga pengalaman tes konsisten.
14. Sebagai peserta, saya ingin melihat sisa waktu subtes, sehingga saya dapat mengatur kecepatan pengerjaan.
15. Sebagai peserta, saya ingin jawaban tersimpan otomatis, sehingga gangguan koneksi atau reload tidak menghilangkan progres.
16. Sebagai peserta, saya ingin melanjutkan attempt yang masih aktif, sehingga saya dapat pulih dari gangguan browser atau jaringan.
17. Sebagai peserta, saya ingin subtes dikumpulkan otomatis ketika waktu habis, sehingga batas waktu berlaku adil.
18. Sebagai peserta, saya ingin jawaban yang sudah disubmit tidak dapat diubah, sehingga hasil mencerminkan kondisi tes.
19. Sebagai peserta, saya ingin melihat nilai akhir dan nilai setiap subtes, sehingga saya mengetahui kemampuan umum dan area lemah.
20. Sebagai peserta, saya ingin melihat jumlah benar, salah, dan kosong, sehingga hasil mudah dipahami.
21. Sebagai peserta, saya ingin melihat pilihan saya, jawaban benar, dan pembahasan, sehingga saya dapat belajar dari kesalahan.
22. Sebagai peserta, saya ingin hanya dapat melihat order, attempt, dan hasil milik saya, sehingga data pribadi saya terlindungi.
23. Sebagai peserta, saya ingin membeli sesi baru untuk mengulang tes, sehingga model pembayaran tetap transparan tanpa langganan wajib.

### Admin

24. Sebagai admin, saya ingin mengelola kategori soal, sehingga bank soal mudah difilter.
25. Sebagai admin, saya ingin membuat soal beserta pilihan, jawaban benar, tingkat kesulitan, dan pembahasan, sehingga soal siap digunakan dalam tes.
26. Sebagai admin, saya ingin menerbitkan atau mengarsipkan soal, sehingga hanya konten yang layak yang dapat digunakan.
27. Sebagai admin, saya ingin membuat jenis subtes dengan kategori utama, sehingga pemilihan soal dapat difilter secara relevan.
28. Sebagai admin, saya ingin membuat produk tes dari beberapa subtes, sehingga setiap simulasi dapat memiliki struktur berbeda.
29. Sebagai admin, saya ingin mengatur urutan, durasi, jumlah soal, dan bobot pada subtes, sehingga karakter setiap tes dapat dikendalikan.
30. Sebagai admin, saya ingin menugaskan soal kategori relevan ke subtes, sehingga penyusunan tes cepat dan konsisten.
31. Sebagai admin, saya ingin menggunakan satu soal pada beberapa tes, sehingga saya tidak perlu menduplikasi bank soal.
32. Sebagai admin, saya ingin sistem menolak publikasi tes yang belum lengkap, sehingga peserta tidak membeli tes yang rusak.
33. Sebagai admin, saya ingin perubahan substantif pada soal historis dilakukan melalui duplikasi, sehingga hasil attempt lama tetap dapat dipercaya.
34. Sebagai admin, saya ingin melihat order, pembayaran, dan attempt, sehingga saya dapat menangani masalah operasional.
35. Sebagai admin, saya ingin memberikan penggantian akses setelah kendala teknis tervalidasi, sehingga peserta tidak dirugikan.

## Implementation Decisions

### Produk dan akses

- MVP adalah produk B2C dengan fokus simulasi tes perbankan.
- Satu pembelian memberikan satu attempt untuk satu produk tes.
- Masa akses awal direkomendasikan 30 hari setelah pembayaran berhasil.
- Role minimum adalah `participant` dan `admin`.
- Autentikasi menggunakan Better Auth; login memakai username dan password, sementara email wajib diverifikasi sebelum pembelian.

### Konten dan penyusunan tes

- Kategori awal: Numerical, Verbal, Logical and Figural, Accuracy and Attention, English, dan Banking Knowledge.
- Setiap soal memiliki tepat satu kategori utama.
- Setiap subtes memiliki satu kategori utama.
- Soal tidak dimiliki langsung oleh tes atau subtes; penggunaan soal ditentukan melalui assignment.
- Satu soal dapat memiliki beberapa assignment pada tes berbeda, tetapi tidak boleh muncul dua kali dalam konfigurasi subtes yang sama.
- MVP hanya mendukung soal single-choice dengan tepat satu jawaban benar.
- Konten memakai status `draft`, `published`, dan `archived`.
- Tes hanya dapat dipublikasikan jika setiap subtes memiliki soal yang cukup dan seluruh soal aktif valid.
- Soal yang sudah pernah dikerjakan tidak diubah secara substantif; admin menduplikasi soal lalu mengarsipkan versi lama.

### Pembayaran

- Order menyimpan harga saat checkout agar transaksi historis tidak berubah.
- Payment gateway menggunakan DOKU Checkout.
- Satu order dapat memiliki beberapa percobaan pembayaran.
- Hanya HTTP Notification DOKU dengan signature valid yang dapat mengaktifkan order.
- Pemrosesan notifikasi dan pemberian attempt harus idempotent.
- Redirect dari DOKU tidak dianggap sebagai bukti pembayaran.
- Status order minimum: `pending`, `paid`, `expired`, `cancelled`, dan `refunded`.

### Test engine dan scoring

- Tes terdiri dari subtes yang dikerjakan sesuai urutan.
- Timer dihitung menggunakan waktu server dan tidak berhenti ketika browser ditutup.
- Jawaban disimpan otomatis dan dapat dipulihkan selama attempt masih aktif.
- Peserta tidak dapat kembali ke subtes yang sudah disubmit.
- Subtes disubmit otomatis ketika waktu habis.
- Jawaban benar memperoleh bobot assignment; jawaban salah atau kosong bernilai nol.
- Tidak ada pengurangan nilai untuk jawaban salah pada MVP.
- Setelah seluruh subtes selesai, peserta dapat melihat skor akhir, skor per subtes, statistik jawaban, dan pembahasan.
- Persentil tidak ditampilkan sampai tersedia data pembanding yang cukup.

### Kualitas sistem

- Otorisasi admin, kepemilikan order, attempt, dan hasil diverifikasi di server.
- Autosave dan pemrosesan webhook harus aman ketika permintaan dikirim ulang.
- Antarmuka peserta harus nyaman digunakan pada perangkat seluler dan koneksi yang tidak stabil.
- Kegagalan autosave harus terlihat dan tidak boleh diam-diam menghilangkan jawaban.
- Data yang dikumpulkan dibatasi pada kebutuhan akun, transaksi, pengerjaan, dan operasional.
- Kebijakan privasi, syarat layanan, dan kebijakan refund tersedia sebelum pembayaran.

## Testing Decisions

Pengujian berfokus pada perilaku yang terlihat dari batas aplikasi, bukan bentuk tabel, fungsi internal, atau detail framework. Karena codebase belum memiliki implementasi maupun prior art pengujian, tiga seam tingkat tinggi berikut menjadi acuan awal:

1. **Penyusunan dan publikasi tes:** admin membuat kategori, soal reusable, subtes, dan tes; sistem hanya menerbitkan tes yang lengkap dan valid.
2. **Pembelian dan pemberian akses:** peserta terverifikasi membuat order, webhook tervalidasi menandai pembayaran berhasil, dan sistem memberikan tepat satu attempt meskipun webhook dikirim ulang.
3. **Pengerjaan sampai hasil:** peserta memulai tes, jawaban tersimpan, timer tetap benar setelah reload, timeout melakukan submit otomatis, dan hasil dihitung sesuai jawaban serta bobot.

Kasus keamanan wajib mencakup peserta yang mencoba mengakses data peserta lain dan pengguna non-admin yang mencoba mengubah konten. Kasus kegagalan wajib mencakup koneksi terputus saat autosave, pembayaran kedaluwarsa, webhook duplikat, reload saat timer berjalan, dan waktu habis sebelum jawaban terakhir tersimpan.

MVP dianggap selesai ketika ketiga seam tersebut lulus secara end-to-end pada jalur utama dan kasus kegagalan kritis.

Automasi MVP menggunakan Vitest pada logika bisnis dan integrasi server. Alur browser serta DOKU Sandbox diverifikasi melalui smoke test manual; Playwright tidak digunakan.

## Out of Scope

- Menjadi penyelenggara atau mitra resmi rekrutmen bank.
- Menjamin kelulusan peserta.
- Diagnosis, psikogram, atau rekomendasi psikologis profesional.
- Soal esai, jawaban numerik bebas, atau multiple-answer.
- Satu soal dengan banyak kategori.
- Pengacakan dan snapshot susunan soal per attempt.
- Wawancara video, LGD, proctoring, dan pemeriksaan kesehatan.
- Langganan, dompet kredit, atau paket multi-sesi.
- Produk B2B untuk perusahaan.
- Persentil sebelum data pembanding memadai.

## Further Notes

### Metrik awal

- Rasio registrasi yang menyelesaikan verifikasi email.
- Konversi detail tes menjadi order dan order menjadi pembayaran berhasil.
- Rasio attempt berbayar yang diselesaikan.
- Tingkat kegagalan autosave dan penggantian akses akibat kendala teknis.
- Rasio peserta yang membeli sesi kedua.

### Keputusan terbuka

| Keputusan | Rekomendasi awal |
|---|---|
| Nama final | Rekan Tes sebagai nama kerja |
| Produk pertama | Core Aptitude Perbankan |
| Harga sesi | Uji Rp19.000–Rp25.000 |
| Email provider | Resend |
| Penyimpanan gambar soal | Dipilih saat soal figural mulai diimplementasikan |
| Blueprint soal | Jumlah dan durasi ditetapkan bersama penyusun konten |
| Masa akses | 30 hari setelah pembayaran |
| Kendala teknis | Penggantian attempt setelah verifikasi admin |

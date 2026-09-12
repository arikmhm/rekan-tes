# Backlog Issues — Rekan Tes

Dokumen ini menerjemahkan [PRD](./PRD.md), [rancangan database](./DATABASE_DESIGN.md), dan [keputusan teknis](./TECH_STACK.md) menjadi urutan implementasi. Kerjakan dari atas ke bawah kecuali dependensi pada issue menyatakan lain.

## Cara memakai backlog

Status yang digunakan:

- `Done`: sudah tercermin di repository.
- `Next`: pekerjaan berikutnya yang dapat langsung dimulai.
- `Blocked`: membutuhkan keputusan atau akses eksternal.
- `Queued`: menunggu issue sebelumnya.

Satu issue dianggap selesai hanya jika acceptance criteria terpenuhi, lint dan build lulus, serta dokumen sumber ikut diperbarui ketika ada keputusan baru.

## Ringkasan urutan

| Urutan | ID | Pekerjaan | Status | Dependensi |
|---:|---|---|---|---|
| 0 | RT-000 | Fondasi App Router dan shell produk | Done | — |
| 1 | RT-001 | Environment, validasi, dan test runner | Done | RT-000 |
| 2 | RT-002 | Neon, Drizzle, schema, dan migrasi MVP | Next | RT-001 |
| 3 | RT-003 | Better Auth dan otorisasi dasar | Queued | RT-002 |
| 4 | RT-004 | Verifikasi email dan reset password | Blocked | RT-003, provider email |
| 5 | RT-005 | Admin kategori dan bank soal | Queued | RT-003 |
| 6 | RT-006 | Admin subtes, produk tes, dan publikasi | Queued | RT-005 |
| 7 | RT-007 | Katalog publik dan detail tes | Queued | RT-006 |
| 8 | RT-008 | Dokumen legal minimum | Queued | RT-007 |
| 9 | RT-009 | Order dan DOKU Checkout | Queued | RT-004, RT-007, RT-008 |
| 10 | RT-010 | Webhook DOKU dan pemberian attempt | Queued | RT-009 |
| 11 | RT-011 | Memulai attempt dan urutan subtes | Queued | RT-010 |
| 12 | RT-012 | Test engine, timer server, dan submit | Queued | RT-011 |
| 13 | RT-013 | Autosave dan pemulihan progres | Queued | RT-012 |
| 14 | RT-014 | Scoring, hasil, dan pembahasan | Queued | RT-013 |
| 15 | RT-015 | Operasional admin dan penggantian akses | Queued | RT-010, RT-014 |
| 16 | RT-016 | Hardening dan kesiapan rilis MVP | Queued | RT-001–RT-015 |

## Detail issues

### RT-000 — Fondasi App Router dan shell produk

**Status:** Done

**Tujuan:** Menghapus ketidaksesuaian antara scaffold generik dan identitas produk.

Acceptance criteria:

- Routing memakai `src/app`, root layout, dan Server Component sebagai default.
- Tailwind CSS aktif dari root layout tanpa dependency UI tambahan.
- Metadata, bahasa dokumen, halaman publik, dan disclaimer sesuai PRD.
- README dan status teknis mencerminkan kondisi repository yang sebenarnya.

### RT-001 — Environment, validasi, dan test runner

**Status:** Done

**Tujuan:** Menyiapkan batas minimum agar fitur server berikutnya dapat dikembangkan dan diperiksa.

Hasil implementasi:

- Zod 4 dan Vitest 5 terpasang; script `pnpm test` dan `pnpm test:watch` tersedia.
- `src/lib/env-schema.ts` memvalidasi environment server dan melempar pesan yang menyebut variabel bermasalah serta cara memperbaikinya.
- `src/lib/env.ts` mengekspor singleton `env` dan dijaga paket `server-only`.
- `.env.example` berisi template tanpa secret; `.gitignore` diberi `!.env.example` agar template ikut ter-commit sementara `.env*` lain tetap diabaikan.
- `src/lib/env-schema.test.ts` mencakup environment valid, variabel hilang, nilai kosong, dan connection string non-PostgreSQL.

Acceptance criteria:

- Aplikasi gagal lebih awal dengan pesan jelas ketika environment wajib tidak tersedia. Validasi berjalan saat modul server pertama mengimpor `env`, dimulai pada RT-002.
- `pnpm lint`, `pnpm test`, dan `pnpm build` dapat dijalankan lokal.
- Secret tidak pernah terekspos ke Client Component atau masuk version control. Diverifikasi dengan Client Component percobaan yang mengimpor `env`; `pnpm build` gagal dengan exit code bukan nol.

Catatan: schema hanya memuat `DATABASE_URL`. Variabel Better Auth, email, dan DOKU ditambahkan pada issue yang benar-benar memakainya, bukan lebih awal.

### RT-002 — Neon, Drizzle, schema, dan migrasi MVP

**Status:** Next

**Tujuan:** Membuat sumber data server sesuai `DATABASE_DESIGN.md`.

Scope:

- Pasang Drizzle ORM, Drizzle Kit, dan Neon serverless driver.
- Pakai tipe ID dan `weight` yang sudah ditetapkan di `DATABASE_DESIGN.md`: primary key `text` berisi UUID v4 dan `weight` integer default `1`.
- Muat `.env*` di luar runtime Next.js untuk konfigurasi Drizzle Kit menggunakan `@next/env`.
- Implementasikan enum/status, tabel domain, foreign key, unique constraint, check constraint, dan index minimum.
- Buat migrasi awal serta perintah generate/migrate.

Acceptance criteria:

- Migrasi dapat diterapkan ke database kosong dan menghasilkan schema yang terdokumentasi.
- Constraint mencegah assignment soal duplikat, attempt kedua untuk order yang sama, dan nominal negatif.
- Koneksi database hanya dibuat dari kode server.

### RT-003 — Better Auth dan otorisasi dasar

**Status:** Queued

**Tujuan:** Menyediakan registrasi, login username, logout, session, serta role peserta/admin.

Scope:

- Pasang Better Auth dan username plugin; hasilkan schema auth menggunakan CLI versi terpasang.
- Registrasi meminta username, email, password; `name` mengikuti username.
- Tambahkan halaman registrasi dan login serta Route Handler auth.
- Buat helper otorisasi server untuk session, kepemilikan resource, dan role admin.

Acceptance criteria:

- Username dan email unik, password tidak disimpan di tabel domain aplikasi.
- Role tidak dapat ditentukan atau diubah oleh peserta.
- Route admin menolak non-admin di server, bukan hanya menyembunyikan UI.
- Peserta tidak dapat membaca data peserta lain.

### RT-004 — Verifikasi email dan reset password

**Status:** Blocked

**Blocker:** Pilih provider transactional email dan siapkan kredensial pengembangan.

**Tujuan:** Menyelesaikan siklus akun sebelum pembelian diaktifkan.

Acceptance criteria:

- Email verifikasi dikirim setelah registrasi dan tautan kedaluwarsa dengan aman.
- Email belum terverifikasi tidak dapat membuat order.
- Permintaan reset password tidak membocorkan apakah email terdaftar.
- Token sekali pakai tidak dapat digunakan ulang setelah berhasil.

### RT-005 — Admin kategori dan bank soal

**Status:** Queued

**Tujuan:** Memungkinkan admin mengelola soal single-choice reusable.

Scope:

- CRUD kategori serta soal, pilihan, difficulty, explanation, dan status.
- Filter bank soal berdasarkan kategori, status, dan difficulty.
- Validasi publish: tepat satu jawaban benar dan pilihan valid.
- Cegah perubahan substantif pada soal yang sudah pernah dikerjakan; sediakan alur duplikasi.

Acceptance criteria:

- Non-admin ditolak pada seluruh mutasi server.
- Soal draft tidak dapat digunakan untuk tes terbit.
- Satu soal dapat digunakan kembali tanpa menyalin record soal.

### RT-006 — Admin subtes, produk tes, dan publikasi

**Status:** Queued

**Tujuan:** Menyusun produk tes dari subtes dan assignment soal.

Scope:

- CRUD subtes dan produk tes.
- Atur posisi, durasi, question limit, weight, dan assignment soal.
- Validasi kecocokan kategori soal dengan subtes.
- Validasi kelengkapan secara atomik saat publish.

Acceptance criteria:

- Posisi subtes dan soal unik dalam parent masing-masing.
- Produk tidak dapat terbit jika jumlah soal kurang atau mengandung konten tidak valid.
- Produk yang sudah memiliki attempt tidak kehilangan konfigurasi historis secara fisik.

### RT-007 — Katalog publik dan detail tes

**Status:** Queued

**Tujuan:** Menampilkan hanya produk valid yang dapat dipahami sebelum checkout.

Acceptance criteria:

- Katalog hanya menampilkan tes berstatus `published`.
- Detail menampilkan harga, urutan subtes, jumlah soal, durasi, masa akses, dan disclaimer independensi.
- Harga dan durasi diformat konsisten untuk locale Indonesia.
- State kosong dan produk tidak ditemukan memiliki UI yang jelas.

### RT-008 — Dokumen legal minimum

**Status:** Queued

**Tujuan:** Menyediakan informasi wajib sebelum transaksi dibuka.

Scope:

- Halaman kebijakan privasi, syarat layanan, dan kebijakan refund.
- Tautkan ketiganya dari detail tes, checkout, dan footer.

Acceptance criteria:

- Pengguna dapat membaca kebijakan sebelum membuat order.
- Dokumen menjelaskan produk latihan independen, data yang dikumpulkan, masa akses, dan proses refund/penggantian akses.

### RT-009 — Order dan DOKU Checkout

**Status:** Queued

**Tujuan:** Membuat checkout per sesi tanpa mempercayai harga atau identitas dari browser.

Acceptance criteria:

- Hanya peserta terautentikasi dan terverifikasi yang dapat checkout.
- Order menyimpan snapshot harga server-side dan masa akses 30 hari setelah pembayaran.
- Request DOKU ditandatangani di server dan `request_id` idempotent.
- Redirect DOKU hanya menampilkan status; tidak pernah mengaktifkan order.

### RT-010 — Webhook DOKU dan pemberian attempt

**Status:** Queued

**Tujuan:** Mengaktifkan satu attempt secara aman setelah notifikasi pembayaran valid.

Acceptance criteria:

- Signature dan payload notifikasi divalidasi sebelum perubahan data.
- Notifikasi `SUCCESS` mengubah payment/order menjadi paid dan membuat maksimal satu attempt.
- Webhook duplikat menghasilkan state akhir yang sama tanpa attempt tambahan.
- Nominal atau invoice yang tidak cocok ditolak dan tercatat untuk investigasi.
- Transaksi database atau guard setara mencegah state paid tanpa hak akses.

### RT-011 — Memulai attempt dan urutan subtes

**Status:** Queued

**Tujuan:** Mengubah hak akses berbayar menjadi sesi pengerjaan yang terkontrol.

Acceptance criteria:

- Attempt hanya dapat dimulai oleh pemilik order paid yang belum kedaluwarsa.
- Petunjuk tampil sebelum waktu subtes pertama dimulai.
- `started_at` dan seluruh deadline ditetapkan server.
- Peserta hanya dapat membuka subtes aktif berikutnya dan tidak dapat kembali ke subtes submitted.

### RT-012 — Test engine, timer server, dan submit

**Status:** Queued

**Tujuan:** Menyediakan pengalaman pengerjaan pilihan ganda yang adil dan mobile-friendly.

Acceptance criteria:

- UI menampilkan soal, navigasi nomor, pilihan jawaban, dan sisa waktu.
- Timer berasal dari deadline server dan tetap benar setelah reload atau browser ditutup.
- Server menolak perubahan setelah deadline/submission.
- Timeout menyubmit subtes otomatis dan melanjutkan urutan yang valid.
- Jawaban benar tidak dikirim ke browser selama attempt aktif.

### RT-013 — Autosave dan pemulihan progres

**Status:** Queued

**Tujuan:** Mencegah kehilangan jawaban saat reload atau koneksi tidak stabil.

Acceptance criteria:

- Jawaban di-upsert menggunakan key unik assignment dalam attempt subtest.
- Retry request aman dan tidak membuat jawaban duplikat.
- UI menunjukkan state menyimpan, tersimpan, dan gagal; kegagalan tidak diam-diam hilang.
- Reload memulihkan jawaban dan waktu aktif dari server.
- Opsi terpilih divalidasi benar-benar milik soal yang sedang dijawab.

### RT-014 — Scoring, hasil, dan pembahasan

**Status:** Queued

**Tujuan:** Menghitung hasil objektif setelah seluruh subtes selesai.

Acceptance criteria:

- Jawaban benar mendapat weight assignment; salah/kosong bernilai nol tanpa penalti.
- Final score, skor per subtes, dan jumlah benar/salah/kosong dihitung server-side.
- Hasil dan pembahasan hanya tersedia untuk attempt submitted milik peserta.
- Halaman pembahasan menampilkan pilihan peserta, jawaban benar, dan explanation.
- Persentil tidak ditampilkan pada MVP.

### RT-015 — Operasional admin dan penggantian akses

**Status:** Queued

**Tujuan:** Membantu admin menangani masalah transaksi dan pengerjaan tanpa mengubah histori secara sembarang.

Acceptance criteria:

- Admin dapat mencari dan melihat order, payment attempts, serta attempt terkait.
- Tindakan penggantian akses memerlukan alasan dan meninggalkan audit trail minimum.
- Penggantian akses membuat hak baru yang eksplisit; tidak menghapus hasil atau menghidupkan ulang attempt lama.
- Refund dan status order ditampilkan konsisten dengan data payment.

### RT-016 — Hardening dan kesiapan rilis MVP

**Status:** Queued

**Tujuan:** Membuktikan tiga seam utama PRD sebelum transaksi produksi dibuka.

Acceptance criteria:

- Vitest mencakup publikasi tes, webhook/payment idempotency, otorisasi, timer, autosave, dan scoring.
- Smoke test manual mencakup alur admin, peserta, DOKU Sandbox, mobile, reload, dan koneksi terputus.
- Logging tidak menyimpan password, token, signature, atau isi secret.
- Error state memiliki pesan yang dapat ditindaklanjuti tanpa membocorkan detail internal.
- `pnpm lint`, `pnpm test`, dan `pnpm build` lulus pada environment release.
- Checklist produksi Vercel, Neon, domain, email, DOKU, privacy, terms, dan refund telah diverifikasi.

## Keputusan yang masih memblokir

| Keputusan | Dibutuhkan sebelum | Pemilik keputusan |
|---|---|---|
| Provider transactional email | RT-004 | Produk/engineering |
| Blueprint jumlah soal dan durasi produk pertama | RT-006 | Produk/penyusun konten |
| Harga produk pertama | RT-007/RT-009 | Produk/bisnis |
| Object storage gambar figural | Saat soal bergambar pertama dibuat | Engineering |

Object storage tidak memblokir soal berbasis teks dan tidak perlu dipasang lebih awal.

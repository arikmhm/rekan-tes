# Rancangan Database — Rekan Tes

| Atribut | Nilai |
|---|---|
| Versi | 0.4 (Draft) |
| Tanggal | 13 September 2026 |
| Cakupan | Database MVP |
| Dokumen produk | [PRD.md](./PRD.md) |
| Keputusan teknis | [TECH_STACK.md](./TECH_STACK.md) |

## 1. Prinsip desain

- Better Auth mengelola tabel autentikasi; aplikasi hanya mereferensikan `user.id`.
- Database menggunakan Neon PostgreSQL dengan schema dan migrasi dikelola melalui Drizzle.
- Soal memiliki kategori, tetapi tidak memiliki `test_id` atau `subtest_id`.
- `test_subtest_questions` menentukan penggunaan soal pada sebuah tes.
- Satu soal dapat digunakan pada banyak tes tanpa diduplikasi.
- Satu order dapat memiliki beberapa percobaan pembayaran, tetapi maksimal satu test attempt.
- Nama tabel dan kolom memakai `snake_case`, waktu disimpan dalam UTC, dan nilai rupiah memakai integer.
- Semua primary key bertipe `text` berisi UUID v4 yang dibuat aplikasi melalui `crypto.randomUUID()`. Satu tipe ID dipakai untuk tabel auth maupun domain sehingga tidak ada friksi dengan adapter Better Auth dan tidak perlu ekstensi PostgreSQL tambahan. Better Auth disetel memakai generator yang sama lewat `advanced.database.generateId`.
- `test_subtest_questions.weight` bertipe `integer` dengan default `1` dan constraint `> 0`. Skor subtes adalah jumlah bobot jawaban benar. Jika kelak dibutuhkan pembobotan lebih halus, naikkan skalanya (misalnya basis 100) tanpa mengubah tipe kolom.
- Runtime aplikasi memakai connection string pooled, sedangkan migrasi Drizzle Kit memakai endpoint direct (`DATABASE_URL_UNPOOLED`). PgBouncer dalam mode transaction dapat menggagalkan DDL.

## 2. Tabel autentikasi

Tabel bagian ini dikelola Better Auth dan diimplementasikan di `src/db/auth-schema.ts`.

CLI Better Auth tidak dipakai: rilis stabilnya tertinggal beberapa minor dari library terpasang, sehingga schema hasil generate berisiko tidak cocok. Tabel ditulis tangan, lalu `src/db/auth-schema.test.ts` membandingkannya dengan `getAuthTables()` milik library agar perbedaan langsung terlihat saat versi dinaikkan.

| Tabel | Kolom penting | Fungsi |
|---|---|---|
| `user` | `id PK`, `name`, `username UK`, `display_username?`, `email UK`, `email_verified`, `image?`, `role`, timestamps | Identitas pengguna. Registrasi meminta username, email, dan password; `role` adalah server-owned field. |
| `account` | `id PK`, `user_id FK`, `account_id`, `provider_id`, `password?`, token OAuth?, timestamps | Metode login. Hash password berada di sini, bukan pada `user`. |
| `session` | `id PK`, `user_id FK`, `token UK`, `expires_at`, `ip_address?`, `user_agent?`, timestamps | Sesi login; tidak digunakan sebagai sesi pengerjaan tes. |
| `verification` | `id PK`, `identifier`, `value`, `expires_at`, timestamps | Token sementara untuk verifikasi email dan alur verifikasi lain. |

## 3. Tabel konten

| Tabel | Kolom penting | Fungsi |
|---|---|---|
| `question_categories` | `id PK`, `code UK`, `name`, `description?`, `status`, timestamps | Kategori seperti Numerical, Verbal, atau Banking. |
| `questions` | `id PK`, `category_id FK`, `prompt`, `difficulty`, `explanation`, `status`, timestamps | Bank soal independen dan reusable. |
| `question_options` | `id PK`, `question_id FK`, `label`, `content`, `is_correct`, `position`, timestamps | Pilihan jawaban untuk soal single-choice. |
| `subtests` | `id PK`, `category_id FK`, `code UK`, `name`, `description?`, `status`, timestamps | Katalog jenis subtes dan kategori soal utamanya. |
| `tests` | `id PK`, `slug UK`, `name`, `description`, `price_amount`, `status`, timestamps | Produk tes yang ditampilkan dan dijual. |
| `test_subtests` | `id PK`, `test_id FK`, `subtest_id FK`, `position`, `duration_seconds`, `question_limit`, timestamps | Konfigurasi subtes dalam sebuah tes. |
| `test_subtest_questions` | `id PK`, `test_subtest_id FK`, `question_id FK`, `position`, `weight`, `created_at` | Assignment soal ke subtes tertentu dalam sebuah tes. |

## 4. Tabel transaksi

| Tabel | Kolom penting | Fungsi |
|---|---|---|
| `orders` | `id PK`, `user_id FK`, `test_id FK`, `amount`, `status`, `access_expires_at`, `granted_by FK?`, `grant_reason?`, `replaces_order_id FK?`, timestamps | Pembelian satu sesi tes. `amount` menyimpan harga saat checkout. Tiga kolom terakhir hanya terisi pada order yang diberikan admin sebagai penggantian akses (RT-015) dan sekaligus menjadi jejak auditnya: pemberi, alasan, dan order yang digantikan. Order itu sendiri sudah satu baris per pemberian, sehingga tidak ada tabel log terpisah yang bisa melenceng dari order yang dicatatnya. |
| `payments` | `id PK`, `order_id FK`, `provider`, `external_id`, `request_id`, `qr_content?`, `reference_no?`, `expires_at?`, `amount`, `status`, `paid_at?`, timestamps | Setiap percobaan pembayaran. Untuk DOKU SNAP QRIS, `external_id` menyimpan `partnerReferenceNo` (invoice), `request_id` menyimpan `X-EXTERNAL-ID` yang wajib numerik dan unik harian, `qr_content` menyimpan payload QRIS yang dirender menjadi QR, dan `reference_no` menyimpan `referenceNo` milik DOKU yang dibutuhkan Query QRIS (RT-010) untuk menanyakan status transaksi langsung sebagai backup selain webhook. |

## 5. Tabel pengerjaan

| Tabel | Kolom penting | Fungsi |
|---|---|---|
| `test_attempts` | `id PK`, `order_id FK UK`, `status`, `started_at?`, `submitted_at?`, `final_score?`, timestamps | Satu kesempatan mengerjakan tes dari order berbayar. |
| `attempt_subtests` | `id PK`, `attempt_id FK`, `test_subtest_id FK`, `status`, `started_at?`, `submitted_at?`, `score?`, timestamps | Progres, waktu, dan skor setiap subtes. |
| `attempt_answers` | `id PK`, `attempt_subtest_id FK`, `test_subtest_question_id FK`, `selected_option_id FK?`, `is_correct?`, `answered_at?`, timestamps | Jawaban peserta untuk satu assignment soal. |

`selected_option_id` nullable agar jawaban kosong dapat direpresentasikan. Referensi ke `test_subtest_question_id` mempertahankan konteks tes dan subtes dari soal tersebut.

## 6. Relasi

| Parent | Child | Kardinalitas | Keterangan |
|---|---|---|---|
| `user` | `account` | 1:N | Pengguna dapat memiliki beberapa metode login. |
| `user` | `session` | 1:N | Pengguna dapat login di beberapa perangkat. |
| `user` | `orders` | 1:N | Pengguna dapat membeli beberapa sesi tes. |
| `question_categories` | `questions` | 1:N | Setiap soal memiliki satu kategori. |
| `question_categories` | `subtests` | 1:N | Setiap subtes memiliki satu kategori utama. |
| `questions` | `question_options` | 1:N | Soal memiliki beberapa pilihan jawaban. |
| `tests` | `test_subtests` | 1:N | Tes terdiri dari beberapa konfigurasi subtes. |
| `subtests` | `test_subtests` | 1:N | Jenis subtes dapat dipakai pada beberapa tes. |
| `test_subtests` | `test_subtest_questions` | 1:N | Konfigurasi subtes memiliki assignment soal. |
| `questions` | `test_subtest_questions` | 1:N | Soal dapat digunakan pada banyak assignment. |
| `tests` | `orders` | 1:N | Produk tes dapat dibeli berkali-kali. |
| `orders` | `payments` | 1:N | Order dapat memiliki beberapa percobaan pembayaran. |
| `orders` | `test_attempts` | 1:0..1 | Order memberikan maksimal satu attempt. |
| `test_attempts` | `attempt_subtests` | 1:N | Attempt menjalankan semua subtes milik tes. |
| `test_subtests` | `attempt_subtests` | 1:N | Konfigurasi subtes digunakan pada banyak attempt. |
| `attempt_subtests` | `attempt_answers` | 1:N | Pengerjaan subtes menyimpan jawaban peserta. |
| `test_subtest_questions` | `attempt_answers` | 1:N | Assignment soal dapat dijawab pada banyak attempt. |
| `question_options` | `attempt_answers` | 1:N opsional | Jawaban kosong tidak memiliki pilihan terpilih. |

## 7. Nilai status

| Konteks | Nilai |
|---|---|
| `user.role` | `participant`, `admin` |
| `questions.difficulty` | `easy`, `medium`, `hard` |
| Status konten | `draft`, `published`, `archived` |
| `orders.status` | `pending`, `paid`, `expired`, `cancelled`, `refunded` |
| `payments.status` | `pending`, `paid`, `expired`, `refunded`; notifikasi `FAILED` dari DOKU Checkout tidak langsung menjadi status final |
| `test_attempts.status` | `not_started`, `in_progress`, `submitted`, `submitted_by_timeout`, `expired` |
| `attempt_subtests.status` | `not_started`, `in_progress`, `submitted`, `submitted_by_timeout` |

## 8. Constraint wajib

### Konten

- `user.username` dan `user.email` unik; bentuk schema autentikasi final mengikuti output CLI Better Auth.
- `question_categories.code`, `subtests.code`, dan `tests.slug` unik.
- `questions.category_id` dan `subtests.category_id` wajib diisi.
- `UNIQUE(question_id, position)` pada `question_options`.
- Soal yang diterbitkan harus memiliki tepat satu pilihan benar. Gunakan unique partial index untuk membatasi maksimal satu jawaban benar dan validasi saat publish untuk memastikan minimal satu.
- `UNIQUE(test_id, subtest_id)` dan `UNIQUE(test_id, position)` pada `test_subtests`.
- `UNIQUE(test_subtest_id, question_id)` dan `UNIQUE(test_subtest_id, position)` pada `test_subtest_questions`.
- Kategori soal harus sama dengan kategori subtes saat assignment dibuat.
- `test_subtest_questions.weight` harus lebih besar dari nol.
- `position`, `duration_seconds`, dan `question_limit` harus lebih besar dari nol.

### Transaksi dan pengerjaan

- `orders.amount` dan `payments.amount` tidak boleh negatif.
- `UNIQUE(provider, external_id)` pada `payments` agar webhook idempotent.
- `UNIQUE(provider, request_id)` pada `payments` agar pembuatan checkout tidak diproses dua kali.
- `granted_by` dan `grant_reason` pada `orders` harus sama-sama terisi atau sama-sama kosong (check constraint `orders_grant_reason_with_granter`); jejak audit tanpa salah satunya tidak berguna.
- `replaces_order_id` mereferensikan `orders.id` sendiri, sehingga penggantian tidak dapat menunjuk order yang tidak ada.
- `UNIQUE(order_id)` pada `test_attempts`.
- `UNIQUE(attempt_id, test_subtest_id)` pada `attempt_subtests`.
- `UNIQUE(attempt_subtest_id, test_subtest_question_id)` pada `attempt_answers`.
- Attempt hanya dapat dibuat untuk order berstatus `paid`.
- `selected_option_id` harus berasal dari question yang sedang dijawab.

Validasi lintas beberapa tabel dilakukan di dalam transaksi aplikasi jika tidak dapat dinyatakan sebagai constraint database sederhana.

## 9. Index minimum

| Index | Kegunaan |
|---|---|
| `questions(category_id, status, difficulty)` | Filter bank soal. |
| Search index pada `questions.prompt` | Pencarian isi soal. |
| `test_subtests(test_id, position)` | Membaca urutan subtes. |
| `test_subtest_questions(test_subtest_id, position)` | Membaca urutan soal. |
| `orders(user_id, created_at)` | Riwayat pembelian pengguna. |
| `orders(status, created_at)` | Monitoring order. |
| `payments(order_id)` | Rekonsiliasi pembayaran. |
| `attempt_subtests(attempt_id, status)` | Memulihkan progres tes. |
| `attempt_answers(attempt_subtest_id)` | Memuat jawaban tersimpan. |

Tambahkan index lain hanya setelah ada query nyata yang membutuhkannya.

## 10. Alur data penting

### Reuse soal

```text
questions Q001
├── assignment: Tes ODP / Numeric
└── assignment: Tes Frontliner / Numeric
```

Kedua assignment menunjuk ke satu record `questions` yang sama.

### Pembayaran dan attempt

```text
order pending
→ HTTP Notification DOKU dengan signature valid
→ payment dan order menjadi paid
→ satu test_attempt dibuat
```

Perubahan status dan pembuatan attempt harus atomik atau memiliki idempotency guard yang setara.

### Autosave jawaban

Autosave melakukan upsert berdasarkan pasangan unik `attempt_subtest_id` dan `test_subtest_question_id`.

## 11. Kebijakan perubahan konten

- Soal yang belum pernah dikerjakan dapat diedit.
- Soal yang sudah pernah dikerjakan hanya boleh menerima koreksi typo yang tidak mengubah makna atau kunci jawaban.
- Perubahan substantif dilakukan dengan menduplikasi soal dan mengarsipkan versi lama.
- Tes yang sudah memiliki attempt tidak boleh menghapus subtes atau assignment historis secara fisik.
- Snapshot atau versioning baru ditambahkan ketika aturan di atas tidak lagi mencukupi.

## 12. Penyimpangan implementasi

Dicatat saat RT-002 agar tidak terbaca sebagai kelalaian:

- `orders.access_expires_at` dibuat nullable. Masa akses baru diketahui ketika pembayaran berhasil (RT-009), sehingga tidak dapat terisi saat order masih `pending`.
- Tiga index pada bagian 9 belum dibuat. `attempt_subtests(attempt_id, status)` dan `attempt_answers(attempt_subtest_id)` sudah tercakup prefix unique index yang ada, sedangkan search index `questions.prompt` menunggu keputusan strategi pencarian.
- `payments.checkout_url` diganti `payments.qr_content` pada RT-009 (migrasi `0002` dan `0003`). MVP memakai DOKU SNAP QRIS, sehingga yang disimpan adalah payload QRIS untuk dirender sendiri, bukan URL halaman pembayaran pihak ketiga.

## 13. Keputusan teknis terbuka

- Strategi pencarian teks soal.
- Penyimpanan dan representasi gambar soal figural.
- Strategi migrasi untuk format soal selain single-choice.
- Apakah urutan soal diacak dan disimpan per attempt.

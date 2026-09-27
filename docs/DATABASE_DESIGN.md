# Rancangan Database — Rekan Tes

Sumber kebenarannya `src/db/schema.ts` dan `src/db/auth-schema.ts`, termasuk kolom, enum status, unique index, dan check constraint. Dokumen ini hanya mencatat alasan dan aturan yang tidak terbaca dari schema.

## Model

- Soal berdiri sendiri: punya kategori, tetapi tanpa `test_id`/`subtest_id`. Soal masuk tes lewat `test_subtest_questions` (assignment), sehingga satu soal dipakai banyak tes tanpa duplikasi.
- Satu order punya banyak `payments` (percobaan pembayaran) tetapi maksimal satu `test_attempts`.
- Order penggantian akses adalah order biasa bernilai nol; `granted_by`, `grant_reason`, dan `replaces_order_id` sekaligus menjadi jejak auditnya, jadi tidak ada tabel log terpisah.
- `orders.access_expires_at` nullable karena baru terisi saat pembayaran berhasil.
- `banners` hanya menyimpan alamat gambar di Cloudflare R2, tanpa status: spanduk yang tidak tampil dihapus.
- Primary key `text` berisi UUID v4 dari `crypto.randomUUID()`, termasuk tabel auth lewat `advanced.database.generateId`.
- Waktu dalam UTC, rupiah dalam integer. Bobot assignment integer; pembobotan lebih halus cukup menaikkan skala.

## Tabel auth

Ditulis tangan, bukan hasil CLI Better Auth yang rilis stabilnya tertinggal dari library terpasang. `src/db/auth-schema.test.ts` membandingkannya dengan `getAuthTables()` supaya selisih langsung terlihat saat versi dinaikkan.

## Aturan yang ditegakkan aplikasi

Aturan lintas tabel ini tidak bisa dinyatakan sebagai constraint sederhana, jadi dijaga di dalam transaksi aplikasi:

- Kategori soal harus sama dengan kategori subtes saat assignment dibuat.
- Soal terbit memiliki tepat satu pilihan benar: unique partial index membatasi maksimal satu, validasi publish memastikan minimal satu.
- Attempt hanya dibuat untuk order `paid`.
- `selected_option_id` harus milik soal yang sedang dijawab; null berarti dilewati.
- `is_correct` dan `attempt_subtests.score` dibekukan saat subtes ditutup, jadi koreksi kunci belakangan tidak mengubah hasil lama.
- Jawaban disetor dengan upsert pada pasangan unik `attempt_subtest_id` + `test_subtest_question_id`.

## Perubahan konten

- Soal yang sudah pernah dikerjakan hanya menerima koreksi pertanyaan dan pembahasan; pilihan dan kuncinya dibekukan. Perubahan substantif: duplikasi soal, lalu arsipkan versi lama.
- Tes yang sudah pernah dikerjakan dibekukan susunan subtes dan soalnya.

## Keputusan terbuka

- Pencarian teks soal (kini `ilike` tanpa index). Index baru hanya untuk query nyata.
- Penyimpanan dan representasi gambar soal figural.
- Migrasi untuk format soal selain single-choice.

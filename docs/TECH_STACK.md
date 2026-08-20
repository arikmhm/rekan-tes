# Keputusan Teknis — Rekan Tes

| Atribut | Nilai |
|---|---|
| Status | Disepakati untuk MVP |
| Tanggal | 20 Agustus 2026 |
| Dokumen produk | [PRD.md](./PRD.md) |
| Rancangan database | [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) |

## Arsitektur

MVP dibangun sebagai satu aplikasi Next.js modular monolith. UI, autentikasi, logika bisnis, endpoint autosave, dan webhook pembayaran berada dalam satu repository dan satu deployment Vercel.

## Stack

| Area | Keputusan |
|---|---|
| Bahasa | TypeScript |
| Web | Next.js App Router dan React |
| UI | Tailwind CSS dan komponen shadcn/ui seperlunya |
| Autentikasi | Better Auth dengan username plugin |
| Database | Neon PostgreSQL |
| Akses database | Drizzle ORM, Drizzle Kit, dan Neon serverless driver |
| Validasi | Zod pada input dari luar aplikasi |
| Pembayaran | DOKU Checkout |
| Hosting | Vercel |
| Pengujian otomatis | Vitest untuk logika bisnis dan integrasi server |
| Pengujian browser | Smoke test manual; Playwright tidak digunakan pada MVP |

Versi package yang terpasang mengikuti `package.json` dan lockfile, bukan diduplikasi di dokumen ini.

## Konvensi aplikasi

- Server Component menjadi default; Client Component hanya untuk interaksi browser seperti test engine dan timer.
- Server Action digunakan untuk mutasi dari UI. Route Handler digunakan untuk Better Auth, autosave, dan webhook DOKU.
- Otorisasi, deadline tes, scoring, dan aktivasi attempt selalu diverifikasi di server.
- Tidak ada backend terpisah, microservice, Redis, message queue, atau WebSocket pada MVP.

## Akun pengguna

- Form registrasi hanya meminta `username`, `email`, dan `password`; field internal `name` dapat mengikuti username.
- Login menggunakan username dan password.
- Email verifikasi dikirim setelah registrasi dan wajib terverifikasi sebelum pembelian.
- Better Auth mengelola password, session, token verifikasi, dan reset password.

## Pembayaran DOKU

1. Server membuat order dan payment attempt.
2. Server membuat DOKU Checkout URL menggunakan request bertanda tangan.
3. Peserta diarahkan ke halaman DOKU.
4. Hanya HTTP Notification DOKU dengan signature valid yang boleh mengubah status pembayaran.
5. Status `SUCCESS` menandai order `paid` dan membuat maksimal satu attempt dalam transaksi yang idempotent.
6. Redirect browser hanya menampilkan status dan bukan bukti pembayaran.

## Status repository

- Next.js sudah terpasang, tetapi scaffold saat ini masih menggunakan Pages Router di `src/pages`.
- Migrasi scaffold ke `src/app` adalah pekerjaan implementasi pertama.
- Tailwind, shadcn/ui, Better Auth, Drizzle, Neon driver, Zod, dan Vitest belum tercatat di `package.json`.

## Urutan implementasi awal

1. Migrasikan scaffold ke App Router dan pasang Tailwind serta komponen shadcn/ui minimum.
2. Hubungkan Neon, Drizzle, dan Better Auth beserta verifikasi email.
3. Bangun pengelolaan kategori, soal reusable, subtes, dan produk tes.
4. Integrasikan order serta DOKU Checkout.
5. Bangun test engine, autosave, scoring, hasil, dan pengujian kritis.

## Keputusan yang belum ditetapkan

- Provider transactional email.
- Object storage untuk gambar soal figural.

Pilih layanan tersebut ketika fiturnya mulai diimplementasikan; jangan menambahkannya hanya untuk persiapan.

## Referensi resmi

- [Next.js App Router](https://nextjs.org/docs/app)
- [Better Auth Username](https://better-auth.com/docs/plugins/username)
- [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver)
- [DOKU Checkout](https://developers.doku.com/accept-payments/doku-checkout)
- [DOKU notification best practice](https://developers.doku.com/get-started-with-doku-api/notification/best-practice)

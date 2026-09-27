# Keputusan Teknis — Rekan Tes

MVP adalah satu aplikasi Next.js modular monolith: UI, autentikasi, logika bisnis, dan webhook pembayaran dalam satu repository dan satu deployment Vercel. Kebutuhan produk ada di [PRD.md](./PRD.md), model data di [DATABASE_DESIGN.md](./DATABASE_DESIGN.md).

## Stack

| Area | Keputusan |
|---|---|
| Web | Next.js App Router, React, TypeScript |
| UI | Tailwind CSS dan shadcn/ui (style `base-nova`, primitif Base UI) |
| Autentikasi | Better Auth dengan username plugin |
| Email | Resend lewat REST API (`src/lib/email.ts`), tanpa SDK |
| Database | Neon PostgreSQL, Drizzle ORM, driver `neon-serverless` |
| Validasi | Zod pada input dari luar aplikasi |
| Pembayaran | DOKU SNAP QRIS (direct API) |
| Penyimpanan objek | Cloudflare R2 untuk gambar spanduk |
| Pengujian | Vitest untuk logika bisnis dan integrasi server; alur browser lewat smoke test manual |

## Konvensi aplikasi

- Mutasi dari UI memakai Server Action, termasuk setoran jawaban berkala. Route Handler hanya untuk Better Auth dan webhook DOKU.
- Environment server dibaca lewat `env` dari `src/lib/env.ts`, bukan `process.env`. Variabel baru masuk ke schema dan `.env.example` pada perubahan yang memakainya.
- Database diakses lewat `db` dari `src/db/index.ts`. Driver `neon-serverless`, bukan `neon-http`, karena `neon-http` melempar error pada `transaction()`.
- Galat unique constraint dikenali lewat kode PostgreSQL `23505` pada rantai `cause`, bukan teks pesan.
- Timeout subtes tidak memakai cron: `applyTimeouts` di `src/lib/attempt.ts` menutup subtes yang lewat deadline setiap kali attempt dibaca, sebelum halaman atau Server Action memakainya.
- Kunci jawaban dan pembahasan hanya dibaca `getResult`, yang menolak attempt yang belum selesai.

## Otorisasi dan akun

- Helper di `src/lib/authz.ts`: halaman memakai `requireAdmin`, Server Action memakai `requireAdminMutation` (`notFound` di dalam action menghasilkan 500), resource peserta memakai `assertOwner`.
- Penolakan memakai `redirect` dan `notFound`, bukan `forbidden`/`unauthorized` yang masih butuh flag eksperimental `authInterrupts`. `notFound` sekaligus menyembunyikan keberadaan route admin.
- Guard admin di layout tidak menggantikan guard per halaman dan per Server Action.
- `role` adalah field server-owned: Better Auth menolak klien yang menyetelnya, dan admin diberikan operator lewat database.
- Jalur checkout memakai `requireVerifiedUser`; email belum terverifikasi tetap bisa login.

## Antarmuka

- Base UI, bukan Radix: polimorfisme memakai prop `render`, bukan `asChild`, dan tombol yang dirender sebagai `Link` wajib `nativeButton={false}`.
- Palet Rekan Tes dipetakan ke token shadcn di `globals.css`, jadi komponen bawaan otomatis berwarna merek. Aturan visual lengkap di [DESIGN.md](./DESIGN.md).
- `shadcn init` menimpa `globals.css`. Periksa ulang dua hal sesudahnya: `--font-sans` memakai nama font literal karena `@theme inline` menyelesaikan variabel saat parse, dan token kustom tidak boleh memakai nama milik shadcn (`--color-muted` pernah bertabrakan dengan `bg-muted`).
- Tema terang saja; blok `.dark` bawaan shadcn tidak pernah diaktifkan.
- `src/hooks/use-mobile.ts` ditulis ulang dengan `useSyncExternalStore` karena versi shadcn memanggil `setState` di dalam efek dan ditolak lint React compiler.

## Pembayaran DOKU

QRIS lewat DOKU SNAP direct API; tanda tangan dan endpoint ada di `src/lib/doku.ts`.

- Harga, identitas, dan invoice ditentukan server; formulir checkout hanya mengirim slug. QR dirender server menjadi SVG.
- Hanya HTTP Notification dengan signature valid yang mengubah status. Notifikasi memakai skema non-SNAP (HMAC-SHA256), berbeda dari skema SNAP untuk request keluar. Status selain `SUCCESS` diakui 200 tanpa mengubah data.
- Aktivasi (`activatePayment` di `src/lib/webhook.ts`) menandai order `paid` dan membuat maksimal satu attempt dalam satu transaksi, dijaga `UPDATE ... WHERE status <> 'paid'`.
- Notification URL diatur manual di DOKU Back Office dan tidak menjangkau `localhost`. Cadangannya tombol "Cek status pembayaran" yang memanggil Query QRIS dan memakai fungsi aktivasi yang sama.

Kredensial: Client ID berformat `BRN-…` adalah client key SNAP; Client ID numerik di bagian QRIS adalah `merchantId`. NMID tidak perlu dikonfigurasi karena DOKU menyisipkannya ke payload. Public key merchant harus didaftarkan di Back Office. `pnpm doku:check` memanggil sandbox lewat `src/lib/doku.ts` yang sama dengan aplikasi: `Unauthorized. Signature` berarti public key belum terdaftar, `Unknown Client` berarti `DOKU_CLIENT_ID` salah.

## Keputusan terbuka

- Tanda tangan pada balasan DOKU (generate dan Query QRIS) belum diverifikasi; balasan hanya dipercaya lewat TLS, padahal Query QRIS ikut mengaktifkan order.

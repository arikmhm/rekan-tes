# Keputusan Teknis — Rekan Tes

| Atribut | Nilai |
|---|---|
| Status | Disepakati untuk MVP |
| Tanggal | 13 September 2026 |
| Dokumen produk | [PRD.md](./PRD.md) |
| Rancangan database | [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) |

## Arsitektur

MVP dibangun sebagai satu aplikasi Next.js modular monolith. UI, autentikasi, logika bisnis, endpoint autosave, dan webhook pembayaran berada dalam satu repository dan satu deployment Vercel.

## Stack

| Area | Keputusan |
|---|---|
| Bahasa | TypeScript |
| Web | Next.js App Router dan React |
| UI | Tailwind CSS dan komponen shadcn/ui (style `base-nova`, primitif Base UI) |
| Autentikasi | Better Auth dengan username plugin |
| Transactional email | Resend |
| Database | Neon PostgreSQL |
| Akses database | Drizzle ORM, Drizzle Kit, dan Neon serverless driver |
| Validasi | Zod pada input dari luar aplikasi |
| Pembayaran | DOKU SNAP QRIS (direct API) |
| Hosting | Vercel |
| Pengujian otomatis | Vitest untuk logika bisnis dan integrasi server |
| Pengujian browser | Smoke test manual; Playwright tidak digunakan pada MVP |

Versi package yang terpasang mengikuti `package.json` dan lockfile, bukan diduplikasi di dokumen ini.

## Konvensi aplikasi

- Server Component menjadi default; Client Component hanya untuk interaksi browser seperti test engine dan timer.
- Server Action digunakan untuk mutasi dari UI. Route Handler digunakan untuk Better Auth, autosave, dan webhook DOKU.
- Otorisasi, deadline tes, scoring, dan aktivasi attempt selalu diverifikasi di server.
- Environment server dibaca hanya melalui `env` dari `src/lib/env.ts`, bukan `process.env` langsung. Variabel baru ditambahkan ke schema dan `.env.example` pada issue yang benar-benar memakainya.
- Akses database hanya melalui `db` dari `src/db/index.ts`. Driver yang dipakai `neon-serverless`, bukan `neon-http`, karena `neon-http` melempar error pada `transaction()` sementara RT-010 membutuhkan transaksi sungguhan.
- Otorisasi server memakai helper di `src/lib/authz.ts`: `getSession`, `requireUser`, `requireAdmin`, `requireAdminMutation`, dan `assertOwner`.
- Halaman memakai `requireAdmin`, Server Action memakai `requireAdminMutation`. `notFound` di dalam action menghasilkan 500, bukan penolakan yang bersih.
- Galat unique constraint dikenali lewat kode PostgreSQL `23505` pada rantai `cause`, bukan dengan mencocokkan teks pesan yang dibungkus Drizzle.
- Penolakan otorisasi memakai `redirect` dan `notFound`, bukan `forbidden`/`unauthorized` dari Next.js, karena keduanya masih memerlukan flag eksperimental `authInterrupts`. Batas otorisasi tidak diletakkan di atas API eksperimental, dan `notFound` sekaligus tidak membocorkan keberadaan route admin.
- Role admin diberikan lewat database oleh operator, bukan lewat UI. `role` adalah field server-owned; Better Auth menolak permintaan klien yang mencoba menyetelnya.
- Email belum terverifikasi tidak memblokir login, hanya pembelian, sesuai PRD. Gunakan `requireVerifiedUser` pada jalur checkout.
- `BETTER_AUTH_URL` wajib diisi karena tautan verifikasi dan reset password dibangun darinya.
- Runtime aplikasi memakai `DATABASE_URL` (pooled); migrasi Drizzle Kit memakai `DATABASE_URL_UNPOOLED` (direct).
- Tidak ada backend terpisah, microservice, Redis, message queue, atau WebSocket pada MVP.

## Akun pengguna

- Form registrasi hanya meminta `username`, `email`, dan `password`; field internal `name` dapat mengikuti username.
- Login menggunakan username dan password.
- Email verifikasi dikirim setelah registrasi dan wajib terverifikasi sebelum pembelian.
- Better Auth mengelola password, session, token verifikasi, dan reset password.

## Antarmuka

- shadcn/ui dipasang dengan style bawaan CLI v4 (`base-nova`), sehingga primitifnya memakai Base UI, bukan Radix. Konsekuensinya: polimorfisme memakai prop `render`, bukan `asChild`, dan tombol yang dirender sebagai `Link` harus menyertakan `nativeButton={false}` agar semantik anchor tetap benar.
- Palet Rekan Tes dipetakan ke token shadcn di `globals.css` (`--primary`, `--muted-foreground`, `--accent`, `--background`), bukan sebaliknya. Komponen bawaan otomatis berwarna merek tanpa override per komponen.
- `shadcn init` menimpa `globals.css`. Dua hal yang harus diperiksa ulang setelah menjalankannya: `--font-sans` wajib memakai nama font literal karena `@theme inline` menyelesaikan variabel saat parse, dan token kustom tidak boleh memakai nama milik shadcn. Token lama `--color-muted` bertabrakan dengan permukaan `bg-muted` milik shadcn, sehingga diganti `text-muted-foreground` di seluruh aplikasi.
- Dropdown memakai `SelectNative`, yaitu `select` bawaan peramban bergaya `Input`. Seluruh formulir admin dikirim sebagai form biasa ke Server Action, sehingga elemen native ikut terkirim tanpa JavaScript dan tetap bekerja pada form GET.
- Panel admin memakai kerangka dasbor shadcn: `SidebarProvider` di `src/app/admin/layout.tsx`, sidebar yang dapat diciutkan, breadcrumb dari URL, dan halaman berisi Card, Table, Badge, serta Alert. Halaman publik belum ikut dimigrasikan.
- Guard admin dipasang di layout dan tetap dipertahankan di setiap halaman serta Server Action; layout bukan pengganti guard per-route.
- Tema terang saja. Blok `.dark` bawaan shadcn dibiarkan ada tetapi tidak pernah diaktifkan karena tidak ada kelas `dark` yang dipasang.
- `src/hooks/use-mobile.ts` ditulis ulang memakai `useSyncExternalStore`. Versi bawaan shadcn memanggil `setState` langsung di dalam efek dan ditolak lint React compiler.

## Pembayaran DOKU

MVP memakai satu metode pembayaran: QRIS lewat DOKU SNAP direct API. Peserta tidak
pernah meninggalkan aplikasi, dan tidak ada halaman pemilihan kanal.

1. Server membuat order dan payment attempt.
2. Server mengambil access token B2B dengan tanda tangan asimetris `SHA256withRSA(privateKey, clientId|timestamp)`.
3. Server memanggil `/snap-adapter/b2b/v1.0/qr/qr-mpm-generate` dengan tanda tangan simetris `HMAC-SHA512(clientSecret, METHOD:path:token:sha256hex(body):timestamp)`.
4. `qrContent` disimpan pada payment attempt dan dirender menjadi QR di halaman pesanan.
5. Hanya HTTP Notification DOKU dengan signature valid yang boleh mengubah status pembayaran.
6. Status sukses menandai order `paid` dan membuat maksimal satu attempt dalam transaksi yang idempotent.
7. Memindai QR tidak mengubah apa pun di sisi kami; halaman pesanan hanya membaca status.

## Status repository

- Next.js 16 dan React 19 sudah terpasang dengan App Router di `src/app`.
- Tailwind CSS 4 sudah terpasang melalui `@tailwindcss/postcss` dan diimpor dari root layout.
- Shell halaman publik dan metadata dasar sudah menggunakan identitas Rekan Tes.
- shadcn/ui belum dipasang; tambahkan hanya saat komponen pertama benar-benar membutuhkannya.
- Zod dan Vitest sudah terpasang. Validasi environment server ada di `src/lib/env-schema.ts`, dan singleton `src/lib/env.ts` dijaga paket `server-only`.
- Drizzle ORM, Drizzle Kit, dan Neon serverless driver sudah terpasang. Schema domain ada di `src/db/schema.ts` dan migrasi awal sudah diterapkan ke Neon.
- `@neon/config` dan `@neon/env` hasil `neon init` sudah dihapus. Rekan Tes tidak mendeklarasikan layanan Neon apa pun, dan `neon env pull` bekerja tanpa `neon.ts`. Pasang kembali hanya jika nanti memakai branch policy atau layanan Neon.
- Better Auth beserta username plugin sudah terpasang; tabel auth, halaman daftar/masuk, Route Handler, dan helper otorisasi sudah ada.
- Resend sudah terpasang lewat REST API di `src/lib/email.ts`; SDK `resend` tidak dipakai. Verifikasi email dan reset password sudah berjalan.
- Pengirim masih memakai domain uji Resend. Verifikasi domain sendiri sebelum rilis, lalu ubah `EMAIL_FROM`.
- Urutan pekerjaan terperinci dan statusnya dicatat di [ISSUES.md](./ISSUES.md).

## Urutan implementasi awal

1. Hubungkan Neon dan Drizzle, lalu buat schema serta migrasi MVP.
2. Pasang Better Auth, alur akun, otorisasi role, dan verifikasi email.
3. Bangun pengelolaan kategori, soal reusable, subtes, dan produk tes.
4. Bangun katalog publik, detail produk, serta dokumen legal minimum.
5. Integrasikan order serta DOKU Checkout secara idempotent.
6. Bangun test engine, autosave, scoring, hasil, dan pengujian kritis.

Rincian dependensi dan kriteria selesai untuk setiap tahap tersedia di [ISSUES.md](./ISSUES.md).

## Keputusan yang belum ditetapkan

- Object storage untuk gambar soal figural.

Pilih layanan tersebut ketika fiturnya mulai diimplementasikan; jangan menambahkannya hanya untuk persiapan.

## Referensi resmi

- [Next.js App Router](https://nextjs.org/docs/app)
- [Better Auth Username](https://better-auth.com/docs/plugins/username)
- [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver)
- [DOKU Checkout](https://developers.doku.com/accept-payments/doku-checkout)
- [DOKU notification best practice](https://developers.doku.com/get-started-with-doku-api/notification/best-practice)

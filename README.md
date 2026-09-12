# Rekan Tes

Platform B2C untuk simulasi tes masuk kerja, dengan fokus awal perbankan dan pembayaran per sesi.

## Status

Fondasi aplikasi sudah menggunakan Next.js App Router dan Tailwind CSS. Halaman publik awal sudah diselaraskan dengan positioning produk, schema database MVP sudah diterapkan ke Neon, serta registrasi, login, dan otorisasi role sudah berjalan. Verifikasi email, bank soal, pembayaran, test engine, dan hasil masih berada dalam backlog.

Urutan implementasi tersedia di [docs/ISSUES.md](./docs/ISSUES.md).

## Dokumentasi

- [Indeks dokumentasi](./docs/README.md)
- [Product Requirements](./docs/PRD.md)
- [Rancangan Database](./docs/DATABASE_DESIGN.md)
- [Keputusan Teknis](./docs/TECH_STACK.md)
- [Backlog Issues](./docs/ISSUES.md)

## Development

Siapkan dependency dan environment lokal:

```bash
pnpm install
cp .env.example .env.local
```

Isi `.env.local` dengan nilai pengembangan Anda, atau tarik langsung dari Neon:

```bash
pnpx neon@latest env pull
```

File `.env.local` tidak pernah masuk version control; hanya `.env.example` yang ikut ter-commit dan isinya tidak boleh berupa secret sebenarnya.

Dibutuhkan dua connection string. `DATABASE_URL` adalah endpoint pooled untuk runtime aplikasi, sedangkan `DATABASE_URL_UNPOOLED` adalah endpoint direct untuk migrasi Drizzle Kit — endpoint pooled dapat menggagalkan DDL.

Environment server dibaca melalui `env` dari `src/lib/env.ts`, bukan `process.env` langsung. Modul itu dijaga paket `server-only` sehingga build gagal jika terbawa ke Client Component. Ketika ada variabel wajib yang belum terisi, aplikasi berhenti lebih awal dengan pesan yang menyebut variabel tersebut.

Jalankan server pengembangan:

```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Database

Schema ada di `src/db/schema.ts`. Setelah mengubahnya, buat lalu terapkan migrasi:

```bash
pnpm db:generate
```

```bash
pnpm db:migrate
```

Akses database hanya melalui `db` dari `src/db/index.ts`, yang dijaga `server-only` agar tidak pernah masuk bundle klien.

## Akun dan otorisasi

Registrasi di `/daftar` meminta username, email, dan password. Login di `/masuk` memakai username. Reset password lewat `/lupa-password`.

Email verifikasi dikirim otomatis setelah registrasi. Email belum terverifikasi tetap bisa login, tetapi tidak bisa membeli sesi — pembatasan itu dipasang lewat `requireVerifiedUser()` pada jalur checkout.

Pengirim email masih memakai domain uji Resend (`onboarding@resend.dev`), yang hanya bisa mengirim ke alamat pemilik akun Resend. Verifikasi domain sendiri di Resend sebelum rilis, lalu isi `EMAIL_FROM`.

`role` adalah field server-owned: Better Auth menolak permintaan klien yang mencoba menyetelnya. Admin pertama dibuat lewat database, bukan lewat UI:

```bash
psql "$DATABASE_URL_UNPOOLED" -c "update \"user\" set role='admin' where username='ganti-username';"
```

Otorisasi server memakai helper di `src/lib/authz.ts`. Gunakan `requireAdmin()` pada route admin dan `assertOwner()` untuk resource milik peserta; keduanya menolak di server, bukan hanya menyembunyikan UI.

## Pemeriksaan sebelum commit

```bash
pnpm lint && pnpm test && pnpm build
```

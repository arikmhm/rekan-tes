# Rekan Tes

Platform B2C untuk simulasi tes masuk kerja, dengan fokus awal perbankan dan pembayaran per sesi.

## Status

Fondasi aplikasi sudah menggunakan Next.js App Router dan Tailwind CSS. Akun, verifikasi email, panel admin bank soal dan produk tes, katalog publik, pembayaran QRIS lewat DOKU, serta pemberian dan pembukaan sesi pengerjaan sudah berjalan. Sesi pengerjaan sudah lengkap dari petunjuk sampai hasil: mesin soal, timer server, autosave, penilaian, dan pembahasan. Panel admin juga sudah bisa menelusuri pesanan dan memberi akses pengganti. Tersisa hardening kesiapan rilis.

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

Otorisasi server memakai helper di `src/lib/authz.ts`. Gunakan `requireAdmin()` pada halaman admin, `requireAdminMutation()` di dalam Server Action, dan `assertOwner()` untuk resource milik peserta. Semuanya menolak di server, bukan hanya menyembunyikan UI.

## Admin konten

Setelah menjadi admin, kelola konten di `/admin`:

- `/admin/kategori` — kategori soal. Kode ditulis huruf kapital dan harus unik.
- `/admin/soal` — bank soal, dengan filter kategori, status, kesulitan, dan pencarian teks.

Soal berdiri independen dari tes, sehingga satu soal dapat dipakai di banyak tes tanpa diduplikasi. Simpan sebagai `draft` kapan saja; syarat kelengkapan (minimal dua pilihan dan tepat satu kunci) baru berlaku saat status diubah ke `published`.

Soal yang sudah pernah dikerjakan peserta hanya menerima koreksi pada pertanyaan dan pembahasan. Pilihan dan kunci jawaban dibekukan agar hasil attempt lama tetap sah; gunakan tombol duplikasi untuk perubahan substantif.

## Pemeriksaan sebelum commit

```bash
pnpm lint && pnpm test && pnpm build
```

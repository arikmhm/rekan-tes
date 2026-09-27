# Rekan Tes

Platform B2C untuk simulasi tes masuk kerja, dengan fokus awal perbankan dan pembayaran per sesi.

Alur utama MVP sudah berjalan: akun, admin bank soal dan produk tes, pembayaran QRIS lewat DOKU, pengerjaan sampai hasil, dan operasional admin. Tersisa hardening kesiapan rilis ([RT-016](./docs/ISSUES.md)). Dokumentasi lengkap ada di [docs/](./docs/README.md).

## Development

```bash
pnpm install
```

```bash
cp .env.example .env.local
```

Isi `.env.local` mengikuti komentar di `.env.example`, atau tarik nilai database langsung dari Neon:

```bash
pnpx neon@latest env pull
```

```bash
pnpm dev
```

## Database

Schema ada di `src/db/schema.ts`. Setelah mengubahnya, buat lalu terapkan migrasi:

```bash
pnpm db:generate
```

```bash
pnpm db:migrate
```

## Admin pertama

Role admin tidak bisa diberikan lewat UI. Setel lewat database, lalu kelola konten di `/admin`:

```bash
psql "$DATABASE_URL_UNPOOLED" -c "update \"user\" set role='admin' where username='ganti-username';"
```

## Pemeriksaan sebelum commit

```bash
pnpm lint && pnpm test && pnpm build
```

Kredensial DOKU sandbox dapat diperiksa dengan `pnpm doku:check`.

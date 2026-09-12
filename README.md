# Rekan Tes

Platform B2C untuk simulasi tes masuk kerja, dengan fokus awal perbankan dan pembayaran per sesi.

## Status

Fondasi aplikasi sudah menggunakan Next.js App Router dan Tailwind CSS. Halaman publik awal sudah diselaraskan dengan positioning produk, sedangkan fitur akun, bank soal, pembayaran, test engine, dan hasil masih berada dalam backlog.

Urutan implementasi tersedia di [docs/ISSUES.md](./docs/ISSUES.md).

## Dokumentasi

- [Indeks dokumentasi](./docs/README.md)
- [Product Requirements](./docs/PRD.md)
- [Rancangan Database](./docs/DATABASE_DESIGN.md)
- [Keputusan Teknis](./docs/TECH_STACK.md)
- [Backlog Issues](./docs/ISSUES.md)

## Development

```bash
pnpm install
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000).

Pemeriksaan sebelum commit:

```bash
pnpm lint
pnpm build
```

# Dokumentasi Rekan Tes

Dokumen di direktori ini adalah sumber keputusan produk dan teknis untuk MVP Rekan Tes.

## Dokumen

- [Product Requirements](./PRD.md) — kebutuhan, batas MVP, dan user stories.
- [Rancangan Database](./DATABASE_DESIGN.md) — model data, relasi, constraint, dan alur data.
- [Keputusan Teknis](./TECH_STACK.md) — arsitektur, stack, dan konvensi implementasi.
- [Backlog Issues](./ISSUES.md) — urutan pekerjaan, dependensi, serta kriteria selesai.

## Status repository

- Next.js 16 dan React 19 sudah terpasang.
- App Router aktif di `src/app`.
- Tailwind CSS 4 sudah terpasang dan dikonfigurasi.
- Shell halaman publik dan metadata sudah memakai identitas Rekan Tes.
- Zod, Vitest, validasi environment server, dan `.env.example` sudah tersedia.
- Drizzle, Neon driver, schema domain, dan migrasi awal sudah diterapkan ke Neon.
- Better Auth, halaman daftar/masuk, dan otorisasi role sudah tersedia.
- Verifikasi email dan reset password sudah berjalan lewat Resend.
- Admin kategori, bank soal, subtes, dan produk tes sudah tersedia di `/admin`, termasuk validasi publikasi tes.
- Daftar produk publik `/tes` dan detail produk sudah tersedia untuk produk berstatus `published`.
- Kebijakan privasi, syarat layanan, dan kebijakan refund tersedia di `/privasi`, `/syarat`, dan `/refund`.
- Order dan pembayaran QRIS lewat DOKU SNAP sudah tersedia; kredensialnya diisi lewat variabel `DOKU_*` di `.env.local`.
- Webhook DOKU sudah mengaktifkan order dan memberi satu attempt setelah notifikasi QRIS valid.
- Test engine belum diimplementasikan.

Mulai pekerjaan berikutnya dari issue berstatus `Next` di [ISSUES.md](./ISSUES.md). Jika keputusan produk, database, atau stack berubah, perbarui dokumen sumber dan backlog dalam perubahan yang sama.

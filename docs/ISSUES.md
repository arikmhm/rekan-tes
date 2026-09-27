# Backlog Issues — Rekan Tes

Urutan implementasi MVP. Detail issue yang sudah `Done` ada di riwayat git (`git log --grep RT-0xx` atau `git log -- docs/ISSUES.md`); ID-nya masih dirujuk komentar kode. Issue baru ditambahkan di sini dengan tujuan dan acceptance criteria, dan dianggap selesai hanya jika kriterianya terpenuhi serta `pnpm lint && pnpm test && pnpm build` lulus.

## Status

| ID | Pekerjaan | Status |
|---|---|---|
| RT-000 | Fondasi App Router dan shell produk | Done |
| RT-001 | Environment, validasi, dan test runner | Done |
| RT-002 | Neon, Drizzle, schema, dan migrasi MVP | Done |
| RT-003 | Better Auth dan otorisasi dasar | Done |
| RT-004 | Verifikasi email dan reset password | Done |
| RT-005 | Admin kategori dan bank soal | Done |
| RT-006 | Admin subtes, produk tes, dan publikasi | Done |
| RT-007 | Daftar produk publik dan detail tes | Done |
| RT-008 | Dokumen legal minimum | Done |
| RT-009 | Order dan pembayaran QRIS | Done |
| RT-010 | Webhook DOKU dan pemberian attempt | Done |
| RT-011 | Memulai attempt dan urutan subtes | Done |
| RT-012 | Test engine, timer server, dan submit | Done |
| RT-013 | Autosave dan pemulihan progres | Done |
| RT-014 | Scoring, hasil, dan pembahasan | Done |
| RT-015 | Operasional admin dan penggantian akses | Done |
| RT-016 | Hardening dan kesiapan rilis MVP | Next |

## RT-016 — Hardening dan kesiapan rilis MVP

**Status:** Next

**Tujuan:** Membuktikan tiga seam utama PRD sebelum transaksi produksi dibuka.

Acceptance criteria:

- Vitest mencakup publikasi tes, webhook/payment idempotency, otorisasi, timer, autosave, dan scoring.
- Smoke test manual mencakup alur admin, peserta, DOKU Sandbox beserta simulator QRIS, mobile, reload, dan koneksi terputus.
- Logging tidak menyimpan password, token, signature, atau isi secret.
- Error state memiliki pesan yang dapat ditindaklanjuti tanpa membocorkan detail internal.
- `pnpm lint`, `pnpm test`, dan `pnpm build` lulus pada environment release.
- Checklist produksi Vercel, Neon, domain, email, DOKU, privacy, terms, dan refund telah diverifikasi, termasuk:
  - `DOKU_BASE_URL` menunjuk produksi dan Notification URL terdaftar di DOKU Back Office.
  - Alamat kontak di `EMAIL_FROM` benar-benar dapat menerima balasan (MX atau forwarding); Resend hanya mengirim.
  - Dokumen legal ditinjau penasihat hukum.
  - Dua order warisan uji coba yang berstatus `paid` tanpa pembayaran lunas dibersihkan.

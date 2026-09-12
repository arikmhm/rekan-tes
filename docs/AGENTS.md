<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Rekan Tes

Sebelum mengubah implementasi, baca dokumen yang relevan:

- `docs/PRD.md` untuk kebutuhan produk dan batas MVP.
- `docs/DATABASE_DESIGN.md` untuk model data dan constraint.
- `docs/TECH_STACK.md` untuk stack, konvensi aplikasi, dan urutan implementasi.

Aturan proyek:

- Gunakan `pnpm` dan pertahankan satu aplikasi Next.js modular monolith.
- Pertahankan App Router yang aktif di `src/app`.
- Jangan menambah backend terpisah, Redis, queue, WebSocket, atau Playwright tanpa kebutuhan yang sudah disepakati.
- Otorisasi, timer, scoring, dan pembayaran harus diverifikasi di server.
- Jika keputusan produk, database, atau stack berubah, perbarui dokumen sumbernya dan tautan terkait dalam perubahan yang sama.

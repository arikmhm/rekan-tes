<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Rekan Tes

Keputusan produk, database, dan teknis ada di `docs/` (indeks: `docs/README.md`). Baca dokumen yang relevan sebelum mengubah implementasi, dan perbarui dokumen itu dalam perubahan yang sama bila keputusannya berubah.

- Satu aplikasi Next.js modular monolith dengan `pnpm`. Stack cukup yang tercatat di `docs/TECH_STACK.md`; backend terpisah, Redis, queue, WebSocket, atau Playwright butuh kesepakatan dulu.
- Otorisasi, timer, scoring, dan pembayaran diverifikasi di server.

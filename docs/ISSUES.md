# Backlog Issues — Rekan Tes

Dokumen ini menerjemahkan [PRD](./PRD.md), [rancangan database](./DATABASE_DESIGN.md), dan [keputusan teknis](./TECH_STACK.md) menjadi urutan implementasi. Kerjakan dari atas ke bawah kecuali dependensi pada issue menyatakan lain.

## Cara memakai backlog

Status yang digunakan:

- `Done`: sudah tercermin di repository.
- `Next`: pekerjaan berikutnya yang dapat langsung dimulai.
- `Blocked`: membutuhkan keputusan atau akses eksternal.
- `Queued`: menunggu issue sebelumnya.

Satu issue dianggap selesai hanya jika acceptance criteria terpenuhi, lint dan build lulus, serta dokumen sumber ikut diperbarui ketika ada keputusan baru.

## Ringkasan urutan

| Urutan | ID | Pekerjaan | Status | Dependensi |
|---:|---|---|---|---|
| 0 | RT-000 | Fondasi App Router dan shell produk | Done | — |
| 1 | RT-001 | Environment, validasi, dan test runner | Done | RT-000 |
| 2 | RT-002 | Neon, Drizzle, schema, dan migrasi MVP | Done | RT-001 |
| 3 | RT-003 | Better Auth dan otorisasi dasar | Done | RT-002 |
| 4 | RT-004 | Verifikasi email dan reset password | Done | RT-003 |
| 5 | RT-005 | Admin kategori dan bank soal | Done | RT-003 |
| 6 | RT-006 | Admin subtes, produk tes, dan publikasi | Done | RT-005 |
| 7 | RT-007 | Katalog publik dan detail tes | Done | RT-006 |
| 8 | RT-008 | Dokumen legal minimum | Done | RT-007 |
| 9 | RT-009 | Order dan pembayaran QRIS | Done | RT-004, RT-007, RT-008 |
| 10 | RT-010 | Webhook DOKU dan pemberian attempt | Next | RT-009 |
| 11 | RT-011 | Memulai attempt dan urutan subtes | Queued | RT-010 |
| 12 | RT-012 | Test engine, timer server, dan submit | Queued | RT-011 |
| 13 | RT-013 | Autosave dan pemulihan progres | Queued | RT-012 |
| 14 | RT-014 | Scoring, hasil, dan pembahasan | Queued | RT-013 |
| 15 | RT-015 | Operasional admin dan penggantian akses | Queued | RT-010, RT-014 |
| 16 | RT-016 | Hardening dan kesiapan rilis MVP | Queued | RT-001–RT-015 |

## Detail issues

### RT-000 — Fondasi App Router dan shell produk

**Status:** Done

**Tujuan:** Menghapus ketidaksesuaian antara scaffold generik dan identitas produk.

Acceptance criteria:

- Routing memakai `src/app`, root layout, dan Server Component sebagai default.
- Tailwind CSS aktif dari root layout tanpa dependency UI tambahan.
- Metadata, bahasa dokumen, halaman publik, dan disclaimer sesuai PRD.
- README dan status teknis mencerminkan kondisi repository yang sebenarnya.

### RT-001 — Environment, validasi, dan test runner

**Status:** Done

**Tujuan:** Menyiapkan batas minimum agar fitur server berikutnya dapat dikembangkan dan diperiksa.

Hasil implementasi:

- Zod 4 dan Vitest 5 terpasang; script `pnpm test` dan `pnpm test:watch` tersedia.
- `src/lib/env-schema.ts` memvalidasi environment server dan melempar pesan yang menyebut variabel bermasalah serta cara memperbaikinya.
- `src/lib/env.ts` mengekspor singleton `env` dan dijaga paket `server-only`.
- `.env.example` berisi template tanpa secret; `.gitignore` diberi `!.env.example` agar template ikut ter-commit sementara `.env*` lain tetap diabaikan.
- `src/lib/env-schema.test.ts` mencakup environment valid, variabel hilang, nilai kosong, dan connection string non-PostgreSQL.

Acceptance criteria:

- Aplikasi gagal lebih awal dengan pesan jelas ketika environment wajib tidak tersedia. Validasi berjalan saat modul server pertama mengimpor `env`, dimulai pada RT-002.
- `pnpm lint`, `pnpm test`, dan `pnpm build` dapat dijalankan lokal.
- Secret tidak pernah terekspos ke Client Component atau masuk version control. Diverifikasi dengan Client Component percobaan yang mengimpor `env`; `pnpm build` gagal dengan exit code bukan nol.

Catatan: schema hanya memuat `DATABASE_URL`. Variabel Better Auth, email, dan DOKU ditambahkan pada issue yang benar-benar memakainya, bukan lebih awal.

### RT-002 — Neon, Drizzle, schema, dan migrasi MVP

**Status:** Done

**Tujuan:** Membuat sumber data server sesuai `DATABASE_DESIGN.md`.

Hasil implementasi:

- Drizzle ORM, Drizzle Kit, dan `@neondatabase/serverless` terpasang; script `pnpm db:generate` dan `pnpm db:migrate` tersedia.
- `src/db/schema.ts` memuat 6 enum dan 12 tabel domain dengan foreign key, unique constraint, check constraint, dan index.
- `src/db/index.ts` mengekspor `db` dan dijaga paket `server-only`. Driver `neon-serverless` dipilih karena `neon-http` melempar error pada `transaction()`, sementara RT-010 membutuhkan transaksi.
- `drizzle.config.ts` memuat `.env*` melalui `@next/env` dan memakai `DATABASE_URL_UNPOOLED`; `parseMigrationEnv` menolak berjalan tanpa endpoint direct karena pooled dapat menggagalkan DDL.
- Migrasi `drizzle/0000_rich_skin.sql` sudah diterapkan ke Neon (PostgreSQL 18.6).

Acceptance criteria:

- Migrasi dapat diterapkan ke database kosong dan menghasilkan schema yang terdokumentasi. Diverifikasi terhadap Neon: 12 tabel, 6 enum, 9 check constraint, 15 foreign key.
- Constraint mencegah assignment soal duplikat, attempt kedua untuk order yang sama, dan nominal negatif. Diverifikasi dengan 12 percobaan pelanggaran terhadap Neon; seluruhnya ditolak database. Data uji dijalankan dalam transaksi dan di-rollback.
- Koneksi database hanya dibuat dari kode server, dijaga `server-only` pada `src/db/index.ts`.

Catatan: penyimpangan dari `DATABASE_DESIGN.md` dicatat pada bagian 12 dokumen tersebut.

### RT-003 — Better Auth dan otorisasi dasar

**Status:** Done

**Tujuan:** Menyediakan registrasi, login username, logout, session, serta role peserta/admin.

Hasil implementasi:

- Better Auth 1.7.4 dengan username plugin; adapter Drizzle memakai `db` yang sudah ada.
- Tabel auth di `src/db/auth-schema.ts`, diterapkan ke Neon bersama foreign key `orders.user_id`.
- CLI Better Auth tidak dipakai karena rilis stabilnya tertinggal beberapa minor dari library terpasang. Tabel ditulis tangan, lalu `src/db/auth-schema.test.ts` membandingkannya dengan `getAuthTables()` milik library sebagai penjaga perbedaan versi.
- ID dibuat dengan `crypto.randomUUID()` lewat `advanced.database.generateId`, menjaga invariant primary key pada `DATABASE_DESIGN.md`.
- Halaman `/daftar` dan `/masuk`, Route Handler `/api/auth/[...all]`, dan tombol keluar di navigasi.
- Helper otorisasi `src/lib/authz.ts`: `getSession`, `requireUser`, `requireAdmin`, `assertOwner`. Landing `/admin` sudah memakai `requireAdmin`.

Acceptance criteria:

- Username dan email unik, password tidak disimpan di tabel domain aplikasi. Diverifikasi: hash berada di `account` dengan `provider_id=credential`, dan `user` tidak memiliki kolom password.
- Role tidak dapat ditentukan atau diubah oleh peserta. Diverifikasi terhadap Neon: registrasi yang mengirim `role=admin` tersimpan sebagai `participant`, dan `update-user` dengan `role` ditolak `FIELD_NOT_ALLOWED` tanpa mengubah field lain.
- Route admin menolak non-admin di server. Diverifikasi: anonim dan peserta menerima 404, admin menerima 200.
- Peserta tidak dapat membaca data peserta lain. `assertOwner` tersedia dan dipakai mulai RT-009 ketika order serta attempt milik peserta ada.

Catatan: penolakan otorisasi memakai `redirect` dan `notFound`, bukan `forbidden`/`unauthorized` yang masih memerlukan flag eksperimental `authInterrupts`. Role admin diberikan operator lewat database, bukan lewat UI.

### RT-004 — Verifikasi email dan reset password

**Status:** Done

**Tujuan:** Menyelesaikan siklus akun sebelum pembelian diaktifkan.

Hasil implementasi:

- `src/lib/email.ts` mengirim lewat REST API Resend. SDK `resend` tidak dipasang karena satu POST JSON tidak membutuhkannya. Fungsinya murni terhadap environment sehingga dapat diuji tanpa guard `server-only`.
- `sendOnSignUp` dan `sendResetPassword` diaktifkan di `src/lib/auth.ts`; `revokeSessionsOnPasswordReset` menutup sesi lama setelah password diganti.
- Halaman `/lupa-password`, `/reset-password`, dan `/verifikasi-dibutuhkan` beserta tombol kirim ulang verifikasi.
- `requireVerifiedUser` di `src/lib/authz.ts` untuk dipakai jalur pembelian.
- `BETTER_AUTH_URL` menjadi wajib: tautan verifikasi dan reset dibangun darinya, dan nilai keliru membuat tautan tidak terpakai.

Token, masa berlaku, sifat sekali pakai, dan jaminan tidak membocorkan keberadaan email seluruhnya ditangani Better Auth. Tidak ada logika token yang ditulis sendiri.

Acceptance criteria:

- Email verifikasi dikirim setelah registrasi dan tautan kedaluwarsa dengan aman. Diverifikasi: Resend menerima pengiriman dengan status 200 beserta id.
- Email belum terverifikasi tidak dapat membuat order. `requireVerifiedUser` mengarahkan ke `/verifikasi-dibutuhkan`; penerapannya pada checkout menyusul di RT-009 ketika order ada.
- Permintaan reset password tidak membocorkan apakah email terdaftar. Diverifikasi: email terdaftar dan tidak terdaftar memberi respons identik.
- Token sekali pakai tidak dapat digunakan ulang setelah berhasil. Diverifikasi: pemakaian kedua ditolak `INVALID_TOKEN`, sesi lama terhapus, password lama tidak lagi dapat dipakai login.

Catatan: pengirim masih memakai domain uji Resend. Verifikasi domain sendiri sebelum rilis, lalu ubah `EMAIL_FROM`.

### RT-005 — Admin kategori dan bank soal

**Status:** Done

**Tujuan:** Memungkinkan admin mengelola soal single-choice reusable.

Hasil implementasi:

- `src/lib/admin.ts` memuat Server Action dan query admin; `src/lib/question-input.ts` memuat pembacaan slot pilihan dan syarat publikasi sebagai fungsi murni yang dapat diuji.
- Halaman `/admin/kategori`, `/admin/soal`, `/admin/soal/baru`, dan `/admin/soal/[id]`.
- Tanpa Client Component untuk data: formulir memakai Server Action, filter memakai form GET biasa sehingga hasilnya dapat dibagikan lewat URL.
- Lima slot pilihan tetap; slot kosong dibuang dan posisi dirapatkan, sehingga 2 sampai 5 pilihan dapat dibuat tanpa JavaScript tambahan.
- Soal yang sudah dikerjakan: pertanyaan dan pembahasan tetap dapat dikoreksi, sedangkan pilihan dan kunci jawaban dibekukan di server. Tombol duplikasi membuat draft baru dan mengarsipkan versi lama.

Acceptance criteria:

- Non-admin ditolak pada seluruh mutasi server. Diverifikasi: keempat route admin memberi 404 untuk anonim dan peserta. Setiap Server Action membuka dengan `requireAdminMutation`, dikunci oleh `src/lib/admin.guard.test.ts` agar action baru tanpa guard tidak lolos diam-diam.
- Soal draft tidak dapat digunakan untuk tes terbit. Status dan filternya sudah ada; penegakannya berada pada validasi publikasi tes di RT-006.
- Satu soal dapat digunakan kembali tanpa menyalin record soal. Diverifikasi: setelah duplikasi, assignment lama tetap menunjuk record soal asli.

Catatan: `requireAdmin` memakai `notFound` yang cocok untuk halaman, tetapi menghasilkan 500 di dalam Server Action. Karena itu mutasi memakai `requireAdminMutation` yang melempar error biasa.

### RT-006 — Admin subtes, produk tes, dan publikasi

**Status:** Done

**Tujuan:** Menyusun produk tes dari subtes dan assignment soal.

Hasil implementasi:

- Halaman `/admin/subtes` (CRUD subtes) serta `/admin/tes` dan `/admin/tes/[id]` (produk tes, konfigurasi subtes, dan assignment soal).
- Server Action dan query baru menyusul pola RT-005 di `src/lib/admin.ts`; `src/lib/test-publish.ts` memuat syarat publikasi sebagai fungsi murni yang dapat diuji.
- Posisi tidak pernah diketik admin: subtes dan assignment masuk di urutan terakhir lewat subquery `max(position) + 1`, dan urutan subtes diubah dengan tombol naik/turun. Penukaran memarkir satu baris di posisi di luar jangkauan karena `UNIQUE(test_id, position)` melarang dua baris berbagi posisi walau sesaat.
- Daftar soal pada formulir assignment sudah difilter ke soal terbit yang sekategori, tetapi server memeriksa ulang kategori dan status karena form dapat dikirim dari mana saja.
- Durasi diisi dalam menit di UI dan disimpan sebagai detik, sesuai kolom `duration_seconds`.
- Tes yang sudah pernah dikerjakan membekukan susunan subtes dan soalnya; nama, deskripsi, harga, dan status tetap dapat diperbarui.

Acceptance criteria:

- Posisi subtes dan soal unik dalam parent masing-masing. Dijamin unique index dan pemberian posisi oleh database. Diverifikasi terhadap Neon: dua subtes berurutan mendapat posisi 1 dan 2, subtes yang sama ditolak saat dimasukkan dua kali, dan penukaran urutan menghasilkan posisi 1 dan 2 dengan urutan tertukar.
- Produk tidak dapat terbit jika jumlah soal kurang atau mengandung konten tidak valid. Diverifikasi terhadap Neon: publikasi tes tanpa soal ditolak dan status tetap `draft`; setelah soal dilengkapi publikasi berhasil; mengarsipkan satu soal membuat publikasi berikutnya ditolak lagi. Assignment soal beda kategori dan soal ganda juga ditolak server.
- Produk yang sudah memiliki attempt tidak kehilangan konfigurasi historis secara fisik. Seluruh mutasi struktural memeriksa keberadaan `attempt_subtests` pada tes tersebut dan menolak lebih dulu; tidak ada jalur yang menghapus `test_subtests` atau `test_subtest_questions` setelah tes dikerjakan.

Catatan: kelengkapan diperiksa di dalam transaksi yang sama dengan perubahan status, sehingga publikasi yang gagal tidak menyisakan status `published`. Bobot assignment ditetapkan saat penugasan; mengubahnya berarti menghapus lalu menugaskan ulang. Formulir bobot per baris ditambahkan bila penyusunan tes benar-benar membutuhkannya.

### RT-007 — Katalog publik dan detail tes

**Status:** Done

**Tujuan:** Menampilkan hanya produk valid yang dapat dipahami sebelum checkout.

Hasil implementasi:

- Halaman `/tes` (katalog) dan `/tes/[slug]` (detail), memakai `src/app/_components/site-shell.tsx` sebagai kerangka publik bersama.
- `src/lib/catalog.ts` memuat query publik dan konstanta `ACCESS_DAYS`; RT-009 menghitung `orders.access_expires_at` dari konstanta yang sama agar angka di halaman dan di data tidak berbeda.
- `src/lib/format.ts` memformat harga dan durasi untuk locale Indonesia; halaman admin produk tes ikut memakainya agar formatnya tidak bercabang.
- `src/app/not-found.tsx` menangani slug tidak dikenal maupun route lain yang salah, lengkap dengan tautan kembali ke katalog.
- Katalog memakai `dynamic = "force-dynamic"`. Tanpa itu Next.js ikut mem-prerender daftar saat build dan produk baru tidak pernah muncul sampai deploy berikutnya.
- Landing page menautkan katalog dan status pengembangannya diperbarui: pendaftaran dan katalog sudah dibuka, pembayaran belum.

Acceptance criteria:

- Katalog hanya menampilkan tes berstatus `published`. Filter berada di query, bukan di UI. Diverifikasi dengan data uji di Neon: dari dua tes, hanya yang `published` muncul; slug tes draft memberi 404.
- Detail menampilkan harga, urutan subtes, jumlah soal, durasi, masa akses, dan disclaimer independensi. Diverifikasi: harga `Rp 79.000`, 45 soal, 1 jam 15 menit, masa akses 30 hari, dua subtes berurutan beserta soal dan durasinya. Disclaimer berada di footer kerangka publik sehingga selalu ikut tampil.
- Harga dan durasi diformat konsisten untuk locale Indonesia. Dikunci `src/lib/format.test.ts`, termasuk pemisah ribuan dan pemecahan durasi menjadi jam dan menit.
- State kosong dan produk tidak ditemukan memiliki UI yang jelas. Diverifikasi: katalog tanpa produk menampilkan penjelasan, slug tidak dikenal dan slug draft memberi 404 dengan tautan kembali ke katalog.

Catatan: tombol pembelian belum ada. Detail tes menutup dengan keterangan bahwa checkout sedang dikerjakan, diganti alur order pada RT-009.

### RT-008 — Dokumen legal minimum

**Status:** Done

**Tujuan:** Menyediakan informasi wajib sebelum transaksi dibuka.

Hasil implementasi:

- Halaman `/privasi`, `/syarat`, dan `/refund`, memakai `LegalDoc` di `src/app/_components/site-shell.tsx`. Gaya heading dan daftar diatur sekali di kerangka itu agar isi halaman tetap berupa teks.
- `LegalLinks` dipakai footer kerangka publik dan footer landing page, sehingga ketiganya dapat dibuka dari mana saja termasuk halaman detail tes dan halaman 404.
- Detail tes menautkan ketiganya sekali lagi tepat di blok pembelian, yaitu titik keputusan sebelum order dibuat. Checkout RT-009 memakai tautan yang sama.
- Masa akses pada syarat layanan dan kebijakan refund dibaca dari `ACCESS_DAYS`, bukan diketik ulang, sehingga angka di dokumen legal tidak dapat berbeda dari angka di produk.
- Kontak resmi diturunkan dari `EMAIL_FROM` lewat `emailAddress()` di `src/lib/email.ts`, dikunci `src/lib/email.test.ts`. Mengganti domain pengirim sekaligus mengganti kontak di seluruh dokumen legal.

Acceptance criteria:

- Pengguna dapat membaca kebijakan sebelum membuat order. Diverifikasi: `/privasi`, `/syarat`, dan `/refund` memberi 200, dan tautan ketiganya muncul di footer landing page maupun footer katalog dan detail tes.
- Dokumen menjelaskan produk latihan independen, data yang dikumpulkan, masa akses, dan proses refund/penggantian akses. Syarat layanan menegaskan Rekan Tes bukan penyelenggara atau mitra rekrutmen dan tidak menjamin kelulusan; kebijakan privasi merinci data akun, pengerjaan, transaksi, dan teknis beserta pihak ketiga pemrosesnya; kebijakan refund memisahkan pengembalian dana penuh, hal yang tidak dikembalikan, dan penggantian akses setelah verifikasi admin sesuai PRD.

Catatan: kontak masih menunjuk domain uji Resend selama `EMAIL_FROM` belum diganti, dan alamat itu tidak menerima balasan. Ganti `EMAIL_FROM` ke domain sendiri sebelum rilis, seperti sudah dicatat pada RT-004. Dokumen ini adalah kelengkapan minimum MVP, bukan hasil telaah penasihat hukum; tinjau ulang bersama penasihat sebelum transaksi produksi dibuka.

### RT-009 — Order dan pembayaran QRIS

**Status:** Done

**Tujuan:** Membuat pembayaran per sesi tanpa mempercayai harga atau identitas dari browser.

Hasil implementasi:

- `src/lib/doku.ts` membangun kedua tanda tangan DOKU SNAP: asimetris `SHA256withRSA(privateKey, clientId|timestamp)` untuk access token B2B, dan simetris `HMAC-SHA512(clientSecret, METHOD:path:token:sha256hex(body):timestamp)` untuk generate QRIS. SDK resmi tidak dipasang karena keduanya hanya POST JSON. Kredensial diterima sebagai argumen seperti `email.ts`, sehingga tanda tangannya dapat diuji tanpa guard `server-only`.
- MVP memakai satu metode pembayaran: QRIS. Tidak ada halaman pemilihan kanal dan peserta tidak pernah meninggalkan aplikasi.
- `src/lib/order.ts` memuat Server Action `startCheckout` dan query `getOrder`; tombol bayar ada di detail tes dan QR ditampilkan di `/order/[id]`.
- QR dirender di server menjadi SVG memakai paket `qrcode`. Encoder QR bukan sesuatu yang layak ditulis sendiri, dan merender di server membuat isi QR tidak pernah berpindah ke pihak ketiga serta tidak menambah JavaScript di peramban.
- Formulir hanya mengirim slug. Harga, identitas peserta, dan invoice ditentukan server, jadi nilai apa pun dari peramban tidak dapat memengaruhi order.
- `payments.checkout_url` diganti `payments.qr_content` (migrasi `0002` dan `0003`, keduanya sudah diterapkan ke Neon). `request_id` kini menyimpan `X-EXTERNAL-ID` yang wajib numerik dan unik harian, bukan UUID.
- Enam variabel DOKU (`DOKU_CLIENT_ID`, `DOKU_SECRET_KEY`, `DOKU_PRIVATE_KEY`, `DOKU_MERCHANT_ID`, `DOKU_TERMINAL_ID`, `DOKU_POSTAL_CODE`) opsional di `envSchema`; `parseDokuEnv` menuntut semuanya hanya pada jalur QRIS dan menyebutkan mana yang kurang, pola yang sama dengan `parseMigrationEnv`.
- Order pending milik peserta dipakai ulang, dan QRIS yang masih hidup dipakai kembali, sehingga satu peserta tidak menumpuk order maupun QR untuk tes yang sama.
- Galat dari DOKU dicatat di log server, sementara peserta menerima pesan netral. Pesan asli memuat detail konfigurasi yang tidak layak tampil di peramban.

Acceptance criteria:

- Hanya peserta terautentikasi dan terverifikasi yang dapat checkout. Diverifikasi di dev server: anonim diarahkan ke `/masuk`, peserta yang belum memverifikasi email diarahkan ke `/verifikasi-dibutuhkan`, dan tidak ada order maupun payment yang terbentuk pada kedua kasus tersebut.
- Order menyimpan snapshot harga server-side dan masa akses 30 hari setelah pembayaran. Diverifikasi: order tercatat `amount` 25000; setelah harga katalog dinaikkan ke 99000, percobaan pembayaran berikutnya pada order yang sama tetap 25000. `access_expires_at` sengaja tetap null sampai pembayaran berhasil; pengisiannya berada di RT-010 bersama transisi status `paid`.
- Request DOKU ditandatangani di server dan `request_id` idempotent. Komponen kedua tanda tangan dikunci `src/lib/doku.test.ts`, termasuk verifikasi tanda tangan token dengan public key pasangannya dan pencocokan digest hex lowercase pada tanda tangan transaksi. Setiap percobaan pembayaran menyimpan `request_id` numerik dan invoice sendiri sebelum DOKU dipanggil, dijaga unique index `payments_provider_request_id_key`.
- Redirect DOKU hanya menampilkan status; tidak pernah mengaktifkan order. Tidak ada redirect pihak ketiga sama sekali: QR ditampilkan di halaman kami dan `/order/[id]` murni membaca database. Diverifikasi: halaman itu 404 untuk order milik peserta lain, 307 ke `/masuk` untuk anonim, dan tidak memiliki jalur mutasi apa pun.

Pemeriksa kredensial: `pnpm doku:check` memanggil sandbox DOKU sungguhan lewat `src/lib/doku.ts` yang sama dengan aplikasi, sehingga lolosnya pemeriksaan berarti jalur pembayaran ikut lolos. Skrip melaporkan penyebab khas kegagalan token: `Unauthorized. Signature` berarti public key belum terdaftar, `Unknown Client` berarti `DOKU_CLIENT_ID` salah.

Pemetaan kredensial sudah dipastikan terhadap sandbox DOKU: Client ID berformat `BRN-…` adalah client key SNAP, sedangkan API key berformat `doku_key_sandbox_…` dan Client ID numerik pada bagian QRIS ditolak sebagai `Unknown Client` sehingga bukan kredensial SNAP. Client ID numerik itu ternyata `merchantId`, dan NMID tidak perlu dikonfigurasi karena DOKU menyisipkannya sendiri ke payload QRIS.

Diverifikasi terhadap DOKU Sandbox setelah public key merchant didaftarkan di Back Office: `pnpm doku:check` menerima access token B2B dan menerbitkan QRIS. Payload yang kembali memuat NMID, nominal `25000.00`, terminal, kode pos, dan invoice kami. Alur aplikasi juga diuji penuh dari peramban: peserta terverifikasi menekan tombol bayar, order dan payment tercatat, `qr_content` berisi payload QRIS asli dari DOKU (233 karakter), dan QR tampil sebagai SVG di `/order/[id]` dengan masa berlaku yang diambil dari `additionalInfo.validityPeriod` balasan DOKU, bukan dari hitungan sendiri.

Catatan: pembayaran QRIS-nya sendiri belum pernah diselesaikan lewat simulator karena status hanya berubah oleh notifikasi DOKU, yang dibangun pada RT-010. Yang diverifikasi di dev server adalah jalur tanpa kredensial (pesan netral di UI, pesan yang menyebut variabel kurang di log) serta rendering QR, dengan `qr_content` diisi payload QRIS contoh langsung ke database: QR terbit sebagai SVG 51x51 modul, halaman menyegarkan diri tiap 15 detik selama status `pending`, QR kedaluwarsa berganti menjadi ajakan membuat pembayaran baru, dan klik kedua saat QR masih hidup mengarah ke pesanan yang sama tanpa menambah order atau payment. Smoke test DOKU Sandbox beserta simulator QRIS tetap menjadi bagian RT-016.

Keputusan terbuka: DOKU menandatangani balasannya sendiri, dan tanda tangan itu belum diverifikasi. Balasan hanya dibaca untuk mengambil `qrContent` dan jalurnya sudah dilindungi TLS; validasi tanda tangan yang menentukan uang berada di notifikasi RT-010.

### RT-010 — Webhook DOKU dan pemberian attempt

**Status:** Next

**Tujuan:** Mengaktifkan satu attempt secara aman setelah notifikasi pembayaran valid.

Acceptance criteria:

- Signature dan payload notifikasi divalidasi sebelum perubahan data.
- Notifikasi `SUCCESS` mengubah payment/order menjadi paid dan membuat maksimal satu attempt.
- Webhook duplikat menghasilkan state akhir yang sama tanpa attempt tambahan.
- Nominal atau invoice yang tidak cocok ditolak dan tercatat untuk investigasi.
- Transaksi database atau guard setara mencegah state paid tanpa hak akses.

### RT-011 — Memulai attempt dan urutan subtes

**Status:** Queued

**Tujuan:** Mengubah hak akses berbayar menjadi sesi pengerjaan yang terkontrol.

Acceptance criteria:

- Attempt hanya dapat dimulai oleh pemilik order paid yang belum kedaluwarsa.
- Petunjuk tampil sebelum waktu subtes pertama dimulai.
- `started_at` dan seluruh deadline ditetapkan server.
- Peserta hanya dapat membuka subtes aktif berikutnya dan tidak dapat kembali ke subtes submitted.

### RT-012 — Test engine, timer server, dan submit

**Status:** Queued

**Tujuan:** Menyediakan pengalaman pengerjaan pilihan ganda yang adil dan mobile-friendly.

Acceptance criteria:

- UI menampilkan soal, navigasi nomor, pilihan jawaban, dan sisa waktu.
- Timer berasal dari deadline server dan tetap benar setelah reload atau browser ditutup.
- Server menolak perubahan setelah deadline/submission.
- Timeout menyubmit subtes otomatis dan melanjutkan urutan yang valid.
- Jawaban benar tidak dikirim ke browser selama attempt aktif.

### RT-013 — Autosave dan pemulihan progres

**Status:** Queued

**Tujuan:** Mencegah kehilangan jawaban saat reload atau koneksi tidak stabil.

Acceptance criteria:

- Jawaban di-upsert menggunakan key unik assignment dalam attempt subtest.
- Retry request aman dan tidak membuat jawaban duplikat.
- UI menunjukkan state menyimpan, tersimpan, dan gagal; kegagalan tidak diam-diam hilang.
- Reload memulihkan jawaban dan waktu aktif dari server.
- Opsi terpilih divalidasi benar-benar milik soal yang sedang dijawab.

### RT-014 — Scoring, hasil, dan pembahasan

**Status:** Queued

**Tujuan:** Menghitung hasil objektif setelah seluruh subtes selesai.

Acceptance criteria:

- Jawaban benar mendapat weight assignment; salah/kosong bernilai nol tanpa penalti.
- Final score, skor per subtes, dan jumlah benar/salah/kosong dihitung server-side.
- Hasil dan pembahasan hanya tersedia untuk attempt submitted milik peserta.
- Halaman pembahasan menampilkan pilihan peserta, jawaban benar, dan explanation.
- Persentil tidak ditampilkan pada MVP.

### RT-015 — Operasional admin dan penggantian akses

**Status:** Queued

**Tujuan:** Membantu admin menangani masalah transaksi dan pengerjaan tanpa mengubah histori secara sembarang.

Acceptance criteria:

- Admin dapat mencari dan melihat order, payment attempts, serta attempt terkait.
- Tindakan penggantian akses memerlukan alasan dan meninggalkan audit trail minimum.
- Penggantian akses membuat hak baru yang eksplisit; tidak menghapus hasil atau menghidupkan ulang attempt lama.
- Refund dan status order ditampilkan konsisten dengan data payment.

### RT-016 — Hardening dan kesiapan rilis MVP

**Status:** Queued

**Tujuan:** Membuktikan tiga seam utama PRD sebelum transaksi produksi dibuka.

Acceptance criteria:

- Vitest mencakup publikasi tes, webhook/payment idempotency, otorisasi, timer, autosave, dan scoring.
- Smoke test manual mencakup alur admin, peserta, DOKU Sandbox, mobile, reload, dan koneksi terputus.
- Logging tidak menyimpan password, token, signature, atau isi secret.
- Error state memiliki pesan yang dapat ditindaklanjuti tanpa membocorkan detail internal.
- `pnpm lint`, `pnpm test`, dan `pnpm build` lulus pada environment release.
- Checklist produksi Vercel, Neon, domain, email, DOKU, privacy, terms, dan refund telah diverifikasi.

## Keputusan yang masih memblokir

| Keputusan | Dibutuhkan sebelum | Pemilik keputusan |
|---|---|---|
| Blueprint jumlah soal dan durasi produk pertama | Pengisian produk pertama | Produk/penyusun konten |
| Harga produk pertama | RT-007/RT-009 | Produk/bisnis |
| Object storage gambar figural | Saat soal bergambar pertama dibuat | Engineering |

Object storage tidak memblokir soal berbasis teks dan tidak perlu dipasang lebih awal.

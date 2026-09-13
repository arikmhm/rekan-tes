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
| 10 | RT-010 | Webhook DOKU dan pemberian attempt | Done | RT-009 |
| 11 | RT-011 | Memulai attempt dan urutan subtes | Done | RT-010 |
| 12 | RT-012 | Test engine, timer server, dan submit | Done | RT-011 |
| 13 | RT-013 | Autosave dan pemulihan progres | Done | RT-012 |
| 14 | RT-014 | Scoring, hasil, dan pembahasan | Done | RT-013 |
| 15 | RT-015 | Operasional admin dan penggantian akses | Done | RT-010, RT-014 |
| 16 | RT-016 | Hardening dan kesiapan rilis MVP | Next | RT-001–RT-015 |

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

Catatan: pengirim memakai domain sendiri yang sudah terverifikasi di Resend, disetel lewat `EMAIL_FROM` di environment. Domain uji Resend hanya boleh mengirim ke alamat pemilik akun Resend, sehingga registrasi dengan alamat lain gagal dengan 403 selama `EMAIL_FROM` belum diganti. Kegagalan itu terjadi pada background task Better Auth: akun tetap terbuat dan tidak terverifikasi, sementara endpoint registrasi tetap membalas 200.

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

Catatan: kontak mengikuti `EMAIL_FROM` dan kini menunjuk domain sendiri yang sudah terverifikasi. Resend menangani pengiriman, bukan penerimaan, jadi pastikan alamat kontak itu benar-benar dapat menerima balasan (MX atau forwarding) sebelum rilis. Dokumen ini adalah kelengkapan minimum MVP, bukan hasil telaah penasihat hukum; tinjau ulang bersama penasihat sebelum transaksi produksi dibuka.

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

**Status:** Done

**Tujuan:** Mengaktifkan satu attempt secara aman setelah notifikasi pembayaran valid.

Hasil implementasi:

- Notifikasi QRIS memakai skema signature non-SNAP, berbeda dari skema SNAP yang dipakai generate QRIS di RT-009: `Client-Id/Request-Id/Request-Timestamp/Request-Target/Digest` digabung satu baris per komponen lalu di-HMAC-SHA256 dengan secret key yang sama (`DOKU_SECRET_KEY`). Tidak ada variabel environment baru.
- `src/lib/doku.ts` bertambah `verifyNotificationSignature` dan `parseQrisNotification`, keduanya fungsi murni sehingga dapat diuji tanpa memanggil DOKU. Perbandingan signature memakai `timingSafeEqual` agar waktu respons tidak membocorkan seberapa dekat tebakan penyerang.
- `src/lib/webhook.ts` (baru, bukan `"use server"`) memuat `activatePayment`: transisi payment dan order ke `paid`, mengisi `access_expires_at` dari `ACCESS_DAYS`, lalu membuat satu `test_attempts`. Sengaja bukan Server Action — fungsi yang menerima body dan header mentah tidak boleh ikut jadi RPC yang dapat dipanggil langsung dari klien.
- Guard idempotency memakai `UPDATE ... WHERE status <> 'paid'` di dalam transaksi database, bukan tabel log terpisah. Baris hanya berubah sekali; kunci baris Postgres saat `UPDATE` membuat notifikasi yang datang bersamaan tetap aman tanpa perlu lock aplikasi.
- Route Handler `src/app/api/doku/notifications/route.ts` menerima notifikasi. Path-nya (`NOTIFICATION_PATH` di `doku.ts`) harus didaftarkan sama persis sebagai Notification URL di DOKU Back Office, karena path itu ikut ditandatangani sebagai `Request-Target`.
- Ditambahkan konfigurasi `rekan-tes-verify` (port 3099) di `.claude/launch.json` untuk menjalankan dev server verifikasi tanpa mengganggu server pengembangan yang sudah dipakai di port 3000.
- **Backup selain webhook: cek status manual dari halaman pesanan.** Notification URL DOKU wajib dikonfigurasi manual di Back Office dan tidak bisa menjangkau `localhost` sama sekali; keduanya membuat webhook gagal datang pada kondisi yang realistis (belum sempat dikonfigurasi, atau sedang diuji lokal). `payments.reference_no` (kolom baru, migrasi `0004`) menyimpan `referenceNo` balasan generate QRIS. `queryQris` di `doku.ts` menanyakan status transaksi langsung ke DOKU (`/snap-adapter/b2b/v1.0/qr/qr-mpm-query`, skema SNAP yang sama dengan generate — `qrisHeaders` digeneralisasi menerima `path` alih-alih hardcode path generate) dan membaca hasilnya ke bentuk `QrisNotification` yang sama dengan notifikasi webhook.
- `pollPaymentStatus` di `webhook.ts` memakai `queryQris` lalu mendelegasikan ke `activatePayment` yang sama persis dengan yang dipakai webhook — jalur push (webhook) dan jalur pull (cek manual) berbagi satu logika aktivasi dan satu guard idempotency, tidak ada state transition kedua yang bisa berbeda perilaku.
- Pemicunya **manual**, bukan otomatis di setiap render/refresh: Server Action `checkPaymentStatus` di `order.ts` (dipakai lewat tombol "Cek status pembayaran", komponen client `CheckPaymentButton`) menjalankan `pollPaymentStatus` hanya saat ditekan, lalu `revalidatePath` agar render berikutnya membaca database yang sudah diperbarui. Dipilih manual, bukan otomatis, agar tidak memanggil DOKU tanpa alasan setiap kali halaman dibuka atau menyegarkan diri sendiri. `checkPaymentStatus` memakai ulang `getOrder` untuk pengecekan kepemilikan, bukan query kepemilikan kedua yang terpisah. Tombol otomatis hilang begitu status sudah `paid`, dan galat DOKU dibungkus agar tidak menjatuhkan seluruh Server Action.

Acceptance criteria:

- Signature dan payload notifikasi divalidasi sebelum perubahan data. Diverifikasi terhadap route yang berjalan sungguhan: signature yang dipalsukan ditolak 401 tanpa menyentuh database; payload tanpa `order.invoice_number`/`transaction.status` ditolak sebelum lookup apa pun.
- Notifikasi `SUCCESS` mengubah payment/order menjadi paid dan membuat maksimal satu attempt. Diverifikasi terhadap Neon dengan notifikasi bertanda tangan asli (kredensial sandbox DOKU): payment `paid`, order `paid` dengan `access_expires_at` 30 hari ke depan, tepat satu baris `test_attempts`.
- Webhook duplikat menghasilkan state akhir yang sama tanpa attempt tambahan. Diverifikasi: notifikasi sukses yang sama dikirim ulang, `paid_at` dan id attempt tidak berubah. Dua notifikasi sukses untuk order yang sama dikirim bersamaan (`Promise.all`) juga hanya menghasilkan satu attempt.
- Nominal atau invoice yang tidak cocok ditolak dan tercatat untuk investigasi. Diverifikasi: nominal yang tidak cocok memberi `400 amount_mismatch`, invoice yang tidak dikenal memberi `400 not_found`, keduanya dicatat lewat `console.error` dan order/payment tetap `pending`.
- Transaksi database atau guard setara mencegah state paid tanpa hak akses. Seluruh transisi berada dalam satu `db.transaction`; guard `WHERE status <> 'paid'` adalah kunci baris Postgres, bukan pemeriksaan aplikasi yang bisa kalah start dalam race.

Catatan: signature pada balasan DOKU dari RT-009 (`generateQris`) masih belum diverifikasi, sebagaimana dicatat di sana; RT-010 ini menutup bagian yang sebenarnya menentukan uang, yaitu notifikasi pembayaran. Status `FAILED`/lainnya diakui dengan 200 tanpa mengubah apa pun, mengikuti panduan resmi DOKU bahwa integrasi Checkout/QRIS tidak boleh bereaksi terhadap status gagal.

Verifikasi backup cek manual: dijalankan penuh terhadap DOKU Sandbox sungguhan, termasuk pembayaran nyata lewat [QRIS Simulator](https://sandbox.doku.com/qris-simulator/) DOKU.

- Iterasi awal (otomatis di setiap render): QR yang belum dibayar diquery dan benar kembali `PENDING`; setelah simulator melaporkan `Success`, memuat ulang halaman pesanan **tanpa Notification URL pernah dikonfigurasi** (server verifikasi di `localhost:3099`, memang tidak bisa dituju DOKU) membuat status langsung berubah `paid`, `access_expires_at` terisi, dan tepat satu `test_attempts` dibuat. Diganti pemicu manual setelah diverifikasi, atas permintaan agar DOKU tidak dipanggil tanpa alasan di setiap render/refresh.
- Setelah diganti tombol manual (`checkPaymentStatus`, komponen `CheckPaymentButton`): ditekan sebelum pembayaran — tampil "Belum terbaca sebagai lunas…" dan database tidak berubah. Setelah pembayaran nyata lewat simulator, webhook yang sudah didaftarkan peserta ke `https://rekan-tes-muxb.vercel.app/api/doku/notifications` justru lebih dulu memproses notifikasi ke database bersama (Neon yang sama dipakai lokal dan produksi) sebelum tombol sempat ditekan lagi — bukti independen bahwa webhook produksi sudah berjalan benar. Tombol otomatis hilang begitu status `paid`; tepat satu `test_attempts` tetap ada, tidak ada duplikasi walau dua jalur aktivasi (webhook dan cek manual) bisa saja berebut baris yang sama.

### RT-011 — Memulai attempt dan urutan subtes

**Status:** Done

**Tujuan:** Mengubah hak akses berbayar menjadi sesi pengerjaan yang terkontrol.

Hasil implementasi:

- **Satu route untuk seluruh sesi: `/attempt/[id]`.** Tidak ada URL per subtes. Server yang menentukan subtes mana yang sedang berjalan, sehingga "tidak bisa melompat ke subtes berikutnya" dan "tidak bisa kembali ke subtes yang sudah disubmit" dijaga oleh struktur, bukan oleh pemeriksaan yang harus diulang di setiap route. Tidak ada nomor subtes di URL yang bisa ditebak atau diubah peserta.
- `src/lib/attempt-flow.ts` (baru) memuat aturan urutannya sebagai fungsi murni — `attemptAccessProblem`, `activeSubtest`, `nextSubtest`, `subtestDeadline`, `isDone` — dan diuji tanpa database di `attempt-flow.test.ts`, mengikuti alasan yang sama dengan `test-publish.ts`: file `"use server"` hanya boleh mengekspor fungsi async.
- Deadline **tidak** disimpan sebagai kolom. `subtestDeadline` menghitungnya dari `attempt_subtests.started_at` milik server dan `test_subtests.duration_seconds`, sehingga tidak ada dua sumber kebenaran yang bisa berbeda. Peramban tidak pernah mengirimkan waktu apa pun.
- `src/lib/attempt.ts` (baru, `"use server"`) memuat `getAttempt`, `startAttempt`, dan `submitSubtest`. `getAttempt` memverifikasi kepemilikan lewat `assertOwner` yang sama dengan order, dan me-LEFT JOIN konfigurasi `test_subtests` dengan progres `attempt_subtests` karena baris progres baru ada setelah attempt dimulai — halaman petunjuk tetap perlu menampilkan susunan subtes sebelum itu.
- Hak akses dibaca dari **order**, bukan dari attempt: attempt hanya ada karena order lunas, dan `access_expires_at` yang lewat mencabut hak walau attempt masih berjalan.
- `startAttempt` memakai guard idempotency berbentuk sama dengan aktivasi pembayaran RT-010: `UPDATE ... WHERE status = 'not_started'` di dalam transaksi. Klik ganda atau dua tab tidak menggeser `started_at` yang sudah berjalan dan tidak membuat baris `attempt_subtests` ganda.
- Hanya subtes pertama yang jamnya berjalan saat attempt dimulai; subtes berikutnya menerima `started_at` dari `submitSubtest` dalam transaksi yang sama dengan submit pendahulunya. Durasi subtes tidak habis sementara peserta masih mengerjakan subtes sebelumnya, dan tidak pernah ada keadaan "subtes tertutup tetapi tidak ada penerusnya".
- Petunjuk (jumlah subtes, total durasi, aturan timer server, subtes tidak dapat dibuka ulang, masa akses) tampil di halaman yang sama selama attempt masih `not_started`. Timer subtes pertama baru berjalan setelah tombol "Mulai mengerjakan" ditekan.
- Halaman pesanan menambahkan pintu masuk "Buka sesi pengerjaan" begitu order `paid` dan attempt-nya ada; `getOrder` ikut me-LEFT JOIN `test_attempts` untuk mendapatkan id-nya, bukan query kedua.
- Mesin soal, navigasi nomor, hitung mundur, dan auto-submit saat waktu habis **sengaja belum ada** — itu RT-012. Kartu subtes aktif sudah menampilkan nama, jumlah soal, dan batas waktu server, dengan tombol "Kumpulkan subtes" untuk meneruskan urutan.

Acceptance criteria:

- Attempt hanya dapat dimulai oleh pemilik order paid yang belum kedaluwarsa. Kepemilikan lewat `assertOwner` (attempt milik orang lain menjadi 404, anonim diarahkan ke `/masuk`), status dan masa akses lewat `attemptAccessProblem` yang diuji unit. Diverifikasi terhadap dev server: `/attempt/<id acak>` tanpa sesi mengembalikan 404 tanpa menyentuh data.
- Petunjuk tampil sebelum waktu subtes pertama dimulai. Attempt `not_started` hanya merender petunjuk dan tombol mulai; `started_at` baru ditulis di dalam Server Action tombol itu.
- `started_at` dan seluruh deadline ditetapkan server. Seluruh nilai waktu berasal dari `new Date()` di dalam Server Action, tidak ada waktu dari formulir; deadline diturunkan, bukan disimpan.
- Peserta hanya dapat membuka subtes aktif berikutnya dan tidak dapat kembali ke subtes submitted. Tidak ada route per subtes yang dapat dituju; `activeSubtest` mengembalikan subtes pertama yang belum disubmit dan diuji untuk kasus urutan acak, subtes timeout, dan seluruh subtes selesai.

Catatan verifikasi: lint, `vitest run`, dan `next build` lulus; guard anonim diverifikasi terhadap dev server yang berjalan (`/attempt/<id acak>` → 404). Jalur berbayar dari ujung ke ujung menyusul diverifikasi di peramban saat pengujian RT-012, memakai data uji yang dibuat langsung di database lalu dihapus: petunjuk tampil pada attempt `not_started`, tombol mulai menetapkan `started_at` server dan menjalankan hanya subtes pertama, submit menutup subtes itu dan menjalankan penerusnya, dan submit pada subtes terakhir menutup attempt sebagai `submitted`. Detailnya di RT-012.

Catatan data: dua order berstatus `paid` yang ada di database dijadikan paid secara manual saat pengujian awal (payment-nya masih `pending`, `paid_at` dan `access_expires_at` kosong), bukan lewat `activatePayment`, sehingga keduanya tidak punya attempt dan tidak akan bisa dikerjakan. Sisa uji coba lama, bukan cacat alur.

### RT-012 — Test engine, timer server, dan submit

**Status:** Done

**Tujuan:** Menyediakan pengalaman pengerjaan pilihan ganda yang adil dan mobile-friendly.

Hasil implementasi:

- Mesin soal menempel pada route tunggal `/attempt/[id]` milik RT-011; nomor soal hanya query string (`?soal=3`) yang dijepit ke rentang yang ada. Tidak ada route baru, sehingga penjagaan urutan subtes tetap satu tempat.
- **Kunci jawaban tidak pernah meninggalkan database.** Query soal hanya men-`select` id, prompt, label, dan isi opsi; `question_options.is_correct` dan `questions.explanation` tidak ikut. Bukan disembunyikan di UI — memang tidak pernah masuk payload.
- Sisa waktu dihitung server (`remainingSeconds` dari deadline server), lalu komponen `Countdown` menghitung mundur memakai waktu yang berlalu sejak dipasang, bukan jam peramban, sehingga jam klien yang salah setel tidak menggeser sisa waktu. Saat mencapai nol ia hanya meminta `router.refresh()`; server yang memutuskan subtes ditutup.
- **Timeout tidak butuh cron atau job.** `timeoutPlan` di `attempt-flow.ts` menghitung subtes mana yang seharusnya sudah tertutup, dan `getAttempt` menerapkannya sebelum halaman maupun Server Action mana pun melihat datanya. Satu guard di fungsi yang dilewati semua jalur, bukan pemeriksaan waktu yang harus diulang di setiap pemanggil.
- Subtes penerus dimulai pada **deadline pendahulunya**, bukan pada saat halaman dibuka, sehingga menutup peramban tidak menghadiahi waktu tambahan. Satu kunjungan karena itu dapat menutup beberapa subtes sekaligus; `timeoutPlan` mengembalikan daftar langkah dan seluruhnya dijalankan dalam satu transaksi.
- `saveAnswer` memvalidasi assignment dan opsi terhadap soal subtes yang sedang berjalan — datanya berasal dari `getAttempt`, jadi id yang dikarang klien tidak akan ditemukan, dan opsi milik soal lain ditolak. Penolakan setelah deadline datang gratis: subtes yang waktunya habis sudah tidak `in_progress` saat validasi berjalan, jadi tidak ada pemeriksaan waktu kedua yang bisa berbeda.
- Penyimpanan memakai `onConflictDoUpdate` pada key unik `(attempt_subtest_id, test_subtest_question_id)`, sehingga pengiriman ulang tidak pernah menghasilkan jawaban ganda.
- Tombol "Kumpulkan subtes" ikut mengirim id subtes yang dilihat peserta dan server menolak bila sudah berpindah. Tanpa ini, halaman basi yang subtesnya keburu tertutup karena waktu habis akan menyubmit subtes **berikutnya** seketika dan menghabiskan waktunya tanpa satu soal pun terlihat.
- Menjawab memakai tombol submit per opsi, bukan state klien, jadi tetap berjalan tanpa JavaScript. Indikator "menyimpan/tersimpan/gagal" dan pengiriman tanpa muat ulang sengaja ditinggalkan untuk RT-013.

Acceptance criteria:

- UI menampilkan soal, navigasi nomor, pilihan jawaban, dan sisa waktu. Diverifikasi di peramban terhadap data uji: soal 1–3 dengan navigasi nomor, tiga opsi, dan "Sisa waktu 1:59" yang berjalan.
- Timer berasal dari deadline server dan tetap benar setelah reload atau browser ditutup. Diverifikasi: berpindah nomor soal dan memuat ulang halaman tidak menyetel ulang hitungan (1:59 → 1:19 → 0:55 sesuai waktu nyata yang berlalu); jawaban yang tersimpan ikut terpulihkan sebagai opsi terpilih.
- Server menolak perubahan setelah deadline/submission. Diverifikasi dengan halaman yang sengaja dibuat basi (durasi subtes dipendekkan di database di belakang halaman yang sedang terbuka): menekan opsi mengembalikan "Jawaban tidak dapat disimpan; subtes mungkin sudah berpindah", `attempt_answers` tetap kosong, dan menekan "Kumpulkan subtes" mengembalikan "Subtes sudah berpindah karena waktunya habis" tanpa menutup subtes berikutnya.
- Timeout menyubmit subtes otomatis dan melanjutkan urutan yang valid. Diverifikasi terhadap Neon: subtes 1 (120 detik, mulai 10:22:14) tercatat `submitted_by_timeout` pada 10:24:14 dan subtes 2 (60 detik) mulai tepat pada 10:24:14 lalu tertutup pada 10:25:14 — keduanya pada deadline masing-masing, bukan pada 10:26 saat halaman akhirnya dibuka, dan attempt menjadi `submitted_by_timeout`. Submit manual pada subtes terakhir menutup attempt sebagai `submitted`.
- Jawaban benar tidak dikirim ke browser selama attempt aktif. Diverifikasi terhadap HTML+payload RSC halaman yang sedang dikerjakan (33 KB): nol kemunculan `is_correct`, `isCorrect`, `explanation`, maupun teks pembahasan.

Catatan verifikasi: dijalankan penuh di peramban memakai data uji bertanda `RT012UJI` (user, kategori, 5 soal, 1 produk tes 2 subtes berdurasi 120 dan 60 detik, 2 order paid, 2 attempt) yang dibuat langsung di database dan **dihapus seluruhnya setelah selesai** — hitungan baris kembali ke kondisi semula dan tidak ada jejak `RT012UJI` tersisa. Satu kegagalan yang muncul saat pengujian (`Failed query ... fetch failed` tepat ketika deadline lewat) adalah gangguan koneksi Neon sesaat, bukan perilaku aplikasi: skrip pemeriksa dan login pengguna lain gagal pada detik yang sama, dan muat ulang berikutnya langsung menerapkan seluruh transisi timeout dengan benar.

### RT-013 — Autosave dan pemulihan progres

**Status:** Done

**Tujuan:** Mencegah kehilangan jawaban saat reload atau koneksi tidak stabil.

Hasil implementasi:

- **Sebagian besar issue ini sudah terpenuhi oleh bentuk RT-012 dan tidak ditulis ulang di sini.** Penyimpanan sudah berupa `onConflictDoUpdate` pada key unik `(attempt_subtest_id, test_subtest_question_id)`, validasi opsi sudah dilakukan terhadap soal subtes berjalan, dan pemulihan setelah reload sudah datang dari server karena halaman tidak pernah menyimpan state pengerjaan di klien. Yang benar-benar kurang hanyalah status simpan yang terlihat peserta.
- `AnswerOptions` memakai `useOptimistic`, sehingga pilihan muncul seketika sementara penyimpanan berjalan di latar. Nilai optimistis kembali sendiri ke nilai server saat aksi selesai, jadi penyimpanan yang gagal tampak sebagai pilihan yang batal — bukan centang yang menipu peserta seolah jawabannya sudah aman.
- Tiga status terlihat: "Menyimpan…" selagi berjalan, "Tersimpan" setelah berhasil, dan kotak merah `role="alert"` ketika gagal. Ruang teks status dipesan (`min-h-5`) agar daftar opsi tidak bergeser saat statusnya berubah.
- Kegagalan pengiriman ditangkap di klien. Tanpa itu, aksi yang gagal terkirim (koneksi putus, server mati) melempar ke error boundary dan **seluruh halaman pengerjaan hilang bersama sisa waktu yang sedang berjalan** — kegagalan autosave justru menjadi kerugian terbesar, kebalikan dari tujuan issue ini.
- `pending` diperiksa sebelum `galat` saat merender status. `useActionState` menahan state lama selagi aksi baru berjalan, sehingga tanpa urutan ini percobaan ulang menampilkan pesan gagal milik percobaan sebelumnya — terlihat seperti gagal lagi padahal sedang berjalan. Ditemukan saat verifikasi, bukan dari membaca kode.
- **Trade-off yang diambil sadar:** membungkus Server Action dengan closure klien menghilangkan progressive enhancement, jadi menjawab kini butuh JavaScript. Ditukar dengan penangkapan galat di atas; halaman pengerjaan toh sudah membutuhkan JavaScript untuk hitung mundur. Dicatat di komentar `answer-options.tsx` agar tidak dikira masih jalan tanpa JavaScript.
- Tidak ada retry otomatis, debounce, atau antrean offline. Peserta memilih ulang setelah koneksi pulih, dan upsert membuat pengulangan itu aman. Tambahkan bila data lapangan menunjukkan peserta benar-benar kehilangan jawaban karena koneksi, bukan karena mengantisipasinya lebih dulu.

Acceptance criteria:

- Jawaban di-upsert menggunakan key unik assignment dalam attempt subtest. Diverifikasi di peramban: mengganti jawaban B → A → C pada soal yang sama menyisakan tepat satu baris `attempt_answers` yang berubah isinya.
- Retry request aman dan tidak membuat jawaban duplikat. Diverifikasi: tiga klik beruntun (C, C, A) tanpa jeda menghasilkan satu baris dengan klik terakhir sebagai isinya.
- UI menunjukkan state menyimpan, tersimpan, dan gagal; kegagalan tidak diam-diam hilang. Diverifikasi dengan `window.fetch` yang sengaja dibuat gagal untuk meniru koneksi putus: "Menyimpan…" muncul dalam 120 ms, "Tersimpan" setelah berhasil, dan saat gagal muncul kotak merah sementara pilihan kembali ke jawaban terakhir yang benar-benar tersimpan. Database tidak berubah pada percobaan yang gagal.
- Reload memulihkan jawaban dan waktu aktif dari server. Diverifikasi: setelah muat ulang penuh, opsi yang tersimpan kembali tertandai dan hitung mundur melanjutkan waktu server, bukan mengulang dari awal.
- Opsi terpilih divalidasi benar-benar milik soal yang sedang dijawab. Diverifikasi pada RT-012 lewat halaman basi yang subtesnya sudah berpindah: assignment-nya tidak ditemukan di soal subtes berjalan dan penyimpanan ditolak.

Catatan verifikasi: memakai data uji bertanda `RT013UJI` yang dibuat langsung di database lalu dihapus seluruhnya; hitungan akhir `attempt_answers` dan `test_attempts` kembali nol tanpa jejak tersisa.

### RT-014 — Scoring, hasil, dan pembahasan

**Status:** Done

**Tujuan:** Menghitung hasil objektif setelah seluruh subtes selesai.

Hasil implementasi:

- **Kebenaran dibekukan, bukan dihitung ulang saat hasil dibaca.** `scoreSubtest` mengisi `attempt_answers.is_correct` dari kunci yang berlaku tepat ketika subtes ditutup, lalu menjumlahkan bobotnya ke `attempt_subtests.score`. Koreksi soal di kemudian hari karena itu tidak dapat diam-diam mengubah hasil attempt lama — janji yang sudah ada di PRD tetapi belum punya penegaknya sampai sekarang.
- Penilaian dipanggil dari **kedua** jalur penutupan, submit manual dan timeout, di dalam transaksi yang sama dengan penutupannya. Tidak ada subtes tertutup yang bisa lolos tanpa nilai, dan tidak perlu job terpisah yang bisa mati diam-diam. `finalizeAttempt` mengisi `test_attempts.final_score` saat subtes terakhir tertutup, lewat jalur mana pun.
- **Satu definisi "soal mana yang tampil".** `presentedQuestions` (assignment terurut `position`, dipotong `question_limit`) kini dipakai bersama oleh halaman pengerjaan dan halaman hasil. Kalau keduanya memakai aturan sendiri, pembahasan bisa memuat soal yang tidak pernah ditampilkan atau melewatkan soal yang dijawab.
- Kunci jawaban dan `explanation` tetap tidak pernah ikut di-select pada jalur pengerjaan; keduanya hanya dibaca `getResult`, yang berhenti lebih dulu bila attempt belum selesai. Status attempt karena itu satu-satunya pintu yang menentukan kunci boleh keluar, bukan pilihan kolom yang tersebar di beberapa query.
- Aturan skornya sendiri berupa fungsi murni `ringkasSubtes` di `attempt-flow.ts` dan diuji tanpa database, termasuk kasus `is_correct` yang masih null pada soal terjawab — dihitung salah, bukan benar, agar kegagalan penilaian tidak pernah menguntungkan skor.
- Halaman `/attempt/[id]/hasil` memuat skor akhir, jumlah benar/salah/kosong, skor per subtes, dan pembahasan setiap soal dengan penanda "pilihanmu" serta "kunci". Penanda benar/salah/kosong memakai teks, bukan hanya warna. Pintu masuknya dari kartu penyelesaian sesi dan dari daftar pesanan di `/akun`.
- Persentil tidak ditampilkan, dan halaman menyebutkan alasannya secara terbuka ketimbang membiarkan peserta menduga angkanya hilang.
- `attempt_subtests.score` dan `test_attempts.final_score` tetap disimpan meski halaman hasil menurunkan angkanya sendiri dari `is_correct`: keduanya dibaca daftar pesanan `/akun` tanpa harus membuka seluruh jawaban satu per satu. Kedua angka berasal dari data beku yang sama, jadi tidak mungkin berbeda.

Acceptance criteria:

- Jawaban benar mendapat weight assignment; salah/kosong bernilai nol tanpa penalti. Diverifikasi dengan bobot sengaja dibuat tidak seragam (1, 3, 2 dan 5, 1): menjawab benar soal berbobot 1 dan salah pada soal berbobot 3 memberi skor subtes 1 dari 6 — skor mengikuti bobot, bukan jumlah jawaban benar, dan jawaban salah tidak mengurangi apa pun.
- Final score, skor per subtes, dan jumlah benar/salah/kosong dihitung server-side. Diverifikasi terhadap Neon: `attempt_subtests.score` 1 dan 1, `test_attempts.final_score` 2, dan halaman menampilkan angka yang sama beserta 2 benar / 1 salah / 2 kosong.
- Hasil dan pembahasan hanya tersedia untuk attempt submitted milik peserta. Diverifikasi: tanpa sesi → 307 ke `/masuk`; attempt milik orang lain → 404; attempt yang belum tuntas → 307 balik ke halaman sesi, baik saat `not_started` maupun `in_progress`.
- Halaman pembahasan menampilkan pilihan peserta, jawaban benar, dan explanation. Diverifikasi pada ketiga keadaan soal: benar (pilihan peserta sekaligus kunci), salah (pilihan peserta dan kunci ditandai terpisah), dan kosong (hanya kunci).
- Persentil tidak ditampilkan pada MVP. Tidak ada perhitungan persentil di kode mana pun.

Catatan verifikasi: memakai data uji `RT014UJI` yang dibuat langsung di database lalu dihapus seluruhnya (`test_attempts`, `attempt_subtests`, dan `attempt_answers` kembali nol, tidak ada akun uji tersisa). Penilaian jalur timeout ikut diuji sungguhan dengan subtes berdurasi 60 detik yang dibiarkan habis. Sebagai regresi RT-012, halaman pengerjaan yang sedang aktif dibaca ulang setelah refaktor `presentedQuestions`: nol kemunculan `is_correct`, `isCorrect`, maupun `explanation` di seluruh payload.

### RT-015 — Operasional admin dan penggantian akses

**Status:** Done

**Tujuan:** Membantu admin menangani masalah transaksi dan pengerjaan tanpa mengubah histori secara sembarang.

Hasil implementasi:

- **Jejak audit tanpa tabel log.** Hak pengganti *adalah* sebuah order, jadi tiga kolom baru pada `orders` (`granted_by`, `grant_reason`, `replaces_order_id`, migrasi `0005`) sekaligus menjadi catatannya. Satu pemberian = satu baris order, sehingga log tidak mungkin melenceng dari hal yang dicatatnya — berbeda dengan tabel audit terpisah yang bisa kosong, dobel, atau menunjuk order yang sudah berubah.
- Constraint database menegakkan jejaknya, bukan kode aplikasi: `orders_grant_reason_with_granter` menolak baris yang punya pemberi tanpa alasan atau sebaliknya, dan `replaces_order_id` mereferensikan `orders.id` sendiri sehingga tidak bisa menunjuk order yang tidak ada.
- `grantReplacementAccess` membuat order baru bernilai nol berstatus `paid` dengan masa akses baru, lalu satu attempt baru — dan **tidak menyentuh order lama sama sekali**: tidak menghapus hasil, tidak menghidupkan ulang attempt yang sudah selesai, tidak mengubah statusnya. Nilainya nol supaya penggantian tidak pernah tercampur dengan angka penjualan.
- Pencarian menyasar apa yang benar-benar dipegang peserta saat mengeluh: username, email, nomor invoice, atau id pesanan yang mereka salin dari URL. Satu kolom pencarian, bukan empat filter terpisah.
- **Ketidakcocokan order dan pembayaran ditandai, bukan diperbaiki diam-diam.** `orderPaymentMismatch` (fungsi murni, diuji tanpa database) menamai selisihnya untuk admin. Memperbaikinya otomatis justru akan menyembunyikan kasus yang perlu diperiksa manusia.
- Order penggantian dikecualikan dari pemeriksaan itu: lunas tanpa pembayaran adalah bentuk yang benar baginya. Ditemukan saat verifikasi — versi pertama menandai setiap pemberian sebagai janggal, yang akan melatih admin mengabaikan peringatan ini sampai yang sungguhan janggal ikut terlewat.
- Refund tidak dieksekusi dari panel. Kebijakan refund MVP memang manual lewat kanal DOKU, jadi panel hanya menampilkan status payment apa adanya; tombol refund yang tidak benar-benar memindahkan uang lebih berbahaya daripada tidak ada tombol sama sekali.

Acceptance criteria:

- Admin dapat mencari dan melihat order, payment attempts, serta attempt terkait. Diverifikasi terhadap data sungguhan di Neon: pencarian `memoir` (username) 2 baris, nomor invoice `RTMTYXRVKQCD0ED4` 1 baris, id pesanan 1 baris, `mhm.ariyanto` (email) 1 baris, filter `status=paid` 2 baris, kata yang tidak ada 0 baris. Halaman detail menampilkan pesanan, seluruh percobaan pembayaran, dan sesi pengerjaannya.
- Tindakan penggantian akses memerlukan alasan dan meninggalkan audit trail minimum. Diverifikasi: alasan pendek ditolak server **setelah atribut `minlength` dilepas dari DOM**, jadi penolakannya bukan sekadar validasi peramban. Pemberian yang sah menyimpan admin pemberi, alasan lengkap, dan order yang digantikan; keduanya tampil di halaman detail kedua order.
- Penggantian akses membuat hak baru yang eksplisit; tidak menghapus hasil atau menghidupkan ulang attempt lama. Diverifikasi terhadap Neon sebelum dan sesudah: order pengganti baru (Rp 0, `paid`, masa akses terisi, attempt `not_started`), sementara order lama tidak berubah sama sekali — status, nilai, masa akses, dan ketiadaan attempt-nya identik.
- Refund dan status order ditampilkan konsisten dengan data payment. Diverifikasi pada dua order warisan yang memang janggal (berstatus `paid` padahal payment-nya masih `pending`): keduanya memunculkan peringatan yang menyebutkan selisihnya, sementara order penggantian yang sah tidak.

Catatan verifikasi: dijalankan sebagai admin sungguhan lewat sesi sementara, terhadap data produksi-pengembangan yang ada. Order penggantian hasil uji beserta attempt-nya dihapus setelah selesai dan order lama diperiksa ulang masih utuh; hitungan akhir kembali ke 3 order, 0 attempt, 0 pemberian.

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

# Use Case Diagram — Rekan Tes

Diagram disusun dari kode yang benar-benar ada (`src/lib/*.ts`, route `src/app/**`)
dan disilangkan dengan user story pada [PRD.md](./PRD.md).

## Aktor

| Aktor | Peran |
|---|---|
| **Pengunjung** | Belum punya akun. Bisa melihat etalase dan mencoba simulasi gratis. |
| **Peserta** (`role = participant`) | Generalisasi dari Pengunjung. Membeli sesi, mengerjakan tes, melihat hasil. |
| **Admin** (`role = admin`) | Mengelola bank soal, subtes, produk tes, dan menangani masalah operasional. |
| **DOKU** (aktor sistem) | Payment gateway QRIS: generate QR, Query QRIS, HTTP Notification. |
| **Layanan Email** (aktor sistem) | Mengirim tautan verifikasi email dan setel ulang password. |
| **Waktu Server** (aktor waktu) | Memicu batas waktu subtes dan kedaluwarsa akses/pembayaran. |

## Diagram

```mermaid
flowchart LR
  %% ======================= AKTOR =======================
  PENGUNJUNG(["👤 Pengunjung"])
  PESERTA(["👤 Peserta"])
  ADMIN(["👤 Admin"])
  DOKU(["⚙️ DOKU<br/>Payment Gateway"])
  EMAIL(["⚙️ Layanan Email"])
  WAKTU(["⏱️ Waktu Server"])

  PESERTA -. "generalisasi" .-> PENGUNJUNG
  ADMIN -. "generalisasi" .-> PESERTA

  %% ======================= SISTEM =======================
  subgraph SYS["Sistem Rekan Tes"]
    direction TB

    subgraph AKUN["Akun & Autentikasi"]
      direction TB
      A1("Daftar akun<br/>username, email, password")
      A2("Verifikasi email")
      A3("Kirim ulang tautan verifikasi")
      A4("Masuk")
      A5("Keluar")
      A6("Minta tautan setel ulang password")
      A7("Setel ulang password")
      A8("Lihat profil")
    end

    subgraph ETALASE["Etalase & Informasi"]
      direction TB
      K1("Lihat beranda")
      K2("Lihat daftar produk")
      K3("Lihat detail produk<br/>subtes, jumlah soal, durasi, harga")
      K4("Coba simulasi gratis<br/>tanpa daftar")
      K5("Baca syarat, privasi, refund")
      K6("Baca pernyataan<br/>simulasi independen")
    end

    subgraph BELI["Pembelian & Pembayaran"]
      direction TB
      B0("Pastikan email terverifikasi")
      B1("Checkout sesi tes")
      B2("Kunci harga pada order")
      B3("Buat pembayaran QRIS")
      B4("Bayar QRIS")
      B5("Terima HTTP Notification")
      B6("Verifikasi signature notifikasi")
      B7("Cek status pembayaran<br/>Query QRIS")
      B8("Aktifkan akses 30 hari<br/>+ buat attempt")
      B9("Lihat daftar pesanan")
      B10("Lihat detail pesanan & QR")
      B11("Tandai pembayaran kedaluwarsa")
    end

    subgraph KERJA["Pengerjaan Tes"]
      direction TB
      T1("Lihat pustaka sesi")
      T2("Baca petunjuk sebelum timer")
      T3("Mulai attempt")
      T4("Periksa hak akses<br/>& masa berlaku")
      T5("Kerjakan subtes berurutan")
      T6("Autosave jawaban")
      T7("Lihat sisa waktu subtes")
      T8("Submit subtes")
      T9("Auto-submit saat waktu habis")
      T10("Lanjutkan attempt aktif")
      T11("Hitung skor akhir<br/>& skor per subtes")
      T12("Lihat hasil<br/>benar, salah, kosong")
      T13("Lihat pembahasan tiap soal")
      T14("Beli sesi baru untuk mengulang")
    end

    subgraph KONTEN["Pengelolaan Konten"]
      direction TB
      C1("Kelola kategori soal")
      C2("Buat / ubah soal<br/>pilihan, kunci, pembahasan")
      C3("Impor soal massal dari JSON")
      C4("Terbitkan / arsipkan soal")
      C5("Duplikasi soal historis")
      C6("Kelola subtes<br/>dengan kategori utama")
      C7("Buat / ubah produk tes")
      C8("Atur urutan, durasi,<br/>jumlah soal per subtes")
      C9("Tugaskan soal ke subtes")
      C10("Lepas assignment soal")
      C11("Terbitkan produk tes")
      C12("Validasi kelengkapan tes")
    end

    subgraph OPS["Operasional"]
      direction TB
      O1("Lihat dashboard statistik")
      O2("Telusuri pengguna")
      O3("Telusuri pesanan & pembayaran")
      O4("Lihat detail pesanan + attempt")
      O5("Beri penggantian akses<br/>dengan alasan")
      O6("Deteksi ketidakcocokan<br/>order vs payment")
      O7("Otorisasi admin di server")
    end
  end

  %% ======================= PENGUNJUNG =======================
  PENGUNJUNG --- K1
  PENGUNJUNG --- K2
  PENGUNJUNG --- K3
  PENGUNJUNG --- K4
  PENGUNJUNG --- K5
  PENGUNJUNG --- A1
  PENGUNJUNG --- A4
  PENGUNJUNG --- A6
  PENGUNJUNG --- A7

  %% ======================= PESERTA =======================
  PESERTA --- A2
  PESERTA --- A3
  PESERTA --- A5
  PESERTA --- A8
  PESERTA --- B1
  PESERTA --- B4
  PESERTA --- B7
  PESERTA --- B9
  PESERTA --- B10
  PESERTA --- T1
  PESERTA --- T2
  PESERTA --- T3
  PESERTA --- T5
  PESERTA --- T10
  PESERTA --- T12
  PESERTA --- T14

  %% ======================= ADMIN =======================
  ADMIN --- C1
  ADMIN --- C2
  ADMIN --- C3
  ADMIN --- C4
  ADMIN --- C5
  ADMIN --- C6
  ADMIN --- C7
  ADMIN --- C9
  ADMIN --- C10
  ADMIN --- C11
  ADMIN --- O1
  ADMIN --- O2
  ADMIN --- O3
  ADMIN --- O4
  ADMIN --- O5

  %% ======================= AKTOR SISTEM =======================
  A1 -. "«include»" .-> A2
  A2 --- EMAIL
  A3 --- EMAIL
  A6 --- EMAIL
  A7 -. "«include»" .-> A6

  B3 --- DOKU
  B4 --- DOKU
  B7 --- DOKU
  DOKU --- B5
  WAKTU --- B11
  WAKTU --- T7
  WAKTU --- T9

  %% ======================= RELASI PEMBELIAN =======================
  K3 -. "«extend»" .-> K6
  K3 -. "«extend»" .-> B1
  B1 -. "«include»" .-> B0
  B1 -. "«include»" .-> B2
  B1 -. "«include»" .-> B3
  B5 -. "«include»" .-> B6
  B5 -. "«include»" .-> B8
  B7 -. "«include»" .-> B8
  B10 -. "«extend»" .-> B7
  B8 -. "«include»" .-> T1

  %% ======================= RELASI PENGERJAAN =======================
  T1 -. "«extend»" .-> T2
  T2 -. "«include»" .-> T3
  T3 -. "«include»" .-> T4
  T3 -. "«include»" .-> T5
  T5 -. "«include»" .-> T6
  T5 -. "«include»" .-> T7
  T5 -. "«include»" .-> T8
  T9 -. "«extend»" .-> T8
  T10 -. "«include»" .-> T4
  T8 -. "«include»" .-> T11
  T11 -. "«include»" .-> T12
  T12 -. "«extend»" .-> T13
  T14 -. "«include»" .-> B1

  %% ======================= RELASI KONTEN =======================
  C2 -. "«include»" .-> C1
  C3 -. "«extend»" .-> C2
  C5 -. "«extend»" .-> C2
  C2 -. "«extend»" .-> C4
  C6 -. "«include»" .-> C1
  C7 -. "«include»" .-> C8
  C8 -. "«include»" .-> C6
  C9 -. "«include»" .-> C8
  C10 -. "«extend»" .-> C9
  C11 -. "«include»" .-> C12
  C12 -. "«include»" .-> C9
  C11 -. "«include»" .-> K2

  %% ======================= RELASI OPERASIONAL =======================
  O3 -. "«extend»" .-> O4
  O4 -. "«include»" .-> O6
  O5 -. "«include»" .-> O4
  O5 -. "«include»" .-> B8
  O1 -. "«include»" .-> O7
  O2 -. "«include»" .-> O7
  O3 -. "«include»" .-> O7
  C11 -. "«include»" .-> O7

  %% ======================= GAYA =======================
  classDef aktor fill:#105C78,stroke:#0b3d51,color:#fff,font-weight:600
  classDef uc fill:#ffffff,stroke:#105C78,color:#0b3d51

  class PENGUNJUNG,PESERTA,ADMIN,DOKU,EMAIL,WAKTU aktor
  class A1,A2,A3,A4,A5,A6,A7,A8,K1,K2,K3,K4,K5,K6,B0,B1,B2,B3,B4,B5,B6,B7,B8,B9,B10,B11,T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11,T12,T13,T14,C1,C2,C3,C4,C5,C6,C7,C8,C9,C10,C11,C12,O1,O2,O3,O4,O5,O6,O7 uc
```

## Catatan pemetaan ke kode

| Use case | Implementasi |
|---|---|
| Daftar, masuk, verifikasi, reset password | `src/lib/auth.ts` (Better Auth + plugin `username`), rute `/daftar`, `/masuk`, `/lupa-password`, `/reset-password` |
| Etalase & detail produk | `src/lib/produk.ts` → `listPublishedTests`, `getPublishedTest`; rute `/produk`, `/produk/[slug]` |
| Simulasi gratis | `src/app/simulasi/**` (data statis, tanpa auth) |
| Checkout & QRIS | `src/lib/order.ts` → `startCheckout`, `checkPaymentStatus`; `src/lib/doku.ts` |
| Notifikasi pembayaran | `src/app/api/doku/notifications/route.ts` → `verifyNotificationSignature` → `src/lib/webhook.ts` `activatePayment` |
| Mulai / kerjakan / submit | `src/lib/attempt.ts` → `startAttempt`, `saveAnswer`, `getResult`; aturan di `src/lib/attempt-flow.ts` |
| Bank soal & impor JSON | `src/lib/admin.ts` → `saveQuestion`, `createQuestions`, `duplicateQuestion`; `src/lib/question-import.ts` |
| Produk tes & assignment | `src/lib/admin.ts` → `saveTest`, `addAssignment`, `removeAssignment` |
| Validasi terbit | `src/lib/test-publish.ts` → `testPublishProblem` |
| Operasional admin | `src/lib/admin-user.ts`, `src/lib/admin-order.ts` (`grantReplacementAccess`), `src/lib/order-consistency.ts` |
| Otorisasi | `src/lib/authz.ts` → `requireUser`, `requireVerifiedUser`, `requireAdmin`, `assertOwner` |

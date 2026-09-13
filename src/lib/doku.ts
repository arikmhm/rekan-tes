import { createHash, createHmac, createSign, timingSafeEqual } from "node:crypto";

/**
 * Klien DOKU SNAP untuk QRIS (Merchant Presented Mode).
 *
 * Alurnya dua panggilan: ambil access token B2B dengan tanda tangan asimetris,
 * lalu generate QRIS dengan tanda tangan simetris. SDK resmi tidak dipasang
 * karena keduanya hanya POST JSON dengan header bertanda tangan.
 *
 * Kredensial diterima sebagai argumen, sama seperti `email.ts`, sehingga modul
 * ini tidak butuh guard `server-only` dan tanda tangannya dapat diuji langsung.
 *
 * Acuan: https://developers.doku.com/accept-payments/direct-api/snap
 */

export const TOKEN_PATH = "/authorization/v1/access-token/b2b";
export const QRIS_GENERATE_PATH = "/snap-adapter/b2b/v1.0/qr/qr-mpm-generate";
/** Route Handler kita sendiri. Harus sama persis dengan Notification URL yang didaftarkan di DOKU Back Office. */
export const NOTIFICATION_PATH = "/api/doku/notifications";

/** QRIS dijalankan host-to-host. */
const CHANNEL_ID = "H2H";

/** `feeType` 1 berarti tanpa tip. */
const FEE_TYPE = "1";

export type DokuCredentials = {
  /** Client ID dari DOKU Back Office; dipakai sebagai partner id juga. */
  clientId: string;
  /** Client secret untuk tanda tangan simetris. */
  secretKey: string;
  /** Private key RSA milik merchant, PEM, untuk tanda tangan token. */
  privateKey: string;
  /** Mall ID dari DOKU setelah registrasi QRIS disetujui. */
  merchantId: string;
  terminalId: string;
  postalCode: string;
  baseUrl: string;
};

/**
 * SNAP memakai ISO8601 dengan offset zona, bukan `Z`. Waktu Jakarta dipakai
 * apa adanya agar cocok dengan pola `+07:00` pada spesifikasi notifikasi.
 */
export function snapTimestamp(now = new Date()) {
  const wib = new Date(now.getTime() + 7 * 60 * 60_000);
  return `${wib.toISOString().slice(0, 19)}+07:00`;
}

/** Nominal SNAP selalu dua desimal dalam bentuk string. */
export function snapAmount(amount: number) {
  return `${amount}.00`;
}

/**
 * `X-EXTERNAL-ID` harus berupa string numerik yang unik dalam satu hari.
 * Milidetik ditambah empat digit acak sudah memenuhi keduanya.
 */
export function externalId(now = new Date()) {
  return `${now.getTime()}${Math.floor(Math.random() * 10_000)
    .toString()
    .padStart(4, "0")}`;
}

/** Invoice number kami, dipakai sebagai `partnerReferenceNo`. */
export function invoiceNumber(now = new Date()) {
  const waktu = now.getTime().toString(36).toUpperCase();
  const acak = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `RT${waktu}${acak}`;
}

/** Komponen tanda tangan token B2B. */
export function tokenStringToSign(clientId: string, timestamp: string) {
  return `${clientId}|${timestamp}`;
}

/**
 * Komponen tanda tangan transaksi. Bodi di-minify (hasil `JSON.stringify`
 * sudah minified), di-SHA256, lalu di-hex lowercase.
 */
export function transactionStringToSign(parts: {
  method: string;
  path: string;
  accessToken: string;
  body: string;
  timestamp: string;
}) {
  const digest = createHash("sha256").update(parts.body, "utf8").digest("hex").toLowerCase();
  return [parts.method, parts.path, parts.accessToken, digest, parts.timestamp].join(":");
}

/** Tanda tangan asimetris SHA256withRSA untuk permintaan access token. */
export function tokenSignature(privateKey: string, stringToSign: string) {
  return createSign("RSA-SHA256").update(stringToSign, "utf8").sign(privateKey, "base64");
}

/** Tanda tangan simetris HMAC-SHA512 untuk permintaan transaksi. */
export function transactionSignature(secretKey: string, stringToSign: string) {
  return createHmac("sha512", secretKey).update(stringToSign, "utf8").digest("base64");
}

/**
 * Access token B2B, berlaku 15 menit.
 *
 * ponytail: token diambil baru setiap checkout. Cache hanya berguna kalau
 * checkout sudah ramai, dan cache yang salah kedaluwarsa jauh lebih mahal
 * daripada satu request tambahan.
 */
export async function accessToken(credentials: DokuCredentials, now = new Date()) {
  const timestamp = snapTimestamp(now);
  const body = JSON.stringify({ grantType: "client_credentials" });

  const response = await fetch(`${credentials.baseUrl}${TOKEN_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CLIENT-KEY": credentials.clientId,
      "X-TIMESTAMP": timestamp,
      "X-SIGNATURE": tokenSignature(
        credentials.privateKey,
        tokenStringToSign(credentials.clientId, timestamp),
      ),
    },
    body,
  });

  const text = await response.text();
  const data = JSON.parse(text) as { accessToken?: string; responseMessage?: string };

  if (!response.ok || !data.accessToken) {
    throw new Error(`DOKU menolak permintaan token (${response.status}): ${text}`);
  }

  return data.accessToken;
}

/** Kebalikan `snapTimestamp`. Mengembalikan null bila formatnya tidak dikenali. */
export function parseSnapTimestamp(value: string | undefined) {
  if (!value) return null;
  const waktu = new Date(value);
  return Number.isNaN(waktu.getTime()) ? null : waktu;
}

export type QrisRequest = {
  /** Invoice kami; dikembalikan DOKU pada notifikasi pembayaran. */
  partnerReferenceNo: string;
  /** `X-EXTERNAL-ID`, string numerik unik harian. */
  externalId: string;
  amount: number;
  /** Umur QR dalam menit. */
  validMinutes: number;
};

export type QrisResult = {
  /** Payload QRIS yang dirender menjadi gambar QR. */
  qrContent: string;
  /** Nomor transaksi milik DOKU. */
  referenceNo: string;
  expiresAt: Date;
};

/** Body generate QRIS. Dipisah agar dapat diperiksa tanpa memanggil DOKU. */
export function qrisBody(credentials: DokuCredentials, request: QrisRequest, now = new Date()) {
  return {
    partnerReferenceNo: request.partnerReferenceNo,
    amount: { value: snapAmount(request.amount), currency: "IDR" },
    merchantId: credentials.merchantId,
    terminalId: credentials.terminalId,
    validityPeriod: snapTimestamp(new Date(now.getTime() + request.validMinutes * 60_000)),
    additionalInfo: { postalCode: credentials.postalCode, feeType: FEE_TYPE },
  };
}

/**
 * Header transaksi SNAP QRIS, termasuk tanda tangan simetris. Dipakai untuk
 * generate maupun query, sehingga `path` selalu eksplisit — bukan ditebak
 * dari konteks pemanggil.
 */
export function qrisHeaders(
  credentials: DokuCredentials,
  token: string,
  request: { path: string; externalId: string; body: string; timestamp: string },
) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-PARTNER-ID": credentials.clientId,
    "X-EXTERNAL-ID": request.externalId,
    "X-TIMESTAMP": request.timestamp,
    "CHANNEL-ID": CHANNEL_ID,
    "X-SIGNATURE": transactionSignature(
      credentials.secretKey,
      transactionStringToSign({
        method: "POST",
        path: request.path,
        accessToken: token,
        body: request.body,
        timestamp: request.timestamp,
      }),
    ),
  };
}

/** Membuat QRIS dinamis untuk satu percobaan pembayaran. */
export async function generateQris(
  credentials: DokuCredentials,
  request: QrisRequest,
  now = new Date(),
): Promise<QrisResult> {
  const token = await accessToken(credentials, now);
  const timestamp = snapTimestamp(now);
  const body = JSON.stringify(qrisBody(credentials, request, now));

  const response = await fetch(`${credentials.baseUrl}${QRIS_GENERATE_PATH}`, {
    method: "POST",
    headers: qrisHeaders(credentials, token, {
      path: QRIS_GENERATE_PATH,
      externalId: request.externalId,
      body,
      timestamp,
    }),
    body,
  });

  const text = await response.text();

  if (!response.ok) {
    // Balasan DOKU memuat pesan validasi, bukan data pribadi maupun secret.
    throw new Error(`DOKU menolak generate QRIS (${response.status}): ${text}`);
  }

  const data = JSON.parse(text) as {
    responseCode?: string;
    qrContent?: string;
    referenceNo?: string;
    additionalInfo?: { validityPeriod?: string };
  };

  // SNAP membalas 200 dengan responseCode yang menjelaskan hasilnya, jadi
  // status HTTP saja tidak cukup untuk menyatakan QR benar-benar terbit.
  if (!data.qrContent || !data.responseCode?.startsWith("200")) {
    throw new Error(`DOKU tidak mengembalikan QRIS: ${text}`);
  }

  return {
    qrContent: data.qrContent,
    referenceNo: data.referenceNo ?? "",
    // DOKU mengembalikan masa berlaku yang benar-benar dipakai; nilai itu yang
    // dipegang agar QR tidak pernah dianggap hidup lebih lama daripada aslinya.
    expiresAt:
      parseSnapTimestamp(data.additionalInfo?.validityPeriod) ??
      new Date(now.getTime() + request.validMinutes * 60_000),
  };
}

// ---------------------------------------------------------------------------
// Query QRIS — jalur backup selain webhook, untuk ditanyakan langsung saat
// peserta membuka halaman pesanan. Hasilnya dibentuk sebagai `QrisNotification`
// yang sama dengan notifikasi webhook, sehingga kedua jalur berbagi satu
// logika aktivasi (`activatePayment` di `webhook.ts`).
// ---------------------------------------------------------------------------

export const QRIS_QUERY_PATH = "/snap-adapter/b2b/v1.0/qr/qr-mpm-query";

/** Kode layanan tetap milik API Query QRIS. */
const QRIS_QUERY_SERVICE_CODE = "47";

export type QrisQueryRequest = {
  /** `referenceNo` milik DOKU dari respons generate. */
  originalReferenceNo: string;
  /** Invoice kami; sama dengan `partnerReferenceNo` saat generate. */
  originalPartnerReferenceNo: string;
};

export function queryQrisBody(credentials: DokuCredentials, request: QrisQueryRequest) {
  return {
    originalReferenceNo: request.originalReferenceNo,
    originalPartnerReferenceNo: request.originalPartnerReferenceNo,
    serviceCode: QRIS_QUERY_SERVICE_CODE,
    merchantId: credentials.merchantId,
  };
}

/**
 * Membaca balasan Query QRIS ke bentuk `QrisNotification`. `"00"` berarti
 * sukses; kode lain (pending, gagal, dibatalkan) diperlakukan sama seperti
 * notifikasi webhook berstatus non-sukses — diakui, tidak mengaktifkan apa pun.
 */
export function parseQrisQueryResponse(
  body: unknown,
  fallbackInvoice: string,
): QrisNotification | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;

  const amount = Number((b.amount as Record<string, unknown> | undefined)?.value);
  if (!Number.isFinite(amount)) return null;

  return {
    status: b.latestTransactionStatus === "00" ? "SUCCESS" : "PENDING",
    invoiceNumber:
      typeof b.originalPartnerReferenceNo === "string" ? b.originalPartnerReferenceNo : fallbackInvoice,
    amount: Math.round(amount),
  };
}

/** Menanyakan status satu transaksi QRIS langsung ke DOKU. */
export async function queryQris(
  credentials: DokuCredentials,
  request: QrisQueryRequest,
  now = new Date(),
): Promise<QrisNotification> {
  const token = await accessToken(credentials, now);
  const timestamp = snapTimestamp(now);
  const body = JSON.stringify(queryQrisBody(credentials, request));

  const response = await fetch(`${credentials.baseUrl}${QRIS_QUERY_PATH}`, {
    method: "POST",
    headers: qrisHeaders(credentials, token, {
      path: QRIS_QUERY_PATH,
      externalId: externalId(now),
      body,
      timestamp,
    }),
    body,
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`DOKU menolak query QRIS (${response.status}): ${text}`);
  }

  const notifikasi = parseQrisQueryResponse(JSON.parse(text), request.originalPartnerReferenceNo);
  if (!notifikasi) {
    throw new Error(`DOKU membalas query QRIS dengan format tak terduga: ${text}`);
  }

  return notifikasi;
}

// ---------------------------------------------------------------------------
// Notifikasi (HTTP Notification, skema non-SNAP)
// ---------------------------------------------------------------------------
//
// QRIS yang dibuat lewat SNAP dinotifikasikan lewat skema signature non-SNAP:
// Client-Id/Request-Id/Request-Timestamp/Request-Target/Digest digabung satu
// baris per komponen, di-HMAC-SHA256 dengan secret key. Ini skema berbeda dari
// tanda tangan token dan generate QRIS di atas.
// Acuan: https://developers.doku.com/get-started-with-doku-api/notification/best-practice

/** Digest = SHA256 base64 dari body notifikasi mentah, sebelum di-parse. */
export function notificationDigest(rawBody: string) {
  return createHash("sha256").update(rawBody, "utf8").digest("base64");
}

export function notificationSignatureComponent(parts: {
  clientId: string;
  requestId: string;
  timestamp: string;
  target: string;
  digest: string;
}) {
  return [
    `Client-Id:${parts.clientId}`,
    `Request-Id:${parts.requestId}`,
    `Request-Timestamp:${parts.timestamp}`,
    `Request-Target:${parts.target}`,
    `Digest:${parts.digest}`,
  ].join("\n");
}

/**
 * Benar hanya bila header `Signature` cocok dengan HMAC-SHA256 milik secret
 * key kita atas komponen di atas. Perbandingan memakai `timingSafeEqual` agar
 * waktu respons tidak membocorkan seberapa dekat tebakan penyerang.
 */
export function verifyNotificationSignature(
  secretKey: string,
  parts: { clientId: string; requestId: string; timestamp: string; target: string; rawBody: string },
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader?.startsWith("HMACSHA256=")) return false;

  const harapan = createHmac("sha256", secretKey)
    .update(
      notificationSignatureComponent({ ...parts, digest: notificationDigest(parts.rawBody) }),
      "utf8",
    )
    .digest("base64");
  const diterima = signatureHeader.slice("HMACSHA256=".length);

  const a = Buffer.from(harapan);
  const b = Buffer.from(diterima);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type QrisNotification = {
  status: string;
  /** = `partnerReferenceNo` yang kita kirim saat generate; kolom `payments.external_id`. */
  invoiceNumber: string;
  /** Dibulatkan ke rupiah penuh; DOKU mengirim `order.amount` dengan dua desimal. */
  amount: number;
};

/**
 * Membaca field yang kita butuhkan dari body notifikasi QRIS. Sengaja tidak
 * strict terhadap field lain: DOKU dapat menambah field baru kapan saja.
 */
export function parseQrisNotification(body: unknown): QrisNotification | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;

  const order = b.order as Record<string, unknown> | undefined;
  const transaction = b.transaction as Record<string, unknown> | undefined;

  const invoiceNumber = order?.invoice_number;
  const amount = Number(order?.amount);
  const status = transaction?.status;

  if (typeof invoiceNumber !== "string" || typeof status !== "string" || !Number.isFinite(amount)) {
    return null;
  }

  return { status, invoiceNumber, amount: Math.round(amount) };
}

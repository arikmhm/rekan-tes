import { createHash, createHmac } from "node:crypto";

/**
 * Klien DOKU Checkout (non-SNAP). SDK resmi tidak dipasang karena integrasinya
 * satu POST JSON dengan header bertanda tangan.
 *
 * Kredensial diterima sebagai argumen, sama seperti `email.ts`, sehingga modul
 * ini tidak butuh guard `server-only` dan tanda tangannya dapat diuji langsung.
 *
 * Acuan: https://developers.doku.com/accept-payments/doku-checkout
 */

export const CHECKOUT_TARGET = "/checkout/v1/payment";

export type DokuCredentials = {
  clientId: string;
  secretKey: string;
  /** Basis API: sandbox atau produksi. */
  baseUrl: string;
};

/** Timestamp ISO8601 UTC tanpa milidetik, format yang diminta DOKU. */
export function dokuTimestamp(now = new Date()) {
  return `${now.toISOString().slice(0, 19)}Z`;
}

/** Digest = SHA256 base64 dari body JSON mentah. */
export function digest(body: string) {
  return createHash("sha256").update(body, "utf8").digest("base64");
}

/**
 * Komponen tanda tangan. Urutan baris dan ketiadaan baris baru di akhir wajib
 * persis seperti dokumentasi DOKU; salah satu saja membuat signature ditolak.
 */
export function signatureComponent(parts: {
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

/** Header lengkap satu request DOKU, termasuk `Signature: HMACSHA256=...`. */
export function dokuHeaders(
  credentials: Pick<DokuCredentials, "clientId" | "secretKey">,
  request: { requestId: string; timestamp: string; target: string; body: string },
) {
  const komponen = signatureComponent({
    clientId: credentials.clientId,
    requestId: request.requestId,
    timestamp: request.timestamp,
    target: request.target,
    digest: digest(request.body),
  });

  const signature = createHmac("sha256", credentials.secretKey)
    .update(komponen, "utf8")
    .digest("base64");

  return {
    "Content-Type": "application/json",
    "Client-Id": credentials.clientId,
    "Request-Id": request.requestId,
    "Request-Timestamp": request.timestamp,
    Signature: `HMACSHA256=${signature}`,
  };
}

/**
 * Nama pelanggan DOKU hanya menerima huruf dan spasi. Nama yang memuat angka
 * atau simbol ditolak, jadi dibersihkan lebih dulu ketimbang menggagalkan
 * checkout karena hal yang tidak penting bagi pembayaran.
 */
export function customerName(name: string) {
  const bersih = name.replace(/[^\p{L} ]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 255);
  return bersih || "Peserta";
}

/**
 * Invoice number pendek dan unik. Dua batas DOKU sekaligus: maksimal 30
 * karakter bila kanal kartu kredit aktif, dan tanpa simbol sama sekali bila
 * kanal KKI aktif. Karena itu huruf dan angka saja, tanpa tanda hubung.
 */
export function invoiceNumber(now = new Date()) {
  const waktu = now.getTime().toString(36).toUpperCase();
  const acak = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `RT${waktu}${acak}`;
}

export type CheckoutRequest = {
  /** Dipakai sebagai `Request-Id`; nilai sama membuat DOKU menolak duplikat. */
  requestId: string;
  invoiceNumber: string;
  amount: number;
  callbackUrl: string;
  itemName: string;
  customer: { id: string; name: string; email: string };
  /** Umur checkout dalam menit. Default DOKU 60. */
  dueMinutes?: number;
};

export type CheckoutResult = {
  url: string;
  tokenId: string;
  /** Kedaluwarsa dari DOKU, sudah dalam bentuk `Date`. */
  expiresAt: Date;
};

/** Body request checkout. Dipisah agar dapat diperiksa tanpa memanggil DOKU. */
export function checkoutBody(request: CheckoutRequest) {
  return {
    order: {
      amount: request.amount,
      invoice_number: request.invoiceNumber,
      currency: "IDR",
      callback_url: request.callbackUrl,
      // Mandatory menurut dokumentasi: menentukan ke mana peserta dikembalikan.
      auto_redirect: true,
      // Satu baris item senilai penuh; DOKU mensyaratkan total baris sama
      // dengan `amount`.
      // ponytail: hanya id, nama, harga, dan jumlah. Kanal paylater
      // (Kredivo, Indodana, Akulaku) dan KKI menuntut sku, category, url, dan
      // image_url; tambahkan saat kanal itu benar-benar diaktifkan.
      line_items: [
        {
          id: request.invoiceNumber,
          name: request.itemName,
          price: request.amount,
          quantity: 1,
        },
      ],
    },
    payment: { payment_due_date: request.dueMinutes ?? 60 },
    customer: {
      id: request.customer.id,
      name: customerName(request.customer.name),
      email: request.customer.email,
    },
  };
}

/**
 * `expired_date` DOKU berformat `yyyyMMddHHmmss` pada zona WIB (UTC+7), bukan
 * ISO. Diterjemahkan di sini agar sisa aplikasi hanya berurusan dengan `Date`.
 */
export function parseExpiredDate(value: string) {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (!m) return null;

  const [, y, mo, d, h, mi, s] = m;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}+07:00`);
}

/** Membuat checkout DOKU dan mengembalikan URL pembayarannya. */
export async function createCheckout(
  credentials: DokuCredentials,
  request: CheckoutRequest,
): Promise<CheckoutResult> {
  const body = JSON.stringify(checkoutBody(request));
  const headers = dokuHeaders(credentials, {
    requestId: request.requestId,
    timestamp: dokuTimestamp(),
    target: CHECKOUT_TARGET,
    body,
  });

  const response = await fetch(`${credentials.baseUrl}${CHECKOUT_TARGET}`, {
    method: "POST",
    headers,
    body,
  });

  const text = await response.text();

  if (!response.ok) {
    // Body DOKU memuat pesan validasi, bukan data pribadi maupun secret.
    throw new Error(`DOKU menolak checkout (${response.status}): ${text}`);
  }

  const payment = (JSON.parse(text) as {
    response?: { payment?: { url?: string; token_id?: string; expired_date?: string } };
  }).response?.payment;

  if (!payment?.url) {
    throw new Error("DOKU membalas tanpa URL pembayaran.");
  }

  // ponytail: signature pada `response.headers` tidak diverifikasi. Balasan ini
  // hanya dibaca untuk mengambil URL, dan jalurnya sudah dilindungi TLS.
  // Validasi tanda tangan yang menentukan uang berada di notifikasi (RT-010).
  return {
    url: payment.url,
    tokenId: payment.token_id ?? "",
    expiresAt: parseExpiredDate(payment.expired_date ?? "") ?? new Date(Date.now() + 60 * 60_000),
  };
}

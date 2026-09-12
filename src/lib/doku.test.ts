import { createHash, createHmac, generateKeyPairSync, verify } from "node:crypto";

import { expect, test } from "vitest";

import {
  externalId,
  invoiceNumber,
  notificationDigest,
  notificationSignatureComponent,
  parseQrisNotification,
  parseSnapTimestamp,
  qrisBody,
  qrisHeaders,
  QRIS_GENERATE_PATH,
  snapAmount,
  snapTimestamp,
  tokenSignature,
  tokenStringToSign,
  transactionSignature,
  transactionStringToSign,
  verifyNotificationSignature,
  type DokuCredentials,
} from "./doku";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });

const kredensial: DokuCredentials = {
  clientId: "MCH-0001-10791114622547",
  secretKey: "SK-rahasia",
  privateKey: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
  merchantId: "MALL-001",
  terminalId: "TERM01",
  postalCode: "10110",
  baseUrl: "https://api-sandbox.doku.com",
};

test("timestamp SNAP memakai offset WIB, bukan Z", () => {
  // Spesifikasi notifikasi mensyaratkan pola `+07:00`; `Z` tidak cocok.
  expect(snapTimestamp(new Date("2026-09-13T01:02:03.456Z"))).toBe("2026-09-13T08:02:03+07:00");
});

test("nominal SNAP selalu dua desimal", () => {
  expect(snapAmount(25000)).toBe("25000.00");
  expect(snapAmount(0)).toBe("0.00");
});

test("X-EXTERNAL-ID numerik dan berbeda tiap panggilan", () => {
  const id = externalId();
  expect(id).toMatch(/^\d+$/);
  expect(externalId()).not.toBe(id);
});

test("invoice number bebas simbol dan muat pada batas DOKU", () => {
  const invoice = invoiceNumber();
  expect(invoice).toMatch(/^RT[0-9A-Z]+$/);
  expect(invoice.length).toBeLessThanOrEqual(30);
});

test("stringToSign token B2B memakai pemisah pipa", () => {
  expect(tokenStringToSign("MCH-0001", "2026-09-13T08:00:00+07:00")).toBe(
    "MCH-0001|2026-09-13T08:00:00+07:00",
  );
});

test("tanda tangan token dapat diverifikasi dengan public key merchant", () => {
  const stringToSign = tokenStringToSign(kredensial.clientId, "2026-09-13T08:00:00+07:00");
  const signature = tokenSignature(kredensial.privateKey, stringToSign);

  expect(
    verify("RSA-SHA256", Buffer.from(stringToSign), publicKey, Buffer.from(signature, "base64")),
  ).toBe(true);
});

test("stringToSign transaksi memakai digest hex lowercase dari body", () => {
  const body = '{"partnerReferenceNo":"RT1"}';
  const digest = createHash("sha256").update(body).digest("hex");

  expect(
    transactionStringToSign({
      method: "POST",
      path: QRIS_GENERATE_PATH,
      accessToken: "token123",
      body,
      timestamp: "2026-09-13T08:00:00+07:00",
    }),
  ).toBe(
    `POST:${QRIS_GENERATE_PATH}:token123:${digest.toLowerCase()}:2026-09-13T08:00:00+07:00`,
  );
  expect(digest).toBe(digest.toLowerCase());
});

test("tanda tangan transaksi adalah HMAC-SHA512 base64 dari client secret", () => {
  const stringToSign = "POST:/x:token:abc:2026-09-13T08:00:00+07:00";

  expect(transactionSignature("SK-rahasia", stringToSign)).toBe(
    createHmac("sha512", "SK-rahasia").update(stringToSign).digest("base64"),
  );
  expect(transactionSignature("SK-lain", stringToSign)).not.toBe(
    transactionSignature("SK-rahasia", stringToSign),
  );
});

test("body QRIS memuat field wajib dan masa berlaku", () => {
  const now = new Date("2026-09-13T01:00:00Z");
  const body = qrisBody(
    kredensial,
    { partnerReferenceNo: "RT1ABC", externalId: "123", amount: 25000, validMinutes: 60 },
    now,
  );

  expect(body).toEqual({
    partnerReferenceNo: "RT1ABC",
    amount: { value: "25000.00", currency: "IDR" },
    merchantId: "MALL-001",
    terminalId: "TERM01",
    validityPeriod: "2026-09-13T09:00:00+07:00",
    additionalInfo: { postalCode: "10110", feeType: "1" },
  });
});

test("header QRIS membawa token, partner id, dan channel H2H", () => {
  const headers = qrisHeaders(kredensial, "token123", {
    externalId: "123",
    body: "{}",
    timestamp: "2026-09-13T08:00:00+07:00",
  });

  expect(headers.Authorization).toBe("Bearer token123");
  expect(headers["X-PARTNER-ID"]).toBe(kredensial.clientId);
  expect(headers["CHANNEL-ID"]).toBe("H2H");
  expect(headers["X-SIGNATURE"]).toBe(
    transactionSignature(
      kredensial.secretKey,
      transactionStringToSign({
        method: "POST",
        path: QRIS_GENERATE_PATH,
        accessToken: "token123",
        body: "{}",
        timestamp: "2026-09-13T08:00:00+07:00",
      }),
    ),
  );
});

test("masa berlaku dari DOKU dibaca kembali sebagai waktu yang sama", () => {
  const dikirim = snapTimestamp(new Date("2026-09-13T01:00:00Z"));

  expect(parseSnapTimestamp(dikirim)?.toISOString()).toBe("2026-09-13T01:00:00.000Z");
  expect(parseSnapTimestamp("bukan tanggal")).toBeNull();
  expect(parseSnapTimestamp(undefined)).toBeNull();
});

test("komponen tanda tangan notifikasi persis seperti contoh dokumentasi DOKU", () => {
  // Sama persis dengan contoh best-practice notifikasi DOKU: urutan baris,
  // nama header, dan tidak ada baris baru di akhir menentukan lolos tidaknya.
  expect(
    notificationSignatureComponent({
      clientId: "MCH-0001-10791114622547",
      requestId: "cc682442-6c22-493e-8121-b9ef6b3fa728",
      timestamp: "2020-08-11T08:45:42Z",
      target: "/doku-virtual-account/v2/payment-code",
      digest: "5WIYK2TJg6iiZ0d5v4IXSR0EkYEkYOezJIma3Ufli5s=",
    }),
  ).toBe(
    "Client-Id:MCH-0001-10791114622547\n" +
      "Request-Id:cc682442-6c22-493e-8121-b9ef6b3fa728\n" +
      "Request-Timestamp:2020-08-11T08:45:42Z\n" +
      "Request-Target:/doku-virtual-account/v2/payment-code\n" +
      "Digest:5WIYK2TJg6iiZ0d5v4IXSR0EkYEkYOezJIma3Ufli5s=",
  );
});

test("digest notifikasi adalah SHA256 base64 dari body mentah", () => {
  expect(notificationDigest("{}")).toBe("RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=");
});

const notifParts = {
  clientId: "MCH-0001",
  requestId: "req-1",
  timestamp: "2026-09-13T08:00:00Z",
  target: "/api/doku/notifications",
  rawBody: '{"order":{"invoice_number":"RT1","amount":25000.00}}',
};

function buatSignatureValid(secretKey: string) {
  const komponen = notificationSignatureComponent({ ...notifParts, digest: notificationDigest(notifParts.rawBody) });
  return `HMACSHA256=${createHmac("sha256", secretKey).update(komponen).digest("base64")}`;
}

test("signature notifikasi yang benar diterima", () => {
  expect(verifyNotificationSignature("SK-rahasia", notifParts, buatSignatureValid("SK-rahasia"))).toBe(true);
});

test("signature notifikasi ditolak bila body, timestamp, atau secret berubah", () => {
  const valid = buatSignatureValid("SK-rahasia");

  expect(verifyNotificationSignature("SK-lain", notifParts, valid)).toBe(false);
  expect(
    verifyNotificationSignature("SK-rahasia", { ...notifParts, rawBody: '{"order":{"invoice_number":"RT2"}}' }, valid),
  ).toBe(false);
  expect(
    verifyNotificationSignature("SK-rahasia", { ...notifParts, timestamp: "2026-09-13T09:00:00Z" }, valid),
  ).toBe(false);
});

test("signature notifikasi ditolak bila header hilang atau format salah", () => {
  expect(verifyNotificationSignature("SK-rahasia", notifParts, null)).toBe(false);
  expect(verifyNotificationSignature("SK-rahasia", notifParts, "bukan-format-yang-benar")).toBe(false);
  expect(verifyNotificationSignature("SK-rahasia", notifParts, "HMACSHA256=salah")).toBe(false);
});

test("payload notifikasi QRIS terbaca sesuai contoh dokumentasi DOKU", () => {
  const contoh = {
    service: { id: "QRIS", name: "QRIS" },
    order: { invoice_number: "5ffa5675bb114404a4e426241cf05be0", amount: 20000.0 },
    transaction: { status: "SUCCESS", date: "2025-06-20T04:26:26Z" },
  };

  expect(parseQrisNotification(contoh)).toEqual({
    status: "SUCCESS",
    invoiceNumber: "5ffa5675bb114404a4e426241cf05be0",
    amount: 20000,
  });
});

test("payload notifikasi yang tidak lengkap ditolak", () => {
  expect(parseQrisNotification({})).toBeNull();
  expect(parseQrisNotification(null)).toBeNull();
  expect(parseQrisNotification({ order: { invoice_number: "RT1" }, transaction: {} })).toBeNull();
  expect(
    parseQrisNotification({ order: { invoice_number: "RT1", amount: "bukan-angka" }, transaction: { status: "SUCCESS" } }),
  ).toBeNull();
});

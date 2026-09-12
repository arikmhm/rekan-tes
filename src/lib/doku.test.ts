import { createHash, createHmac, generateKeyPairSync, verify } from "node:crypto";

import { expect, test } from "vitest";

import {
  externalId,
  invoiceNumber,
  qrisBody,
  qrisHeaders,
  QRIS_GENERATE_PATH,
  parseSnapTimestamp,
  snapAmount,
  snapTimestamp,
  tokenSignature,
  tokenStringToSign,
  transactionSignature,
  transactionStringToSign,
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

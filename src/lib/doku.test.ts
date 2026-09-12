import { expect, test } from "vitest";

import {
  checkoutBody,
  customerName,
  digest,
  dokuHeaders,
  dokuTimestamp,
  invoiceNumber,
  parseExpiredDate,
  signatureComponent,
} from "./doku";

const contoh = {
  clientId: "MCH-0001-10791114622547",
  requestId: "cc682442-6c22-493e-8121-b9ef6b3fa728",
  timestamp: "2020-08-11T08:45:42Z",
  target: "/doku-virtual-account/v2/payment-code",
  digest: "5WIYK2TJg6iiZ0d5v4IXSR0EkYEkYOezJIma3Ufli5s=",
};

test("komponen tanda tangan persis seperti contoh dokumentasi DOKU", () => {
  // Urutan baris, nama header, dan tidak adanya baris baru di akhir menentukan
  // diterima atau tidaknya signature.
  expect(signatureComponent(contoh)).toBe(
    "Client-Id:MCH-0001-10791114622547\n" +
      "Request-Id:cc682442-6c22-493e-8121-b9ef6b3fa728\n" +
      "Request-Timestamp:2020-08-11T08:45:42Z\n" +
      "Request-Target:/doku-virtual-account/v2/payment-code\n" +
      "Digest:5WIYK2TJg6iiZ0d5v4IXSR0EkYEkYOezJIma3Ufli5s=",
  );
});

test("digest adalah SHA256 base64 dari body mentah", () => {
  expect(digest("{}")).toBe("RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=");
});

test("signature berubah ketika salah satu komponen berubah", () => {
  const request = { requestId: "r1", timestamp: "2026-09-13T00:00:00Z", target: "/x", body: "{}" };
  const kredensial = { clientId: "c1", secretKey: "rahasia" };
  const dasar = dokuHeaders(kredensial, request);

  expect(dasar.Signature).toMatch(/^HMACSHA256=/);
  expect(dokuHeaders(kredensial, { ...request, body: '{"a":1}' }).Signature).not.toBe(
    dasar.Signature,
  );
  expect(dokuHeaders({ ...kredensial, secretKey: "lain" }, request).Signature).not.toBe(
    dasar.Signature,
  );
  expect(dasar["Request-Id"]).toBe("r1");
});

test("timestamp tanpa milidetik", () => {
  expect(dokuTimestamp(new Date("2026-09-13T01:02:03.456Z"))).toBe("2026-09-13T01:02:03Z");
});

test("nama pelanggan dibersihkan ke huruf dan spasi", () => {
  expect(customerName("Arik 123 M.")).toBe("Arik M");
  expect(customerName("777")).toBe("Peserta");
});

test("invoice number muat pada batas terketat DOKU dan bebas simbol", () => {
  const invoice = invoiceNumber();
  // 30 karakter bila kartu kredit aktif; tanpa simbol bila KKI aktif.
  expect(invoice.length).toBeLessThanOrEqual(30);
  expect(invoice).toMatch(/^RT[0-9A-Z]+$/);
  expect(invoiceNumber()).not.toBe(invoice);
});

test("expired_date DOKU dibaca sebagai waktu WIB", () => {
  expect(parseExpiredDate("20260913150405")?.toISOString()).toBe("2026-09-13T08:04:05.000Z");
  expect(parseExpiredDate("bukan tanggal")).toBeNull();
});

test("body checkout memuat field wajib DOKU", () => {
  const body = checkoutBody({
    requestId: "r1",
    invoiceNumber: "RT1ABCDEF",
    amount: 79000,
    callbackUrl: "http://localhost:3000/order/o1",
    itemName: "Simulasi",
    customer: { id: "u1", name: "Arik", email: "a@b.test" },
  });

  expect(body.order).toMatchObject({
    amount: 79000,
    invoice_number: "RT1ABCDEF",
    currency: "IDR",
    auto_redirect: true,
  });
  expect(body.payment.payment_due_date).toBe(60);
  // Total baris item wajib sama dengan order.amount.
  const items = body.order.line_items;
  expect(items.reduce((n, i) => n + i.price * i.quantity, 0)).toBe(body.order.amount);
  expect(body.customer.name).toBe("Arik");
});

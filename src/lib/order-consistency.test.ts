import { expect, test } from "vitest";

import { grantReasonProblem, orderPaymentMismatch } from "./order-consistency";

const besok = new Date(Date.now() + 86_400_000);
const lunas = { status: "paid", paidAt: new Date() };
const menunggu = { status: "pending", paidAt: null };

test("order paid dengan pembayaran lunas konsisten", () => {
  expect(orderPaymentMismatch({ status: "paid", accessExpiresAt: besok }, [lunas])).toBeNull();
});

test("order pending tanpa pembayaran lunas konsisten", () => {
  expect(orderPaymentMismatch({ status: "pending", accessExpiresAt: null }, [menunggu])).toBeNull();
});

test("order paid tanpa pembayaran lunas ditandai", () => {
  expect(orderPaymentMismatch({ status: "paid", accessExpiresAt: besok }, [menunggu])).toMatch(
    /tidak ada pembayaran yang lunas/,
  );
});

test("pembayaran lunas dengan order masih pending ditandai", () => {
  expect(orderPaymentMismatch({ status: "pending", accessExpiresAt: null }, [lunas])).toMatch(
    /masih pending/,
  );
});

test("order paid tanpa masa akses ditandai", () => {
  expect(orderPaymentMismatch({ status: "paid", accessExpiresAt: null }, [lunas])).toMatch(
    /tanpa masa akses/,
  );
});

test("order refunded dengan payment masih paid ditandai", () => {
  expect(orderPaymentMismatch({ status: "refunded", accessExpiresAt: besok }, [lunas])).toMatch(
    /masih tercatat paid/,
  );
});

test("alasan terlalu pendek ditolak", () => {
  expect(grantReasonProblem("ok")).toMatch(/minimal/);
  expect(grantReasonProblem("   sembilan  ")).toMatch(/minimal/);
});

test("alasan wajar diterima", () => {
  expect(grantReasonProblem("Server down saat peserta mengerjakan subtes kedua.")).toBeNull();
});

test("alasan kepanjangan ditolak", () => {
  expect(grantReasonProblem("a".repeat(501))).toMatch(/maksimal/);
});

test("order penggantian lunas tanpa pembayaran bukan ketidakcocokan", () => {
  expect(
    orderPaymentMismatch({ status: "paid", accessExpiresAt: besok, grantedBy: "admin-id" }, []),
  ).toBeNull();
});

test("order penggantian tanpa masa akses tetap ditandai", () => {
  expect(
    orderPaymentMismatch({ status: "paid", accessExpiresAt: null, grantedBy: "admin-id" }, []),
  ).toMatch(/tanpa masa akses/);
});

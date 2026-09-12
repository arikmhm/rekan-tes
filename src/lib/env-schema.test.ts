import { expect, test } from "vitest";

import { parseEnv, parseMigrationEnv } from "./env-schema";

const pooled = "postgresql://u:p@host-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const direct = "postgresql://u:p@host.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const secret = "x".repeat(43);

const minimal = { DATABASE_URL: pooled, BETTER_AUTH_SECRET: secret };

test("menerima environment minimum dan mengabaikan variabel lain", () => {
  expect(parseEnv({ ...minimal, TZ: "Asia/Jakarta" })).toEqual(minimal);
});

test("gagal dengan pesan yang menyebut variabel dan cara memperbaikinya", () => {
  expect(() => parseEnv({})).toThrowError(/DATABASE_URL/);
  expect(() => parseEnv({})).toThrowError(/BETTER_AUTH_SECRET/);
  expect(() => parseEnv({})).toThrowError(/\.env\.example/);
});

test("menolak DATABASE_URL kosong atau bukan PostgreSQL", () => {
  expect(() => parseEnv({ ...minimal, DATABASE_URL: "" })).toThrowError(/DATABASE_URL/);
  expect(() => parseEnv({ ...minimal, DATABASE_URL: "mysql://localhost/x" })).toThrowError(
    /PostgreSQL/,
  );
});

test("menolak secret yang terlalu pendek", () => {
  expect(() => parseEnv({ ...minimal, BETTER_AUTH_SECRET: "pendek" })).toThrowError(
    /minimal 32 karakter/,
  );
});

test("BETTER_AUTH_URL harus absolut bila diisi", () => {
  expect(() => parseEnv({ ...minimal, BETTER_AUTH_URL: "/api/auth" })).toThrowError(/URL absolut/);
  expect(parseEnv({ ...minimal, BETTER_AUTH_URL: "https://rekan-tes.test" })).toMatchObject({
    BETTER_AUTH_URL: "https://rekan-tes.test",
  });
});

test("DATABASE_URL_UNPOOLED opsional untuk runtime aplikasi", () => {
  expect(parseEnv({ ...minimal, DATABASE_URL_UNPOOLED: direct })).toMatchObject({
    DATABASE_URL_UNPOOLED: direct,
  });
});

test("migrasi memakai endpoint direct, bukan pooled", () => {
  expect(parseMigrationEnv({ ...minimal, DATABASE_URL_UNPOOLED: direct })).toEqual({ url: direct });
});

test("migrasi gagal jelas ketika hanya ada endpoint pooled", () => {
  expect(() => parseMigrationEnv(minimal)).toThrowError(/DATABASE_URL_UNPOOLED/);
  expect(() => parseMigrationEnv(minimal)).toThrowError(/neon@latest env pull/);
});

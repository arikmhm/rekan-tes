import { expect, test } from "vitest";

import { parseEnv, parseMigrationEnv } from "./env-schema";

const pooled = "postgresql://u:p@host-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const direct = "postgresql://u:p@host.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

test("menerima environment yang lengkap dan mengabaikan variabel lain", () => {
  expect(parseEnv({ DATABASE_URL: pooled, TZ: "Asia/Jakarta" })).toEqual({
    DATABASE_URL: pooled,
  });
});

test("gagal dengan pesan yang menyebut variabel dan cara memperbaikinya", () => {
  expect(() => parseEnv({})).toThrowError(/DATABASE_URL/);
  expect(() => parseEnv({})).toThrowError(/\.env\.example/);
});

test("menolak DATABASE_URL kosong atau bukan PostgreSQL", () => {
  expect(() => parseEnv({ DATABASE_URL: "" })).toThrowError(/DATABASE_URL/);
  expect(() => parseEnv({ DATABASE_URL: "mysql://localhost/rekan_tes" })).toThrowError(
    /PostgreSQL/,
  );
});

test("DATABASE_URL_UNPOOLED opsional untuk runtime aplikasi", () => {
  expect(parseEnv({ DATABASE_URL: pooled, DATABASE_URL_UNPOOLED: direct })).toEqual({
    DATABASE_URL: pooled,
    DATABASE_URL_UNPOOLED: direct,
  });
});

test("migrasi memakai endpoint direct, bukan pooled", () => {
  expect(parseMigrationEnv({ DATABASE_URL: pooled, DATABASE_URL_UNPOOLED: direct })).toEqual({
    url: direct,
  });
});

test("migrasi gagal jelas ketika hanya ada endpoint pooled", () => {
  expect(() => parseMigrationEnv({ DATABASE_URL: pooled })).toThrowError(
    /DATABASE_URL_UNPOOLED/,
  );
  expect(() => parseMigrationEnv({ DATABASE_URL: pooled })).toThrowError(/neon@latest env pull/);
});

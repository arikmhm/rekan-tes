import { expect, test } from "vitest";

import { parseEnv, parseMigrationEnv } from "./env-schema";

const pooled = "postgresql://u:p@host-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const direct = "postgresql://u:p@host.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const secret = "x".repeat(43);

const minimal = {
  DATABASE_URL: pooled,
  BETTER_AUTH_SECRET: secret,
  RESEND_API_KEY: "re_kunci_uji",
  BETTER_AUTH_URL: "http://localhost:3000",
};

test("menerima environment minimum dan mengabaikan variabel lain", () => {
  expect(parseEnv({ ...minimal, TZ: "Asia/Jakarta" })).toEqual({
    ...minimal,
    // Diisi default; domain uji Resend sampai domain sendiri terverifikasi.
    EMAIL_FROM: "Rekan Tes <onboarding@resend.dev>",
  });
});

test("menolak RESEND_API_KEY yang bukan key Resend", () => {
  expect(() => parseEnv({ ...minimal, RESEND_API_KEY: "kunci-salah" })).toThrowError(
    /API key Resend/,
  );
});

test("gagal dengan pesan yang menyebut variabel dan cara memperbaikinya", () => {
  expect(() => parseEnv({})).toThrowError(/DATABASE_URL/);
  expect(() => parseEnv({})).toThrowError(/BETTER_AUTH_SECRET/);
  expect(() => parseEnv({})).toThrowError(/RESEND_API_KEY/);
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

test("BETTER_AUTH_URL wajib dan harus absolut", () => {
  const tanpaUrl: Record<string, string> = { ...minimal };
  delete tanpaUrl.BETTER_AUTH_URL;

  expect(() => parseEnv(tanpaUrl)).toThrowError(/BETTER_AUTH_URL/);
  expect(() => parseEnv({ ...minimal, BETTER_AUTH_URL: "/api/auth" })).toThrowError(/URL absolut/);
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

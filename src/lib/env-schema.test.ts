import { expect, test } from "vitest";

import { parseEnv } from "./env-schema";

const valid = {
  DATABASE_URL: "postgresql://user:pass@host.neon.tech/rekan_tes?sslmode=require",
};

test("menerima environment yang lengkap dan mengabaikan variabel lain", () => {
  expect(parseEnv({ ...valid, TZ: "Asia/Jakarta" })).toEqual(valid);
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

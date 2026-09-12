import { getTableColumns, getTableName } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { getAuthTables } from "better-auth/db";
import { username } from "better-auth/plugins";
import { expect, test } from "vitest";

import { account, session, user, verification } from "./auth-schema";

/**
 * Better Auth tidak menyediakan CLI yang sepadan dengan versi library
 * terpasang, sehingga tabel auth ditulis tangan. Test ini membandingkannya
 * dengan definisi milik library agar perbedaan terlihat saat versi dinaikkan.
 */
const authTables = getAuthTables({
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "participant", input: false },
    },
  },
  plugins: [username()],
});

const kami: Record<string, PgTable> = { user, session, account, verification };

/** Nama kolom snake_case yang diharapkan Better Auth untuk satu tabel. */
function kolomDiharapkan(key: string) {
  const def = authTables[key];
  const names = Object.entries(def.fields).map(([field, d]) =>
    (d.fieldName ?? field).replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`),
  );
  return new Set(["id", ...names]);
}

test.each(Object.keys(kami))("tabel %s ada dan namanya cocok", (key) => {
  expect(authTables[key]).toBeDefined();
  expect(getTableName(kami[key])).toBe(authTables[key].modelName);
});

test.each(Object.keys(kami))("kolom tabel %s cocok dengan Better Auth", (key) => {
  const punyaKami = new Set(Object.values(getTableColumns(kami[key])).map((c) => c.name));
  expect([...punyaKami].sort()).toEqual([...kolomDiharapkan(key)].sort());
});

test("password hanya berada di tabel account, bukan user", () => {
  const kolomUser = Object.values(getTableColumns(user)).map((c) => c.name);
  const kolomAccount = Object.values(getTableColumns(account)).map((c) => c.name);

  expect(kolomUser).not.toContain("password");
  expect(kolomAccount).toContain("password");
});

test("role adalah field server-owned dengan default participant", () => {
  expect(authTables.user.fields.role?.input).toBe(false);
  expect(authTables.user.fields.role?.defaultValue).toBe("participant");
  expect(getTableColumns(user).role.default).toBe("participant");
});

test("username dan email unik", () => {
  const kolom = getTableColumns(user);
  expect(kolom.username.isUnique).toBe(true);
  expect(kolom.email.isUnique).toBe(true);
});

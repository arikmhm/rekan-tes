import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

import { parseMigrationEnv } from "./src/lib/env-schema";

// Drizzle Kit berjalan di luar runtime Next.js, jadi `.env*` dimuat manual.
loadEnvConfig(process.cwd());

// Memakai endpoint direct; endpoint pooled dapat menggagalkan DDL.
const { url } = parseMigrationEnv(process.env);

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});

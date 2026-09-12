import "server-only";

import { drizzle } from "drizzle-orm/neon-serverless";

import { env } from "@/lib/env";

import * as schema from "./schema";

/**
 * Koneksi database untuk runtime aplikasi, memakai endpoint pooled.
 *
 * Driver neon-serverless dipilih, bukan neon-http, karena pemberian attempt
 * setelah webhook DOKU membutuhkan transaksi sungguhan dan neon-http melempar
 * error pada `transaction()`.
 *
 * Guard `server-only` menjaga modul ini tidak pernah masuk bundle klien.
 */
export const db = drizzle({ connection: env.DATABASE_URL, schema });

export { schema };

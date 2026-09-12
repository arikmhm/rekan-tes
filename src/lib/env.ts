import "server-only";

import { parseEnv } from "./env-schema";

export type { Env } from "./env-schema";

/**
 * Environment server yang sudah tervalidasi. Impor ini hanya dari kode server;
 * guard `server-only` membuat build gagal jika terbawa ke Client Component.
 */
export const env = parseEnv(process.env);

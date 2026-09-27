import "server-only";

import { drizzle } from "drizzle-orm/neon-serverless";

import { env } from "@/lib/env";

import * as schema from "./schema";

/** neon-serverless, bukan neon-http: neon-http melempar error pada `transaction()`. */
export const db = drizzle({ connection: env.DATABASE_URL, schema });

export { schema };

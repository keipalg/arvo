import "dotenv/config";
import { drizzle, type NeonQueryResultHKT } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema.js";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { ExtractTablesWithRelations } from "drizzle-orm";

export const db = drizzle({
    connection: process.env.DATABASE_URL!,
    ws,
    schema,
});

type NeonDb = typeof db;
type NeonTransaction = PgTransaction<
    NeonQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
>;
export type NeonDbTx = NeonDb | NeonTransaction;

import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

export const db = drizzle(process.env.DATABASE_URL!, { schema: schema });

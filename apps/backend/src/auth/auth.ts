import { betterAuth } from "better-auth";
import { db } from "../db/client.js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as authSchema from "./auth-schema.js";

export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins: ["http://localhost:5173", "http://localhost:4173"],
});

export type AuthType = {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
};

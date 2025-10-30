import { betterAuth } from "better-auth";
import { db } from "../db/client.js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as authSchema from "./auth-schema.js";
import { v7 as uuidv7 } from "uuid";

export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
    emailAndPassword: {
        enabled: true,
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
    },
    trustedOrigins: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
        : ["http://localhost:5173", "http://localhost:4173"],
    advanced: {
        database: {
            generateId: () => uuidv7(),
        },
        defaultCookieAttributes: {
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
            partitioned: process.env.NODE_ENV === "production",
        },
    },
});

export type AuthType = {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
};

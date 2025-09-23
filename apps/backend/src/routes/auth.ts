import { Hono } from "hono";
import { auth, type AuthType } from "../auth/auth.js";
import { db } from "../db/client.js";
import { sampleTable } from "../db/schema.js";

const router = new Hono<{ Variables: AuthType }>({
    strict: false,
});

router.on(["POST", "GET", "OPTIONS"], "/auth/*", async (c) => {
    try {
        const res = await auth.handler(c.req.raw);
        return c.newResponse(await res.text(), res);
    } catch (err) {
        console.error("BetterAuth error:", err);
        return c.json({ message: "Auth error", error: err }, 500);
    }
});

router.use("/user/*", async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        c.set("user", null);
        c.set("session", null);
        return c.json({ message: "Unauthorized" }, 403);
    }

    c.set("user", session.user);
    c.set("session", session.session);
    return next();
});

router.get("/", async (c) => {
    const sample = await db.select().from(sampleTable);
    return c.json(sample);
});

router.get("/user", async (c) => {
    return c.text("user");
});

export default router;

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { AuthType } from "./auth/auth.js";
import auth from "./routes/auth.js";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc.js";

const app = new Hono<{ Variables: AuthType }>({
    strict: false,
});

app.use(
    "*",
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    }),
);

app.use(
    "/trpc/*",
    trpcServer({
        router: appRouter,
    }),
);

const routes = [auth] as const;

routes.forEach((route) => {
    app.basePath("/api").route("/", route);
});

serve(
    {
        fetch: app.fetch,
        port: Number(process.env.PORT) ?? 3000,
    },
    (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    },
);

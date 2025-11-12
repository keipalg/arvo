import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth, type AuthType } from "./auth/auth.js";
import authRoutes from "./routes/auth.js";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc.js";

const app = new Hono<{ Variables: AuthType }>({
    strict: false,
});

app.use(
    "*",
    cors({
        origin: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
            : ["http://localhost:5173"],
        credentials: true,
    }),
);

app.use(
    "/trpc/*",
    trpcServer({
        router: appRouter,
        createContext: async (opts) => {
            const session = await auth.api.getSession({
                headers: opts.req.headers,
            });
            return {
                user: session?.user ?? null,
                session: session?.session ?? null,
            };
        },
    }),
);

const routes = [authRoutes] as const;

routes.forEach((route) => {
    app.basePath("/api").route("/", route);
});

serve(
    {
        fetch: app.fetch,
        port: Number(process.env.PORT) ?? 8080,
    },
    (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    },
);

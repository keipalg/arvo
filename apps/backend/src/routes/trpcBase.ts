import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { AuthType } from "../auth/auth.js";

type Context = {
    user: AuthType["user"];
    session: AuthType["session"];
};

export const t = initTRPC.context<Context>().create({
    transformer: superjson,
});

export const publicProcedure = t.procedure;

const isAuthenticated = t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
        throw new Error("Unauthorized");
    }
    return next({
        ctx: {
            user: ctx.user,
        },
    });
});

export const protectedProcedure = t.procedure.use(isAuthenticated);
export const router = t.router;

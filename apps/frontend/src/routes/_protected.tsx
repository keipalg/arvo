import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "../auth/auth-client";

export const Route = createFileRoute("/_protected")({
    beforeLoad: async ({ location }) => {
        const { data: session } = await authClient.getSession();
        if (!session) {
            throw redirect({
                to: "/login",
                search: {
                    redirect: location.href,
                },
            });
        }
    },
});

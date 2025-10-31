import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "../auth/auth-client";
import { trpcClient } from "../utils/trpcClient";

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

        // Get or create user preferences
        let userPreferences = await trpcClient.userPreferences.get.query();
        if (!userPreferences) {
            await trpcClient.userPreferences.create.mutate();
            userPreferences = await trpcClient.userPreferences.get.query();
        }

        // Check if user has completed setup
        if (location.pathname !== "/setup") {
            if (!userPreferences?.hasCompletedSetup) {
                throw redirect({
                    to: "/setup",
                });
            }
        }
    },
});

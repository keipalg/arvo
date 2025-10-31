import { createFileRoute, redirect } from "@tanstack/react-router";
import BaseLayout from "../../components/BaseLayout";
import { authClient } from "../../auth/auth-client";

export const Route = createFileRoute("/_public/")({
    beforeLoad: async () => {
        const { data: session } = await authClient.getSession();
        if (session) {
            throw redirect({ to: "/dashboard" });
        }
    },
    component: Index,
});

function Index() {
    const { data: session } = authClient.useSession();

    return (
        <BaseLayout title="Public Home">
            <h3>
                {session?.user?.name
                    ? `Hello, ${session.user.name}`
                    : "Please login to access the your dashboard."}
            </h3>
        </BaseLayout>
    );
}

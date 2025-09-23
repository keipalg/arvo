import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../components/BaseLayout";

export const Route = createFileRoute("/_public/")({
    component: Index,
});

function Index() {
    return (
        <BaseLayout title="Public Home">
            <h3>Welcome Home!</h3>
        </BaseLayout>
    );
}

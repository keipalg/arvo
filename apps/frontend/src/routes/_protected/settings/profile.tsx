import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/settings/profile")({
    component: RouteComponent,
});

function RouteComponent() {
    return <div>Settings Profile</div>;
}

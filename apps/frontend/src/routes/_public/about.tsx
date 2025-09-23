import { createFileRoute } from "@tanstack/react-router";
import { type About } from "shared/types/sample.ts";
import { trpc } from "../../utils/trpcClient";
import BaseLayout from "../../components/BaseLayout";

export const Route = createFileRoute("/_public/about")({
    component: About,
});

function About() {
    const { data, isLoading, error } = trpc.about.useQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <BaseLayout title="About">
            <h3>Samples</h3>
            <dl>
                {data?.map((element) => (
                    <>
                        <dt>{element.id}</dt>
                        <dt>{element.name}</dt>
                    </>
                ))}
            </dl>
        </BaseLayout>
    );
}

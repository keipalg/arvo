import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "../../utils/trpcClient";
import BaseLayout from "../../components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../../components/loading/LoadingSpinner";

export const Route = createFileRoute("/_public/about")({
    component: About,
});

function About() {
    const { data, isLoading, error } = useQuery(trpc.about.queryOptions());

    return (
        <BaseLayout title="About">
            <h3>Samples</h3>
            {isLoading && <LoadingSpinner />}
            {error && <div>Error: {error.message}</div>}
            {!isLoading && !error && (
                <dl>
                    {data?.map((element) => (
                        <>
                            <dt>{element.id}</dt>
                            <dt>{element.name}</dt>
                        </>
                    ))}
                </dl>
            )}
        </BaseLayout>
    );
}

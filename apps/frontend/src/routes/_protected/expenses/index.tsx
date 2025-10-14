import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../components/BaseLayout";

export const Route = createFileRoute("/_protected/expenses/")({
    component: ExpensesList,
});

function ExpensesList() {
    return (
        <BaseLayout title="Expenses List">
            <div>All Expenses should be shown. I will create later.</div>
        </BaseLayout>
    );
}

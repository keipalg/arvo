import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "../../utils/trpcClient";
import { SettingsLayout, type SettingsData } from "./SettingsLayout";
import { useEffect, useState } from "react";
import LoadingSpinner from "../loading/LoadingSpinner";

type SettingsFormData = {
    lowInventoryAlertForGoods: boolean;
    lowInventoryAlertForMaterials: boolean;
};

export const SettingsNotification = () => {
    const [visibleToast, setVisibleToast] = useState(false);
    const [toastMessage, setToastMessage] = useState<{
        kind: "INFO" | "SUCCESS" | "WARN";
        content: string;
    }>({ kind: "INFO", content: "" });
    const { data: userPreferences, isLoading: isLoadingUserPreferences } =
        useQuery(trpc.userPreferences.get.queryOptions());
    console.log("userPreferences", userPreferences);

    const [settingsForm, setSettingsForm] = useState<
        SettingsFormData | undefined
    >(undefined);
    console.log("settingsForm", settingsForm);

    const updateLowInventoryAlertMutation = useMutation(
        trpc.userPreferences.updateLowInventoryAlert.mutationOptions({
            onSuccess: () => {
                console.log("Low inventory alert updated successfully");
                setVisibleToast(true);
                setToastMessage({
                    kind: "SUCCESS",
                    content:
                        "Success! Notification settings have been updated.",
                });
            },
            onError: (error) => {
                console.error("Error updating low inventory alert:", error);
                setVisibleToast(true);
                setToastMessage({
                    kind: "WARN",
                    content:
                        "Failed to update notification settings. Please try again.",
                });
            },
        }),
    );

    useEffect(() => {
        if (userPreferences) {
            setSettingsForm({
                lowInventoryAlertForGoods:
                    userPreferences.lowInventoryAlertForGoods,
                lowInventoryAlertForMaterials:
                    userPreferences.lowInventoryAlertForMaterials,
            });
        }
    }, [userPreferences]);

    if (isLoadingUserPreferences || !userPreferences || !settingsForm) {
        return <LoadingSpinner />;
    }

    const settingsData: SettingsData = [
        {
            label: "Notifications",
            type: "toggleButton",
            value: settingsForm.lowInventoryAlertForGoods,
            subTitle: "Low Inventory of Product",
            subTagline:
                "Get notified when product stock levels fall below your defined threshold.",
            handleChange: (e) =>
                setSettingsForm((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        lowInventoryAlertForGoods: e.target.checked,
                    };
                }),
        },
        {
            type: "toggleButton",
            value: settingsForm.lowInventoryAlertForMaterials,
            subTitle: "Low Inventory of Materials",
            subTagline:
                "Get notified when product stock levels fall below your defined threshold.",
            handleChange: (e) =>
                setSettingsForm((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        lowInventoryAlertForMaterials: e.target.checked,
                    };
                }),
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!settingsForm) return;

        updateLowInventoryAlertMutation.mutate({
            lowInventoryAlertForGoods: settingsForm.lowInventoryAlertForGoods,
            lowInventoryAlertForMaterials:
                settingsForm.lowInventoryAlertForMaterials,
        });
    };

    return (
        <SettingsLayout
            title="Notification Settings"
            tagline="Manage how and when you receive updates and alerts from us."
            settingsData={settingsData}
            handleSubmit={handleSubmit}
            visibleToast={visibleToast}
            setVisibleToast={setVisibleToast}
            toastMessage={toastMessage}
        />
    );
};

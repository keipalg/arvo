import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "../../utils/trpcClient";
import { SettingsLayout, type SettingsData } from "./SettingsLayout";
import { useEffect, useState } from "react";

type SettingsFormData = {
    lowInventoryAlertForGoods: boolean;
    lowInventoryAlertForMaterials: boolean;
};

export const SettingsNotification = () => {
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
        return <div>Loading...</div>;
    }

    const settingsData: SettingsData = [
        {
            label: "Notifications",
            type: "toggleButton",
            value: settingsForm.lowInventoryAlertForGoods,
            subTitle: "Low Inventory of Goods",
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
        />
    );
};

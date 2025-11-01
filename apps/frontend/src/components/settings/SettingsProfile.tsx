import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "../../utils/trpcClient";
import { SettingsLayout, type SettingsData } from "./SettingsLayout";
import { useEffect, useState } from "react";
import { authClient } from "../../auth/auth-client";

type SettingsFormData = {
    name?: string;
    email?: string;
    phone?: string;
    image?: string;
    storeName?: string;
    storeLocation?: string;
};

export const SettingsProfile = () => {
    const { data: userInfo, isLoading: isLoadingUserInfo } = useQuery(
        trpc.user.info.queryOptions(),
    );
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [settingsForm, setSettingsForm] = useState<SettingsFormData | null>(
        null,
    );
    console.log("userInfo", userInfo);
    console.log("settingsForm", settingsForm);

    useEffect(() => {
        if (userInfo && userInfo.length > 0) {
            const info = userInfo[0];
            setSettingsForm({
                name: info.name ?? "",
                email: info.email ?? "",
                phone: info.phone ?? "",
                storeName: info.storeName ?? "",
                storeLocation: info.storeLocation ?? "",
            });
        }
    }, [userInfo]);

    const updateProfitMutation = useMutation(
        trpc.user.update.mutationOptions({
            onSuccess: () => {
                console.log("User info updated successfully");
            },
        }),
    );

    const handleChangePassword = async () => {
        try {
            const result = await authClient.changePassword({
                currentPassword,
                newPassword,
            });
            console.log("Password change result:", result);
        } catch (error) {
            console.error("Error changing password:", error);
        }
    };

    if (isLoadingUserInfo || !userInfo || !settingsForm) {
        return <div>Loading...</div>;
    }

    const settingsData: SettingsData = [
        {
            label: "Name",
            type: "text",
            value: settingsForm.name || "",
            handleChange: (e) =>
                setSettingsForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                })),
        },
        {
            label: "Email",
            type: "text",
            value: settingsForm.email || "",
            handleChange: (e) =>
                setSettingsForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                })),
        },
        {
            label: "Current Password",
            type: "password",
            value: currentPassword,
            handleChange: (e) => {
                setCurrentPassword(e.target.value);
            },
        },
        {
            label: "New Password",
            type: "password",
            value: newPassword,
            handleChange: (e) => {
                setNewPassword(e.target.value);
            },
        },
        {
            label: "Phone Number",
            type: "text",
            value: settingsForm.phone || "",
            handleChange: (e) =>
                setSettingsForm((prev) => ({
                    ...prev,
                    phone: e.target.value,
                })),
        },
        {
            label: "Profile Photo",
            type: "text",
            value: "working on later",
            handleChange: (e) =>
                setSettingsForm((prev) => ({
                    ...prev,
                    image: e.target.value,
                })),
        },
        {
            label: "Store Name",
            type: "text",
            value: settingsForm.storeName || "",
            handleChange: (e) =>
                setSettingsForm((prev) => ({
                    ...prev,
                    storeName: e.target.value,
                })),
        },
        {
            label: "Store Location",
            type: "text",
            value: settingsForm.storeLocation || "",
            handleChange: (e) =>
                setSettingsForm((prev) => ({
                    ...prev,
                    storeLocation: e.target.value,
                })),
        },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        updateProfitMutation.mutate({
            ...settingsForm,
        });

        if (newPassword && currentPassword) {
            await handleChangePassword();
        }
    };

    return (
        <SettingsLayout
            title="Your Profile"
            tagline="Please update your profile settings here"
            settingsData={settingsData}
            handleSubmit={(e) => {
                void handleSubmit(e);
            }}
        />
    );
};

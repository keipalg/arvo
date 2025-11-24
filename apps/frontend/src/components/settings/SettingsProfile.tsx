import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, trpc } from "../../utils/trpcClient";
import { SettingsLayout, type SettingsData } from "./SettingsLayout";
import { useEffect, useState } from "react";
import { authClient } from "../../auth/auth-client";
import { uploadFile } from "../../utils/fileUpload";
import LoadingSpinner from "../loading/LoadingSpinner";

type SettingsFormData = {
    name?: string;
    email?: string;
    phone?: string;
    imageURL?: string;
    imageFile?: File;
    storeName?: string;
    storeLocation?: string;
};

export const SettingsProfile = () => {
    const [visibleToast, setVisibleToast] = useState(false);
    const [toastMessage, setToastMessage] = useState<{
        kind: "INFO" | "SUCCESS" | "WARN";
        content: string;
    }>({ kind: "INFO", content: "" });
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
                imageURL: info.image ?? undefined,
                imageFile: undefined,
                storeName: info.storeName ?? "",
                storeLocation: info.storeLocation ?? "",
            });
        }
    }, [userInfo]);

    const updateProfitMutation = useMutation(
        trpc.user.update.mutationOptions({
            onSuccess: (newUserInfo) => {
                console.log("User info updated successfully", newUserInfo);
                setVisibleToast(true);
                setToastMessage({
                    kind: "SUCCESS",
                    content: "Success! Profile settings have been updated.",
                });
                queryClient.setQueryData(trpc.user.info.queryKey(), [
                    newUserInfo,
                ]);
            },
            onError: (error) => {
                console.error("Error updating user info:", error);
                setVisibleToast(true);
                setToastMessage({
                    kind: "WARN",
                    content:
                        "Failed to update profile settings. Please try again.",
                });
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
        return <LoadingSpinner />;
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
            type: "image",
            value: settingsForm.imageFile || settingsForm.imageURL,
            handleChange: (e) => {
                const file = e.target.files?.[0];
                if (!file) {
                    setSettingsForm((prev) => ({
                        ...prev,
                        imageFile: undefined,
                        imageURL: undefined,
                    }));
                    return;
                }

                const imageUrl = URL.createObjectURL(file);
                setSettingsForm((prev) => ({
                    ...prev,
                    imageFile: file,
                    imageURL: imageUrl,
                }));
            },
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

        let profileImage: string | undefined = undefined;
        if (settingsForm.imageFile !== undefined) {
            profileImage = await uploadFile(settingsForm.imageFile);
            console.log("Uploaded profile image URL:", profileImage);
        } else if (typeof settingsForm.imageURL === "string") {
            profileImage = settingsForm.imageURL;
        }

        updateProfitMutation.mutate({
            name: settingsForm.name,
            email: settingsForm.email,
            phone: settingsForm.phone,
            storeName: settingsForm.storeName,
            storeLocation: settingsForm.storeLocation,
            image: profileImage,
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
            visibleToast={visibleToast}
            setVisibleToast={setVisibleToast}
            toastMessage={toastMessage}
        />
    );
};

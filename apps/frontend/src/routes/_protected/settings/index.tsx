import { createFileRoute } from "@tanstack/react-router";
import BaseLayout from "../../../components/BaseLayout";
import PageTitle from "../../../components/layout/PageTitle";
import { useState } from "react";
import { SettingsBusiness } from "../../../components/settings/SettingsBusiness";
import { SettingsNotification } from "../../../components/settings/SettingsNotification";
import { SettingsProfile } from "../../../components/settings/SettingsProfile";

export const Route = createFileRoute("/_protected/settings/")({
    component: Settings,
});

type Tab = "Profile" | "Notification Settings" | "Business Settings";

function Settings() {
    const tabs: Tab[] = [
        "Profile",
        "Notification Settings",
        "Business Settings",
    ];
    const [activeTab, setActiveTab] = useState<Tab>("Profile");

    return (
        <BaseLayout title="Settings">
            <div className="flex justify-between">
                <PageTitle title="Settings" />
            </div>
            <nav className="py-4">
                <ul className="flex">
                    {tabs.map((tab, index) => (
                        <li
                            key={index}
                            className={`font-bold py-1 px-5 border-b-2  hover:border-arvo-blue-100 ${activeTab === tab ? "border-arvo-blue-100" : "border-b-gray-300"}`}
                        >
                            <a
                                className={`cursor-pointer`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            {activeTab === "Business Settings" && <SettingsBusiness />}
            {activeTab === "Notification Settings" && <SettingsNotification />}
            {activeTab === "Profile" && <SettingsProfile />}
        </BaseLayout>
    );
}

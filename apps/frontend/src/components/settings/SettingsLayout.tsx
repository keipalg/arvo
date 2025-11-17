import Button from "../button/Button";
import { Switcher } from "../button/Switcher";
import { FileInput } from "../input/FileInput";
import { PasswordInput } from "../input/PasswordInput";
import ToastNotification from "../modal/ToastNotification";
import ToolTip from "../toolTip/ToolTip";

export type SettingsData = {
    label?: string;
    tooltip?: string;
    type:
        | "money"
        | "percentage"
        | "toggleButton"
        | "text"
        | "password"
        | "item"
        | "image";
    value: string | number | boolean | File | undefined;
    disabled?: boolean;
    subTitle?: string;
    subTagline?: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}[];

export const SettingsLayout = ({
    title,
    tagline,
    settingsData,
    handleSubmit,
    setVisibleToast,
    visibleToast,
    toastMessage,
}: {
    title: string;
    tagline: string;
    settingsData: SettingsData;
    handleSubmit: (e: React.FormEvent) => void;
    setVisibleToast: (visible: boolean) => void;
    visibleToast: boolean;
    toastMessage: { kind: "INFO" | "SUCCESS" | "WARN"; content: string };
}) => {
    return (
        <div className="flex flex-col gap-8 p-5">
            <ToastNotification
                setVisibleToast={setVisibleToast}
                visibleToast={visibleToast}
                message={toastMessage}
            />
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold">{title}</h2>
                <p>{tagline}</p>
            </div>
            <form onSubmit={handleSubmit}>
                {settingsData.map((item, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-start gap-2 sm:flex-row sm:items-center border-b-1 border-arvo-black-5 py-5"
                    >
                        <label className="flex gap-3 min-w-80">
                            <span>{item.label}</span>
                            {item.tooltip && (
                                <span>
                                    <ToolTip info={item.tooltip} />
                                </span>
                            )}
                        </label>
                        {item.type === "money" && (
                            <div
                                className={`relative w-full border rounded-xl focus:border-arvo-blue-100 px-2.5 py-2.5 bg-arvo-white-0 border-arvo-black-5 ${item.disabled ? "bg-gray-200 cursor-not-allowed" : ""}`}
                            >
                                <span className="block pr-2 border-r-1 w-10 text-center">
                                    $
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    onChange={item.handleChange}
                                    value={item.value as number | undefined}
                                    disabled={item.disabled}
                                    className={`absolute left-14 top-0 bottom-0 right-0 pl-2 pr-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                                />
                            </div>
                        )}
                        {item.type === "item" && (
                            <div
                                className={`relative w-full border rounded-xl focus:border-arvo-blue-100 px-2.5 py-2.5 bg-arvo-white-0 border-arvo-black-5 ${item.disabled ? "bg-gray-200 cursor-not-allowed" : ""}`}
                            >
                                <span className="block pr-2 border-r-1 w-10 text-center">
                                    item
                                </span>
                                <input
                                    type="number"
                                    step="1"
                                    onChange={item.handleChange}
                                    value={item.value as number | undefined}
                                    disabled={item.disabled}
                                    className={`absolute left-14 top-0 bottom-0 right-0 pl-2 pr-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                                />
                            </div>
                        )}
                        {item.type === "percentage" && (
                            <div className="relative w-full border rounded-xl focus:border-arvo-blue-100 px-2.5 py-2.5 bg-arvo-white-0 border-arvo-black-5">
                                <span className="block pr-2 border-r-1 w-10 text-center">
                                    %
                                </span>
                                <input
                                    type="number"
                                    step="1"
                                    onChange={item.handleChange}
                                    value={
                                        Math.round(
                                            (item.value as number) * 100 * 100,
                                        ) / 100
                                    }
                                    className="absolute left-14 top-0 bottom-0 right-0 pl-2 pr-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                        )}
                        {item.type === "toggleButton" && (
                            <Switcher
                                key={index}
                                label={item.subTitle || ""}
                                tagline={item.subTagline || ""}
                                checked={item.value as boolean}
                                onChange={item.handleChange}
                            />
                        )}
                        {item.type === "text" && (
                            <div className="relative w-full border rounded-xl focus:border-arvo-blue-100 px-2.5 py-2.5 bg-arvo-white-0 border-arvo-black-5">
                                <input
                                    type="text"
                                    onChange={item.handleChange}
                                    value={item.value as string | undefined}
                                    className="pl-2 pr-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
                                />
                            </div>
                        )}
                        {item.type === "password" && (
                            <PasswordInput
                                password={item.value as string}
                                handlePasswordChange={item.handleChange}
                                className="w-full border rounded-xl focus:border-arvo-blue-100 px-2.5 py-2.5 bg-arvo-white-0 border-arvo-black-5"
                            />
                        )}
                        {item.type === "image" && (
                            <FileInput
                                file={item.value as File | undefined}
                                onChange={(e) => {
                                    item.handleChange(e);
                                }}
                            />
                        )}
                    </div>
                ))}
                <div className="flex flex-col justify-center px-20 mt-10">
                    <Button type="submit" value="Save Change" />
                </div>
            </form>
        </div>
    );
};

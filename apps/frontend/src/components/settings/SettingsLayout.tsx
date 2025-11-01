import Button from "../button/Button";
import { Switcher } from "../button/Switcher";
import { PasswordInput } from "../input/PasswordInput";

export type SettingsData = {
    label?: string;
    type:
        | "money"
        | "percentage"
        | "toggleButton"
        | "text"
        | "password"
        | "item";
    value: string | number | boolean;
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
}: {
    title: string;
    tagline: string;
    settingsData: SettingsData;
    handleSubmit: (e: React.FormEvent) => void;
}) => {
    return (
        <div className="flex flex-col gap-8 py-5">
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold">{title}</h2>
                <p>{tagline}</p>
            </div>
            <form onSubmit={handleSubmit}>
                {settingsData.map((item, index) => (
                    <div key={index} className="flex items-center mb-4">
                        <label className="block min-w-80">{item.label}</label>
                        {item.type === "money" && (
                            <div
                                className={`relative border border-gray-300 rounded w-full py-2 px-3 ${item.disabled ? "bg-gray-200 cursor-not-allowed" : ""}`}
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
                                className={`relative border border-gray-300 rounded w-full py-2 px-3 ${item.disabled ? "bg-gray-200 cursor-not-allowed" : ""}`}
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
                            <div className="relative border border-gray-300 rounded w-full py-2 px-3">
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
                            <div className="border border-gray-300 rounded w-full py-2 px-3">
                                <input
                                    type="text"
                                    onChange={item.handleChange}
                                    value={item.value as string | undefined}
                                    className="pl-2 pr-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                        )}
                        {item.type === "password" && (
                            <PasswordInput
                                password={item.value as string}
                                handlePasswordChange={item.handleChange}
                                className="border border-gray-300 rounded w-full py-2 px-3"
                            />
                        )}
                    </div>
                ))}
                <Button type="submit" value="Save" />
            </form>
        </div>
    );
};

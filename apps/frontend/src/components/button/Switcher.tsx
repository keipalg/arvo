import { useState } from "react";

export const Switcher = ({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) => {
    const [isChecked, setIsChecked] = useState(false);

    return (
        <>
            <label htmlFor="switcher" className="flex items-center gap-2">
                <input
                    id="switcher"
                    type="checkbox"
                    className="hidden"
                    onClick={() => setIsChecked((prev) => !prev)}
                />
                <div className={`relative bg-white rounded-full h-8 w-14 p-1`}>
                    <div
                        className={`absolute top-1 h-6 w-6 rounded-full transition-transform duration-300 ${isChecked ? "bg-black translate-x-full" : "bg-gray-200 translate-x-0"}`}
                    ></div>
                </div>
                <div>{label}</div>
            </label>
            {isChecked && children}
        </>
    );
};

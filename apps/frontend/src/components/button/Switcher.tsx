export const Switcher = ({
    label,
    tagline,
    children,
    checked = false,
    onChange,
}: {
    label: string;
    tagline?: string;
    children?: React.ReactNode;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
    return (
        <>
            <label htmlFor={label} className="flex items-center gap-5">
                <input
                    id={label}
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={onChange}
                />
                <div
                    className={`flex-shrink-0 relative rounded-full h-8 w-14 p-1 transition-all duration-300 ${checked ? "bg-arvo-blue-100" : "bg-gray-300"}`}
                >
                    <div
                        className={`absolute top-1 h-6 w-6 rounded-full transition-all duration-300 bg-white ${checked ? "translate-x-full" : "translate-x-0"}`}
                    ></div>
                </div>
                <div>
                    <div>{label}</div>
                    {tagline && (
                        <div className="text-sm text-gray-500">{tagline}</div>
                    )}
                </div>
            </label>
            {checked && children}
        </>
    );
};

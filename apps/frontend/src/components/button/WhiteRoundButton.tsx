type ButtonProps = {
    value?: string;
    type?: "button" | "submit" | "reset";
    onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
    icon?: string;
    disabled?: boolean;
    className?: string;
    compact?: boolean;
    iconSize?: string;
};

const WhiteRoundButton = ({
    value,
    type = "button",
    onClick,
    icon,
    disabled,
    className,
    compact = false,
    iconSize = "1.2em",
}: ButtonProps) => {
    const paddingClass = compact ? "px-2.5" : "px-6";

    return (
        <button
            type={type}
            className={`group rounded-xl ${paddingClass} py-1.5 text-arvo-blue-100 border-solid border-2 font-semibold  hover:bg-arvo-blue-50 hover:text-arvo-black-100 hover:border-arvo-blue-50 cursor-pointer flex items-center gap-2 justify-center disabled:bg-arvo-black-5 disabled:border-0 disabled:not-hover: disabled:text-arvo-black-100 ${className || ""}`}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && (
                <img
                    src={icon}
                    alt=""
                    className={`h-[${iconSize}] w-auto group-hover:brightness-0`}
                />
            )}
            {value}
        </button>
    );
};

export default WhiteRoundButton;

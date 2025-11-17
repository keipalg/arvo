type ButtonProps = {
    value?: string;
    type?: "button" | "submit" | "reset";
    onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
    icon?: string;
    disabled?: boolean;
    className?: string;
};
const Button = ({
    value,
    type = "button",
    onClick,
    icon,
    disabled,
    className,
}: ButtonProps) => {
    return (
        <button
            type={type}
            className={`group rounded-2xl px-6 py-3.5 bg-arvo-blue-100 hover:bg-arvo-blue-50 text-arvo-white-0 hover:text-arvo-black-100 cursor-pointer flex items-center gap-2 justify-center disabled:bg-arvo-black-5 disabled:not-hover: disabled:text-arvo-black-100
                ${value == "Delete" && "bg-arvo-red-50 border-2 border-arvo-red-100 hover:border-arvo-red-80 !text-arvo-red-100 hover:!text-arvo-white-0  hover:bg-arvo-red-80"} ${className || ""}`}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && (
                <img
                    src={icon}
                    alt=""
                    className="h-[1em] w-auto brightness-0 invert group-hover:brightness-100 group-hover:invert-0"
                />
            )}
            {value}
        </button>
    );
};

export default Button;

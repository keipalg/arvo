type ButtonProps = {
    value?: string;
    type?: "button" | "submit" | "reset";
    onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
    icon?: string;
    disabled?: boolean;
};

const WhiteRoundButton = ({
    value,
    type = "button",
    onClick,
    icon,
    disabled,
}: ButtonProps) => {
    return (
        <button
            type={type}
            className="group rounded-xl px-2.5 py-1.5 text-arvo-blue-100 border-solid border-2 font-semibold  hover:bg-arvo-blue-50 hover:text-arvo-black-100 hover:border-arvo-blue-50 cursor-pointer flex items-center gap-2 justify-center disabled:bg-arvo-black-5 disabled:border-0 disabled:not-hover: disabled:text-arvo-black-25"
            onClick={onClick}
            disabled={disabled}
        >
            {icon && (
                <img
                    src={icon}
                    alt=""
                    className="h-[1em] w-auto group-hover:brightness-100 group-hover:invert-0"
                />
            )}
            {value}
        </button>
    );
};

export default WhiteRoundButton;

type ButtonProps = {
    value?: string;
    type?: "button" | "submit" | "reset";
    onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
    icon?: string;
    disabled?: boolean;
};

const UnderLinedButton = ({
    value,
    type = "button",
    onClick,
    icon,
    disabled,
}: ButtonProps) => {
    return (
        <button
            type={type}
            className="group ro  text-arvo-blue-100 hover:cursor-pointer flex items-center border-b-1 w-28"
            onClick={onClick}
            disabled={disabled}
        >
            {icon && (
                <img
                    src={icon}
                    alt=""
                    className="h-[1em] mr-1.5 fill-arvo-blue-100 w-auto group-hover:cursor-pointer"
                />
            )}
            {value}
        </button>
    );
};

export default UnderLinedButton;

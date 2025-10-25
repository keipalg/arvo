type ButtonProps = {
    value?: string;
    type?: "button" | "submit" | "reset";
    onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
    icon?: string;
};

const Button = ({ value, type = "button", onClick, icon }: ButtonProps) => {
    return (
        <button
            type={type}
            className="group rounded-2xl px-6 py-3.5 bg-arvo-blue-100 hover:bg-arvo-blue-50 text-arvo-white-0 hover:text-arvo-black-100 cursor-pointer flex items-center gap-2 justify-center"
            onClick={onClick}
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

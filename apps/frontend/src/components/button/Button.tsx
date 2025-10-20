type ButtonProps = {
    value?: string;
    type?: "button" | "submit" | "reset";
    onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

const Button = ({ value, type = "button", onClick }: ButtonProps) => {
    return (
        <button
            type={type}
            className="border rounded-2xl px-2.5 py-3.5 bg-arvo-blue-100 text-arvo-white-0 cursor-pointer"
            onClick={onClick}
        >
            {value}
        </button>
    );
};

export default Button;

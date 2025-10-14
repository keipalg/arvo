type ButtonProps = {
    value?: string;
    type?: "button" | "submit" | "reset";
    onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

const Button = ({ value, type = "button", onClick }: ButtonProps) => {
    return (
        <button
            type={type}
            className="border rounded px-2 py-1 bg-blue-600 text-white"
            onClick={onClick}
        >
            {value}
        </button>
    );
};

export default Button;

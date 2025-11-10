type BadgeProps = {
    text: string;
    className?: string;
};

const Badge = ({ text, className }: BadgeProps) => {
    return (
        <div
            className={`${className ?? "text-gray-800 bg-gray-200"} text-center inline-block px-2.5 font-semibold py-0.5 rounded-lg whitespace-nowrap`}
        >
            {text}
        </div>
    );
};

export default Badge;

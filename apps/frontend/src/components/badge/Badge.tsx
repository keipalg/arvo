type BadgeProps = {
    text: string;
    className?: string;
};

const Badge = ({ text, className }: BadgeProps) => {
    return <div className={`${className ?? ""}`}>{text}</div>;
};

export default Badge;

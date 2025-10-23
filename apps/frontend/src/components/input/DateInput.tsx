export const DateInput = ({
    onChange,
    value,
    label,
}: {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value: string;
    label: string;
}) => {
    return (
        <div className="flex flex-col gap-1">
            <label>{label}</label>
            <input
                type="date"
                className="border rounded px-2 py-1 bg-white"
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

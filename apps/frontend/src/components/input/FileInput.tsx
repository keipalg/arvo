export const FileInput = ({
    onChange,
    label,
    file,
}: {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
    file: File | string | undefined;
}) => {
    return (
        <div className="flex flex-col gap-1">
            <label>{label}</label>
            <input
                type="file"
                className="border rounded px-2 py-1 bg-white"
                accept="image/*"
                onChange={onChange}
            />
            {file instanceof File && (
                <img src={URL.createObjectURL(file)} alt="" />
            )}
        </div>
    );
};

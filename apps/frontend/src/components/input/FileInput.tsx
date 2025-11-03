import { useRef, useState } from "react";
import FormLabel from "./FormLabel";

export const FileInput = ({
    onChange,
    label,
    file,
}: {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
    file: File | string | undefined;
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const first = files[0];
            if (first.type.startsWith("image/")) {
                const event = {
                    target: {
                        files: files,
                    },
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                onChange(event);
            }
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <FormLabel label={label} />
            <div
                onClick={handleClick}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border bg-arvo-white-0 rounded-xl px-2 py-6 flex items-center justify-center
                    ${
                        dragActive
                            ? "border-arvo-blue-100 bg-arvo-blue-50"
                            : "border-arvo-black-5"
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={onChange}
                />
                <div className="flex items-center gap-2">
                    <div>Upload the photo</div>
                </div>
            </div>
            <div className="flex justify-center">
                {file instanceof File && (
                    <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="max-h-48 object-contain"
                    />
                )}
                {typeof file === "string" && (
                    <img
                        src={file}
                        alt=""
                        className="max-h-48 object-contain"
                    />
                )}
            </div>
        </div>
    );
};

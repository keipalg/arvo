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

    const handleRemove = () => {
        const event = {
            target: {
                files: [],
            },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
    };

    return (
        <div className="flex flex-col gap-1">
            <FormLabel label={label} />
            {!file && (
                <div
                    onClick={handleClick}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border bg-arvo-white-0 rounded-xl border-dashed px-2 py-6 flex items-center justify-center
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
                    <div className="flex items-center gap-5">
                        <img src="/icon/icon-photo.svg" className="w-25 h-25" />
                        <div className="font-semibold flex flex-col items-center">
                            <div className="text-arvo-black-25">
                                Drag and Drop here
                            </div>
                            <div className="text-arvo-black-25">or</div>
                            <div className="text-arvo-blue-100 cursor-pointer">
                                Browse Files
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex flex-col gap-x-1 justify-center">
                {file instanceof File && (
                    <>
                        <p className="text-center text-arvo-black-50">
                            {file.name}
                        </p>
                        <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="max-h-48 object-contain"
                        />
                    </>
                )}
                {typeof file === "string" && (
                    <>
                        <img
                            src={file}
                            alt=""
                            className="max-h-48 object-contain"
                        />
                    </>
                )}
                {(file instanceof File || typeof file === "string") && (
                    <div className="flex justify-center gap-4 mt-2">
                        <button
                            type="button"
                            className="text-arvo-blue-100 font-semibold cursor-pointer"
                            onClick={handleClick}
                        >
                            Replace
                        </button>
                        <button
                            type="button"
                            className="text-arvo-blue-100 font-semibold cursor-pointer"
                            onClick={handleRemove}
                        >
                            Remove
                        </button>
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={onChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

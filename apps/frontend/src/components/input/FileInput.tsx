import { useRef, useState } from "react";
import FormLabel from "./FormLabel";

type FileType = "image" | "pdf";

type FileInputProps = {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    file: File | string | undefined;
    acceptedFileTypes?: FileType[];
};

export const FileInput = ({
    onChange,
    label,
    file,
    acceptedFileTypes = ["image"],
}: FileInputProps) => {
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

    const getAcceptedMimeTypes = () => {
        const types: string[] = [];
        if (acceptedFileTypes.includes("image")) {
            types.push("image/");
        }
        if (acceptedFileTypes.includes("pdf")) {
            types.push("application/pdf");
        }
        return types;
    };

    const getAcceptString = () => {
        const accepts: string[] = [];
        if (acceptedFileTypes.includes("image")) {
            accepts.push("image/*");
        }
        if (acceptedFileTypes.includes("pdf")) {
            accepts.push("application/pdf");
        }
        return accepts.join(",");
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const first = files[0];
            const acceptedMimeTypes = getAcceptedMimeTypes();
            const isAccepted = acceptedMimeTypes.some(
                (type) => first.type.startsWith(type) || first.type === type,
            );
            if (isAccepted) {
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
        <div className="flex flex-col gap-1 w-full">
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
                        accept={getAcceptString()}
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
            <div className="relative flex flex-col gap-x-1 justify-center m-auto w-full">
                {file instanceof File && file.type.startsWith("image/") && (
                    <>
                        <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="h-40 rounded-xl object-cover w-auto"
                        />
                    </>
                )}
                {file instanceof File && !file.type.startsWith("image/") && (
                    <div className="bg-arvo-white-0 rounded-xl h-40 flex items-start justify-center px-4 pt-4">
                        <div className="flex flex-col gap-0.5 items-center">
                            <a
                                href={URL.createObjectURL(file)}
                                download={file.name}
                                className="font-semibold text-m text-arvo-blue-100 hover:text-arvo-blue-80 underline truncate max-w-[300px] cursor-pointer"
                            >
                                {file.name}
                            </a>
                            <div className="text-xs text-arvo-black-50">
                                {(file.size / 1024).toFixed(2)} KB
                            </div>
                        </div>
                    </div>
                )}
                {typeof file === "string" && (
                    <>
                        <img
                            src={file}
                            alt=""
                            className="h-24 rounded-xl object-cover w-auto"
                        />
                    </>
                )}
                {(file instanceof File || typeof file === "string") && (
                    <div className="absolute left-1/2 -translate-x-1/2 rounded border-dashed border-2 border-arvo-black-10 bg-arvo-black-5 opacity-80 h-12 w-56 flex justify-center gap-4 mt-2">
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
                            accept={getAcceptString()}
                            onChange={onChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

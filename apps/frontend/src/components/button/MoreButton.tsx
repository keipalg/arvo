import { useState } from "react";

export const MoreButton = ({
    onEdit,
    onDelete,
}: {
    onEdit?: () => void;
    onDelete?: () => void;
}) => {
    const [isClicked, setIsClicked] = useState(false);
    return (
        <div className="relative">
            <button
                className="p-2 bg-arvo-gray-200 hover:bg-arvo-gray-300 cursor-pointer flex items-center justify-center"
                onClick={() => setIsClicked(!isClicked)}
            >
                <div
                    className={`p-1 rounded ${isClicked ? "bg-gray-200" : ""}`}
                >
                    <img src="/icon/more.svg" />
                </div>
            </button>
            <div
                className={`flex flex-col w-full absolute left-10 top-0 bg-white rounded shadow-2xl ${isClicked ? "block" : "hidden"}`}
            >
                <button
                    className="flex gap-1 p-3 items-center hover:bg-gray-200 rounded"
                    onClick={onEdit}
                >
                    <img src="/icon/edit.svg" className="w-5 h-5" />
                    <span>Edit</span>
                </button>
                <button
                    className="flex gap-1 p-3 items-center text-arvo-red-100 hover:bg-gray-200 rounded"
                    onClick={onDelete}
                >
                    <img
                        src="/icon/delete.svg"
                        className="w-5 h-5 fill-current"
                    />
                    <span>Delete</span>
                </button>
            </div>
        </div>
    );
};

import { useState } from "react";

export const MoreButton = ({
    onEdit,
    onDeleteModal,
}: {
    onEdit?: () => void;
    onDeleteModal?: () => void;
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
                    <img src="/icon/more.svg" className="min-w-1 max-w-1.5" />
                </div>
            </button>
            <div
                className={`flex flex-col w-25 absolute right-4/5 top-10 bg-white rounded shadow-2xl z-10 ${isClicked ? "block" : "hidden"}`}
            >
                <button
                    className="flex gap-1 p-3 items-center hover:bg-gray-200 rounded cursor-pointer"
                    onClick={onEdit}
                >
                    <img src="/icon/edit.svg" className="w-5 h-5" />
                    <span>Edit</span>
                </button>
                <button
                    className="flex gap-1 p-3 items-center text-arvo-red-100 hover:bg-gray-200 rounded cursor-pointer"
                    onClick={onDeleteModal}
                >
                    <img
                        src="/icon/delete.svg"
                        className="w-6 h-6 fill-current"
                    />
                    <span>Delete</span>
                </button>
            </div>
        </div>
    );
};

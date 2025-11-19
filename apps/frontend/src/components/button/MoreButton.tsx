import { useEffect } from "react";
import { useMoreButton } from "./useMoreButton";

export const MoreButton = ({
    id,
    onEdit,
    onDeleteModal,
}: {
    id: string;
    onEdit?: () => void;
    onDeleteModal?: () => void;
}) => {
    const { openButtonId, setOpenButtonId } = useMoreButton();
    const isOpen = openButtonId === id;

    useEffect(() => {
        const handleClickOutside = () => setOpenButtonId(null);

        if (isOpen) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isOpen, setOpenButtonId]);

    return (
        <div className="relative">
            <button
                className="p-2 bg-arvo-gray-200 hover:bg-arvo-gray-300 cursor-pointer flex items-center justify-center"
                onClick={(event) => {
                    event.stopPropagation();
                    setOpenButtonId(isOpen ? null : id);
                }}
            >
                <div className={`p-1 rounded ${isOpen ? "bg-gray-200" : ""}`}>
                    <img src="/icon/more.svg" className="min-w-1 max-w-1.5" />
                </div>
            </button>
            <div
                className={`flex flex-col w-25 absolute right-4/5 -bottom-3 bg-white rounded-md shadow-md/30 ${isOpen ? "block" : "hidden"}`}
            >
                <button
                    className="flex gap-1 p-1.5 items-center rounded-t-md hover:bg-arvo-blue-50 cursor-pointer"
                    onClick={onEdit}
                >
                    <img src="/icon/edit.svg" className="w-5 h-5" />
                    <span>Edit</span>
                </button>
                <button
                    className="flex gap-1 p-1.5 items-center rounded-b-md text-arvo-red-100 hover:bg-arvo-blue-50 cursor-pointer"
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

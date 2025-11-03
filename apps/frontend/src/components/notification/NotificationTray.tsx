import { useEffect, useRef } from "react";
import { NotificationList } from "./NotificationList";

type NotificationTrayProps = {
    onClose: () => void;
};

export const NotificationTray = ({ onClose }: NotificationTrayProps) => {
    const trayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                // check reference is defined
                trayRef.current &&
                // and click (event.target) is outside the tray
                !trayRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscKey);
        return () => {
            document.removeEventListener("keydown", handleEscKey);
        };
    }, [onClose]);

    return (
        <div
            ref={trayRef}
            className="absolute right-0 top-full z-50 mt-2 w-[75vw] max-w-md rounded-[16px] bg-arvo-blue-20 p-8"
            style={{ boxShadow: "0px 5px 15px 0px rgba(0, 0, 0, 0.15)" }}
        >
            <div className="flex items-center justify-between border-b border-arvo-black-5 pb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                    Your Notifications
                </h3>
            </div>
            <div className="pt-4">
                <NotificationList />
            </div>
        </div>
    );
};

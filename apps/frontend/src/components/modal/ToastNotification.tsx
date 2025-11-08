import { useEffect } from "react";

const ToastNotification = ({
    setVisibleToast,
    visibleToast,
    message,
}: {
    setVisibleToast: (visible: boolean) => void;
    visibleToast: boolean;
    message: { kind: string; content: string };
}) => {
    useEffect(() => {
        if (!visibleToast) return;

        const timer = setTimeout(() => {
            setVisibleToast(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [visibleToast, setVisibleToast]);

    return (
        <div
            id="toast-notification"
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-500 ease-in-out ${visibleToast ? "z-50 opacity-100 scale-100" : "z-0 opacity-0 scale-90"}`}
        >
            <div
                className={`border-2 rounded-2xl shadow-lg w-full max-w-md ${message.kind === "SUCCESS" ? "border-arvo-green-100 bg-arvo-green-20" : message.kind === "WARN" ? "border-arvo-yellow-100 bg-arvo-yellow-20" : "border-arvo-blue-100 bg-arvo-blue-20"}`}
            >
                <div className="p-6 text-center font-semibold">
                    <p>{message.content}</p>
                </div>
            </div>
        </div>
    );
};
export default ToastNotification;

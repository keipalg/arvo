type RightDrawerProps = {
    isOpen: boolean;
    children: React.ReactNode;
    onClose?: () => void;
    title?: string;
    narrower?: boolean;
};

const RightDrawer = ({
    isOpen,
    children,
    onClose,
    title,
    narrower,
}: RightDrawerProps) => {
    return (
        <>
            <div
                className={`absolute top-0 right-0 z-20 w-full sm:max-w-3xl h-screen overflow-y-auto p-7 pt-20 transition-transform bg-arvo-blue-20 shadow-2xl ${!narrower ? "sm:max-w-3xl" : "sm:max-w-lg"} ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="text-2xl font-semibold">{title}</div>
                {onClose && (
                    <button
                        className="absolute top-7 right-7 cursor-pointer"
                        onClick={onClose}
                        aria-label="Close"
                        type="button"
                    >
                        <img
                            src="../../icon/close.svg"
                            alt="Close Button"
                            className="w-6"
                        />
                    </button>
                )}
                {children}
            </div>
        </>
    );
};
export default RightDrawer;

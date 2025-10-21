type RightDrawerProps = {
    isOpen: boolean;
    children: React.ReactNode;
    onClose?: () => void;
};

const RightDrawer = ({ isOpen, children, onClose }: RightDrawerProps) => {
    return (
        <>
            <div
                className={`absolute top-0 right-0 w-80 min-h-full p-2 transition-transform bg-arvo-blue-20 shadow-2xl ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {onClose && (
                    <button
                        className="absolute top-2 right-2 text-xl"
                        onClick={onClose}
                        aria-label="Close"
                        type="button"
                    >
                        ×
                    </button>
                )}
                {children}
            </div>
        </>
    );
};
export default RightDrawer;

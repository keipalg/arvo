type RightDrawerProps = {
    isOpen: boolean;
    children: React.ReactNode;
    onClose?: () => void;
};

const RightDrawer = ({ isOpen, children, onClose }: RightDrawerProps) => {
    return (
        <>
            <div
                className={`absolute top-0 right-0 z-20 w-full sm:max-w-3xl min-h-full p-7 pt-20 transition-transform bg-arvo-blue-20 shadow-2xl ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
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
                            className="w-7"
                        />
                    </button>
                )}
                {children}
            </div>
        </>
    );
};
export default RightDrawer;

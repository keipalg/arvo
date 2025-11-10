const ConfirmationModal = ({
    confirmationMessage,
    isConfirmationModalOpen,
    setIsConfirmationModalOpen,
    onConfirm,
}: {
    confirmationMessage: string;
    isConfirmationModalOpen: boolean;
    setIsConfirmationModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: () => void;
}) => {
    return (
        <>
            <div
                id="confirmation-overlay"
                className={`fixed inset-0 bg-arvo-black-100/50 z-50 ${isConfirmationModalOpen ? "block" : "hidden"}`}
            >
                <div className="flex items-center justify-center min-h-screen px-4 text-xl">
                    <div className="bg-arvo-red-20 border-2 border-arvo-red-100 rounded-3xl shadow-lg w-full max-w-md">
                        <div className="p-10">
                            <h2 className="font-semibold mb-6">
                                {confirmationMessage}
                            </h2>
                            <div className="flex justify-center gap-4">
                                <button
                                    className="flex-1 py-3 bg-arvo-white-0 rounded-2xl border-2 border-arvo-blue-100 text-arvo-blue-100 font-semibold cursor-pointer hover:bg-arvo-white-100 hover:text-arvo-black-100"
                                    onClick={() =>
                                        setIsConfirmationModalOpen(false)
                                    }
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 py-3 bg-arvo-blue-100 text-arvo-black-5 rounded-2xl border-2 border-arvo-blue-100 font-semibold cursor-pointer hover:bg-arvo-blue-50 hover:text-arvo-black-100"
                                    onClick={() => {
                                        onConfirm();
                                        setIsConfirmationModalOpen(false);
                                    }}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default ConfirmationModal;

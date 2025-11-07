const ConfirmationModal = ({
    confirmationMessage,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    onConfirm,
}: {
    confirmationMessage: string;
    isDeleteModalOpen: boolean;
    setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: () => void;
}) => {
    return (
        <>
            <div
                id="confirmation-overlay"
                className={`fixed inset-0 bg-arvo-black-100/50 z-50 ${isDeleteModalOpen ? "block" : "hidden"}`}
            >
                <div className="flex items-center justify-center min-h-screen px-4">
                    <div className="bg-arvo-red-50 border-2 border-arvo-red-100 rounded-2xl shadow-lg w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4 text-center">
                                {confirmationMessage}
                            </h2>
                            <div className="flex justify-center space-x-4">
                                <button
                                    className="px-4 py-2 bg-white rounded-2xl border border-arvo-blue-100 w-30"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-arvo-blue-100 text-arvo-black-5 rounded-2xl border border-arvo-blue-100 w-30"
                                    onClick={() => {
                                        onConfirm();
                                        setIsDeleteModalOpen(false);
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

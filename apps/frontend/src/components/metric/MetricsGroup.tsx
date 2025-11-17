type MetricsGroupProps = {
    children: React.ReactNode;
    noMetricsAvailable?: boolean;
};

const MetricsGroup = ({
    children,
    noMetricsAvailable = false,
}: MetricsGroupProps) => {
    return (
        <div // only hide scrollbar on mobile view
            className="flex gap-6 py-2 overflow-x-auto
                [&::-webkit-scrollbar]:hidden
                sm:[&::-webkit-scrollbar]:block
                sm:[&::-webkit-scrollbar]:h-2
                sm:[&::-webkit-scrollbar-track]:bg-gray-100
                sm:[&::-webkit-scrollbar-thumb]:bg-gray-300
                sm:[&::-webkit-scrollbar-thumb]:rounded-full
                sm:[&::-webkit-scrollbar-thumb]:hover:bg-gray-400"
        >
            {noMetricsAvailable ? (
                <>
                    <div
                        className={`border rounded-2xl w-96 px-4 py-3.5 bg-arvo-white-100 border-arvo-black-5`}
                    >
                        <p className="text-arvo-gray-400 italic">
                            No data yet. Track your first product, sale, or
                            expense to unlock insights.
                        </p>
                    </div>
                </>
            ) : (
                children
            )}
        </div>
    );
};

export default MetricsGroup;

type MetricsGroupProps = {
    children: React.ReactNode;
};

const MetricsGroup = ({ children }: MetricsGroupProps) => {
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
            {children}
        </div>
    );
};

export default MetricsGroup;

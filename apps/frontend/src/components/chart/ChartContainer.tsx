type ChartContainerProps = {
    children?: React.ReactNode;
};

const ChartContainer = ({ children }: ChartContainerProps) => {
    return <div className="flex w-full justify-center h-64">{children}</div>;
};

export default ChartContainer;

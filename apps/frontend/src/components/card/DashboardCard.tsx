import HorizontalRule from "../hr/HorizontalRule";

type DashboardCardProps = {
    title?: string;
    description?: string;
    children?: React.ReactNode;
    overview?: string;
    className?: string;
};

const DashboardCard = ({
    title,
    description,
    children,
    overview,
    className,
}: DashboardCardProps) => {
    return (
        <div className={`rounded-2xl p-4 shadow-md ${className}`}>
            {title && <h4 className="text-2xl font-semibold">{title}</h4>}
            {description && (
                <p className="font-semibold text-arvo-black-50">
                    {description}
                </p>
            )}
            <div className="p-4 flex justify-center items-center">
                {children}
            </div>
            {overview && (
                <>
                    <HorizontalRule />
                    <div className="flex gap-4 items-center">
                        <img src="/icon/sparkle.svg" />
                        <p className="text-arvo-black-100 font-light">
                            {overview}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardCard;

import FormLabel from "./FormLabel";

type DisplayValueProps = {
    label: string;
    unit?: string;
    children: React.ReactNode;
    additionalStyle?: string;
};

const DisplayValue = ({
    label,
    children,
    unit,
    additionalStyle,
}: DisplayValueProps) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            <FormLabel label={label} />
            <div className="py-2.5 w-full">
                {unit && (
                    <span className="w-8 font-semibold text-center px-2.5 my-2.5 text-gray-600 border-r border-arvo-black-10">
                        {unit}
                    </span>
                )}
                <span
                    className={`${unit ? "px-2.5" : ""} py-2.5 ${additionalStyle || ""}`}
                >
                    {children}
                </span>
            </div>
        </div>
    );
};

export default DisplayValue;

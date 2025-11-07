import HorizontalRule from "../hr/HorizontalRule";
import FormLabel from "../input/FormLabel";

type CostBreakDownProps = {
    mor?: string;
    cogs?: string;
    operatingCosts?: string;
    profitMargin?: string;
};

const CostBreakDown = ({
    mor,
    cogs,
    operatingCosts,
    profitMargin,
}: CostBreakDownProps) => {
    return (
        <div>
            <FormLabel label="Cost Breakdown per Item" />

            <div className="bg-arvo-white-0 py-2.5 px-3 border-solid border border-arvo-black-5 rounded-2xl mt-1.5">
                <div className="flex flex-2 justify-between text-sm font-medium ">
                    Raw Materials
                    <span>{mor ? mor : 0}</span>
                </div>
                <HorizontalRule />
                <div className="flex flex-2 justify-between text-sm font-medium ">
                    COGS
                    <span>{cogs ? cogs : 0}</span>
                </div>
                <div className="flex flex-2 justify-between text-sm font-medium ">
                    Operating Costs
                    <span>{operatingCosts ? operatingCosts : 0}</span>
                </div>
                <HorizontalRule />
                <div className="flex flex-2 justify-between  font-semibold ">
                    Total Costs
                    <span>
                        ${" "}
                        {(
                            Number(cogs || 0) + Number(operatingCosts || 0)
                        ).toFixed(2)}
                    </span>
                </div>
                <HorizontalRule />
                <div className="flex flex-2 justify-between  font-semibold ">
                    Profit Margin
                    <span>{profitMargin ? profitMargin : 0} %</span>
                </div>
            </div>
        </div>
    );
};

export default CostBreakDown;

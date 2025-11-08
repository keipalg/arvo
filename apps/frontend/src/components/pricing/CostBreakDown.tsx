import HorizontalRule from "../hr/HorizontalRule";
import FormLabel from "../input/FormLabel";
import ToolTip from "../toolTip/ToolTip";

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
            <FormLabel
                label="Cost Breakdown per Item"
                info="To see how your product’s price is built with a breakdown of overall costs: materials, COGS, and operating costs, along with the total profit margin of each product."
            />

            <div className="bg-arvo-white-0 py-2.5 px-3 border-solid border border-arvo-black-5 rounded-2xl mt-1.5">
                <div className="flex flex-2 justify-between text-sm font-medium ">
                    Raw Materials
                    <span>{mor ? mor : 0}</span>
                </div>
                <HorizontalRule />
                <div className="flex flex-2 justify-between text-sm font-medium ">
                    <div className="flex">
                        <span className="pr-2">COGS</span>
                        <ToolTip
                            info="The direct and indirect costs involved in producing the products; Raw materials, Labor cost (from your setting),Studio overhead"
                            iconStyle="w-3"
                            boxStyle="translate-x-1/2"
                        />
                    </div>

                    <span>{cogs ? cogs : 0}</span>
                </div>
                <div className="flex flex-2 justify-between text-sm font-medium ">
                    <div className="flex">
                        <span className="pr-2">Operating Cost</span>
                        <ToolTip
                            info="The day-to-day expenses required to run your business, not directly linked to producing each product."
                            iconStyle="w-3"
                        />
                    </div>

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

import FormLabel from "../input/FormLabel";
import { useState, useEffect } from "react";

type Material = {
    materialName?: string;
    unitAbbreviation?: string;
    usedAmount?: number;
    inventoryQuantity?: number;
    cost?: number;
    errorCondition: string;
};

type MaterialCostTableProps = {
    materials?: Material[];
    totalCost?: string;
};

const MaterialCostTable = ({
    materials,
    totalCost,
}: MaterialCostTableProps) => {
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const hasError = materials?.some((item) => item.errorCondition);
        setIsError(!!hasError);
    }, [materials]);

    return (
        <div className="flex flex-col">
            <FormLabel label="Material Cost" />
            {isError && (
                <div className="text-sm text-red-500">
                    * Your inventory is insufficient
                </div>
            )}
            <div className="rounded-lg overflow-x-auto border border-arvo-black-5 mt-1.5">
                <table className="w-full bg-arvo-white-0">
                    <thead className="text-sm font-semibold">
                        <tr>
                            <th className="text-left py-3 px-4 ">Material</th>
                            <th className="text-center py-3 px-4 ">Used</th>
                            <th className="text-center py-3 px-4 ">
                                Inventory
                            </th>
                            <th className="text-right py-3 px-4 ">Cost</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {materials?.map((item, index) => (
                            <tr key={index}>
                                <td className="text-left py-2.5 px-4">
                                    {item.materialName}
                                </td>
                                <td className="text-center py-2.5 px-4">
                                    {item.usedAmount} {item.unitAbbreviation}
                                </td>
                                <td className="text-center py-2.5 px-4">
                                    {item.inventoryQuantity}{" "}
                                    {item.unitAbbreviation}
                                    {item.errorCondition && (
                                        <span className="text-red-500">*</span>
                                    )}
                                </td>
                                <td className="text-right py-2.5 px-4">
                                    ${item.cost.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className=" border-t-2 border-arvo-black-5">
                        <tr>
                            <td
                                colSpan={3}
                                className="text-left py-3 px-4 font-bold"
                            >
                                Total Cost
                            </td>
                            <td className="text-right py-3 px-4 font-bold">
                                {totalCost}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default MaterialCostTable;

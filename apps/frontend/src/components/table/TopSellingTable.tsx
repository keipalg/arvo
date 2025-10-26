import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../utils/trpcClient";
import Badge from "../badge/Badge";

type TopSellingTableProps = {
    data: inferRouterOutputs<AppRouter>["dashboard"]["topSellingProducts"][number][];
};

const TopSellingTable = ({ data }: TopSellingTableProps) => {
    return (
        <div className="flex w-full">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left font-normal text-arvo-black-25 px-4 py-3">
                            Photo
                        </th>
                        <th className="text-left font-normal text-arvo-black-25 px-4 py-3">
                            Name
                        </th>
                        <th className="text-left font-normal text-arvo-black-25 px-4 py-3">
                            Popularity
                        </th>
                        <th className="text-left font-normal text-arvo-black-25 px-4 py-3">
                            Items Sold
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((product) => (
                        <tr
                            key={product.goodId}
                            className="border-b border-gray-200"
                        >
                            <td className="px-4 py-3">
                                {product.goodImage && (
                                    <img src={product.goodImage}></img>
                                )}
                            </td>
                            <td className="px-4 py-3">{product.goodName}</td>
                            <td className="px-4 py-3">
                                <div className="bg-arvo-black-5 w-full h-1.5 rounded-full">
                                    <div
                                        className="bg-arvo-blue-100 h-1.5 rounded-full"
                                        style={{
                                            width: `${product.popularityPercentage * 100}%`,
                                        }}
                                    ></div>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <Badge
                                    text={String(product.goodsSold)}
                                    className="w-16 text-gray-800 bg-gray-200"
                                ></Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TopSellingTable;

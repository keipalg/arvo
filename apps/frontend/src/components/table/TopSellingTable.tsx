import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../utils/trpcClient";
import Badge from "../badge/Badge";
import ProductImage from "../image/ProductImage";

type TopSellingTableProps = {
    data: inferRouterOutputs<AppRouter>["dashboard"]["topSellingProducts"][number][];
    showPopularity?: boolean;
};

const TopSellingTable = ({
    data,
    showPopularity = true,
}: TopSellingTableProps) => {
    return (
        <div className="flex w-full">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left text-sm font-normal text-arvo-black-25 px-2 py-3">
                            Photo
                        </th>
                        <th className="text-left text-sm font-normal text-arvo-black-25 px-2 py-3">
                            Name
                        </th>
                        {showPopularity && (
                            <th className="text-left text-sm font-normal text-arvo-black-25 px-2 py-3">
                                Popularity
                            </th>
                        )}
                        <th className="text-left text-sm font-normal text-arvo-black-25 px-2 py-3">
                            Items Sold
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((product, index) => (
                        <tr
                            key={product.goodId}
                            className="border-b border-gray-200"
                        >
                            <td className="px-2 py-3">
                                <div className="h-14 flex justify-center">
                                    {product.goodImage && (
                                        <ProductImage
                                            imgSrc={product.goodImage}
                                        />
                                    )}
                                </div>
                            </td>
                            <td className="px-2 py-3">{product.goodName}</td>
                            {showPopularity && (
                                <td className="px-2 py-3">
                                    <div
                                        className={`w-full h-1.5 rounded-full 
                                        ${
                                            index === 0
                                                ? "bg-arvo-blue-50"
                                                : index === 1
                                                  ? "bg-arvo-orange-50"
                                                  : index === 2
                                                    ? "bg-arvo-yellow-50"
                                                    : "bg-gray-200"
                                        }`}
                                    >
                                        <div
                                            className={`h-1.5 rounded-full 
                                                ${
                                                    index === 0
                                                        ? "bg-arvo-blue-100"
                                                        : index === 1
                                                          ? "bg-arvo-orange-100"
                                                          : index === 2
                                                            ? "bg-arvo-yellow-100"
                                                            : "bg-gray-100"
                                                }`}
                                            style={{
                                                width: `${product.popularityPercentage * 100}%`,
                                            }}
                                        ></div>
                                    </div>
                                </td>
                            )}
                            <td className="px-2 py-3">
                                <Badge
                                    text={String(product.goodsSold)}
                                    className={`w-16 ${
                                        index === 0
                                            ? "bg-arvo-blue-50 text-arvo-blue-100"
                                            : index === 1
                                              ? "bg-arvo-orange-50 text-arvo-orange-100"
                                              : index === 2
                                                ? "bg-arvo-yellow-50 text-arvo-yellow-100"
                                                : ""
                                    }`}
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

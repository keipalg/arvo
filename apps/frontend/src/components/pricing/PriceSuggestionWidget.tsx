import React, { useEffect, useState } from "react";
import { usePriceSuggestion } from "../../utils/usePriceSuggestion";
import Button from "../button/Button";

interface PriceSuggestion {
    suggestedPrice: number;
    priceRange: { min: number; max: number };
    reasoning: string;
    marketInsights: string;
}

interface Props {
    productType?: string;
    materialCost: number;
    laborCost: number;
    overheadCost: number;
    operationalCost: number;
    profitMarginPreference: number;
    onSuggestionReceived?: (price: number) => void;
    canSuggest: boolean;
    shouldReset?: boolean;
}

export const PriceSuggestionWidget: React.FC<Props> = ({
    productType = "",
    materialCost,
    laborCost,
    overheadCost,
    operationalCost,
    profitMarginPreference,
    onSuggestionReceived,
    canSuggest,
    shouldReset,
}) => {
    const [suggestion, setSuggestion] = useState<PriceSuggestion | null>(null);
    const { getSuggestion, isLoading, error } = usePriceSuggestion();

    const handleGetSuggestion = async () => {
        if (!productType || materialCost <= 0) return;

        const result = await getSuggestion({
            productType,
            materialCost,
            laborCost,
            overheadCost,
            operationalCost,
            profitMarginPreference,
        });

        if (result) {
            setSuggestion(result);
            onSuggestionReceived?.(result.suggestedPrice);
        }
    };

    useEffect(() => {
        if (shouldReset) {
            setSuggestion(null);
        }
    }, [shouldReset]);

    return (
        <div className="bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">AI Price Suggestion</span>
                <Button
                    onClick={() => {
                        handleGetSuggestion().catch(console.error);
                    }}
                    value={isLoading ? "Analyzing..." : "Get Suggestion"}
                    disabled={!canSuggest}
                />
            </div>

            {suggestion && (
                <div className="text-sm space-y-1">
                    <div className="font-semibold text-green-700">
                        Suggested: ${suggestion.suggestedPrice.toFixed(2)}
                    </div>
                    <div className="text-gray-600">
                        Range: ${suggestion.priceRange.min.toFixed(2)} - $
                        {suggestion.priceRange.max.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                        {suggestion.reasoning}
                    </div>
                </div>
            )}

            {error && (
                <div className="text-xs text-red-600">
                    Failed to get suggestion. Try again.
                </div>
            )}
        </div>
    );
};

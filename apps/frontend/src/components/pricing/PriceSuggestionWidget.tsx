import React, { useEffect, useState } from "react";
import { usePriceSuggestion } from "../../utils/usePriceSuggestion";
import WhiteRoundButton from "../button/WhiteRoundButton.tsx";

interface PriceSuggestion {
    suggestedPrice: number;
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
        <div className="flex grow flex-3 gap-y-1.5 flex-wrap items-center gap-2 sm:flex-2">
            <div className="flex items-center gap-2 ">
                <WhiteRoundButton
                    onClick={() => {
                        handleGetSuggestion().catch(console.error);
                    }}
                    value={
                        isLoading ? "Analyzing..." : "Get AI Suggested Price"
                    }
                    disabled={!canSuggest}
                    icon={
                        !canSuggest
                            ? "../../../public/icon/ai-black.svg"
                            : "../../../public/icon/ai-blue.svg"
                    }
                />
            </div>

            {suggestion && (
                <div className=" text-arvo-black-100">
                    Suggested Price:{" "}
                    <span className="font-semibold">
                        {" "}
                        ${suggestion.suggestedPrice.toFixed(2)}
                    </span>
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

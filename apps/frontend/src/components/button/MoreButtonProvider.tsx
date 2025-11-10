import { useState } from "react";
import { MoreButtonContext } from "./MoreButtonContext";

export const MoreButtonProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [openButtonId, setOpenButtonId] = useState<string | null>(null);
    return (
        <MoreButtonContext.Provider value={{ openButtonId, setOpenButtonId }}>
            {children}
        </MoreButtonContext.Provider>
    );
};

import { createContext } from "react";

export const MoreButtonContext = createContext<{
    openButtonId: string | null;
    setOpenButtonId: (id: string | null) => void;
}>({
    openButtonId: null,
    setOpenButtonId: () => {},
});

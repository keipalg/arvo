import { useContext } from "react";
import { MoreButtonContext } from "./MoreButtonContext";

export const useMoreButton = () => useContext(MoreButtonContext);

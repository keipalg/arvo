import { getUnitList } from "../service/unitsService.js";
import { protectedProcedure, router } from "./trpcBase.js";

export const unitsRouter = router({
    list: protectedProcedure.query(async () => {
        return await getUnitList();
    }),
});

import { router, publicProcedure } from "./trpcBase.js";
import { getSalesList } from "../service/salesService.js";

export const salesRouter = router({
    list: publicProcedure.query(async () => {
        return await getSalesList();
    }),
});

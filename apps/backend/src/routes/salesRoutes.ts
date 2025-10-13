import { router, protectedProcedure } from "./trpcBase.js";
import { getSalesList } from "../service/salesService.js";

export const salesRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getSalesList(ctx.user.id);
    }),
});

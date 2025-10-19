import { router, protectedProcedure } from "./trpcBase.js";
import { getGoodsList } from "../service/goodsService.js";

export const goodsRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getGoodsList(ctx.user.id);
    }),
});

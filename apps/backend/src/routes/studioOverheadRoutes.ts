import { getStudioOverheadExpenseList } from "../service/studioOverheadExpenseService.js";
import { protectedProcedure, router } from "./trpcBase.js";

export const studioOverheadExpenseRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getStudioOverheadExpenseList(ctx.user.id);
    }),
});

import { getOperationalExpenseList } from "../service/operationalExpenseService.js";
import { protectedProcedure, router } from "./trpcBase.js";

export const operationalExpenseRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getOperationalExpenseList(ctx.user.id);
    }),
});

import { getMaterialsList } from "../service/materialsService.js";
import { protectedProcedure, router } from "./trpcBase.js";

export const materialsRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await getMaterialsList(ctx.user.id);
    }),
});

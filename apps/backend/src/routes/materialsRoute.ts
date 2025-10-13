import { getMaterialsList } from "../service/materialsService.js";
import { publicProcedure, router } from "./trpcBase.js";

export const materialsRouter = router({
    list: publicProcedure.query(async () => {
        return await getMaterialsList();
    }),
});

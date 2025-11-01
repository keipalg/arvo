import z from "zod";
import { getUserInfo, updateUserInfo } from "../service/userService.js";
import { protectedProcedure, router } from "./trpcBase.js";

export const userRouter = router({
    info: protectedProcedure.query(async ({ ctx }) => {
        return await getUserInfo(ctx.user.id);
    }),

    update: protectedProcedure
        .input(
            z.object({
                name: z.string().optional(),
                email: z.string().optional(),
                phone: z.string().optional(),
                storeName: z.string().optional(),
                storeLocation: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            return await updateUserInfo(ctx.user.id, input);
        }),
});

import { z } from "zod";

export const dashboardTimezoneValidation = z.object({
    timezone: z.string().refine((tz) => {
        try {
            Intl.DateTimeFormat(undefined, { timeZone: tz });
            return true;
        } catch (e) {
            return false;
        }
    }),
});

export type DashboardTimezoneInput = z.infer<
    typeof dashboardTimezoneValidation
>;

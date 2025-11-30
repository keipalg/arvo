import { toZonedTime, fromZonedTime } from "date-fns-tz";

export function getMonthRangeInTimezone(tz: string, offset: number = 0) {
    const now = toZonedTime(new Date(), tz);

    const year = now.getFullYear();
    const month = now.getMonth() + offset;

    const startLocal = new Date(year, month, 1, 0, 0, 0, 0);
    const endLocal = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const startUtc = fromZonedTime(startLocal, tz);
    const endUtc = fromZonedTime(endLocal, tz);

    return { start: startUtc, end: endUtc };
}

export function getPastWeekRangeInTimezone(tz: string, offset: number = 0) {
    const now = toZonedTime(new Date(), tz);
    const endLocal = now;
    endLocal.setDate(endLocal.getDate() - 7 * offset);
    const startLocal = new Date(now.getTime());
    startLocal.setDate(startLocal.getDate() - 7 * (offset + 1));

    const startUtc = fromZonedTime(startLocal, tz);
    const endUtc = fromZonedTime(endLocal, tz);

    return { start: startUtc, end: endUtc };
}

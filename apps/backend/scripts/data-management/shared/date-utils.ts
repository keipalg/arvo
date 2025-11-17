/**
 * Check if a date falls within a specific month
 * Example: isInMonth(new Date('2025-06-15'), '2025-06') → true
 */
export function isInMonth(date: Date | null, month: string): boolean {
    if (!date) return false;

    const [year, monthNum] = month.split("-").map(Number);
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth() + 1; // JavaScript months are 0-indexed

    return dateYear === year && dateMonth === monthNum;
}

/**
 * Validate month format (YYYY-MM)
 */
export function isValidMonthFormat(month: string): boolean {
    const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
    return regex.test(month);
}

/**
 * Get start and end dates for a given month
 */
export function getMonthRange(month: string): {
    start: Date;
    end: Date;
} {
    const [year, monthNum] = month.split("-").map(Number);
    const start = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999);

    return { start, end };
}

/**
 * Shift a date from source month to target month, preserving day and time
 * Example: shiftDate(new Date('2025-11-15 10:30'), '2025-11', '2025-06')
 *          Returns: new Date('2025-06-15 10:30')
 */
export function shiftDate(
    originalDate: Date,
    sourceMonth: string,
    targetMonth: string,
): Date {
    const [sourceYear, sourceMonthNum] = sourceMonth.split("-").map(Number);
    const [targetYear, targetMonthNum] = targetMonth.split("-").map(Number);

    const day = originalDate.getDate();
    const hours = originalDate.getHours();
    const minutes = originalDate.getMinutes();
    const seconds = originalDate.getSeconds();
    const milliseconds = originalDate.getMilliseconds();

    // Create new date in target month
    const shiftedDate = new Date(
        targetYear,
        targetMonthNum - 1,
        day,
        hours,
        minutes,
        seconds,
        milliseconds,
    );

    return shiftedDate;
}

/**
 * Calculate offset between two dates in days
 */
export function getDateOffset(date1: Date, date2: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = date2.getTime() - date1.getTime();
    return Math.round(diff / msPerDay);
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Conditionally shift a date only if it's in the source month
 * If the date is not in source month, return it unchanged
 */
export function shiftDateIfInMonth(
    originalDate: Date | null,
    sourceMonth: string,
    targetMonth: string,
): Date | null {
    if (!originalDate) return null;

    if (isInMonth(originalDate, sourceMonth)) {
        return shiftDate(originalDate, sourceMonth, targetMonth);
    }

    return originalDate; // Keep unchanged if not in source month
}

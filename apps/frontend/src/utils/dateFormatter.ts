export const DateFormats = {
    // Date only formats
    MMM_DD_YYYY: "MMM. DD, YYYY", // Oct. 28, 2025
    MM_DD_YYYY: "MM/DD/YYYY", // 10/28/2025

    // Date and time formats
    MMM_DD_YYYY_hh_mm_A: "MMM. DD, YYYY hh:mm A", // Oct. 28, 2025 11:25 AM
    MM_DD_YYYY_hh_mm_A: "MM/DD/YYYY hh:mm A", // 10/28/2025 11:25 AM

    // Internal format for inputs
    YYYY_MM_DD: "YYYY-MM-DD", // 2025-10-28 (for inputs)
} as const;

export type DateFormatType = (typeof DateFormats)[keyof typeof DateFormats];

/**
 * Converts a string or Date object to a Date object
 * @param date date to convert (string or Date object)
 * @returns date object
 */
function parseDate(date: string | Date): Date {
    const parsedDate = typeof date === "string" ? new Date(date) : date;

    if (isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid date: ${String(date)}`);
    }

    return parsedDate;
}

/**
 * Formats a date to a human-readable string
 * @param date date to format (string or Date object)
 * @param format desired format (defaults to MMM. DD, YYYY)
 * @returns formatted date string
 *
 * @example
 * getFormattedDate(new Date()) // "Oct. 28, 2025"
 * getFormattedDate("2025-10-28") // "Oct. 28, 2025"
 * getFormattedDate("2025-10-28T11:25:00") // "Oct. 28, 2025" (time is ignored)
 * getFormattedDate("2025-10-28", DateFormats.MM_DD_YYYY) // "10/28/2025"
 */
export function getFormattedDate(
    date: string | Date,
    format: DateFormatType = DateFormats.MMM_DD_YYYY,
): string {
    try {
        const parsedDate = parseDate(date);

        switch (format) {
            case DateFormats.MMM_DD_YYYY:
                // Oct. 28, 2025
                const month = parsedDate.toLocaleDateString("en-US", {
                    month: "short",
                });
                const day = parsedDate.getDate();
                const year = parsedDate.getFullYear();
                return `${month}. ${day}, ${year}`;

            case DateFormats.MM_DD_YYYY:
                // 10/28/2025
                return parsedDate.toLocaleDateString("en-US");

            case DateFormats.YYYY_MM_DD:
                // 2025-10-28
                return parsedDate.toISOString().split("T")[0];

            default:
                return parsedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });
        }
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid Date";
    }
}

/**
 * Formats a date and time to a human-readable string
 * @param date date to format (string or Date object)
 * @param format desired format (defaults to MMM. DD, YYYY hh:mm A)
 * @returns formatted date and time string
 *
 * @example
 * getFormattedDateTime(new Date()) // "Oct. 28, 2025 11:25 AM"
 * getFormattedDateTime("2025-10-28T11:25:00") // "Oct. 28, 2025 11:25 AM"
 * getFormattedDateTime("2025-10-28T11:25:00", DateFormats.MM_DD_YYYY_hh_mm_A) // "10/28/2025 11:25 AM"
 */
export function getFormattedDateTime(
    date: string | Date,
    format: DateFormatType = DateFormats.MMM_DD_YYYY_hh_mm_A,
): string {
    try {
        const parsedDate = parseDate(date);

        switch (format) {
            case DateFormats.MMM_DD_YYYY_hh_mm_A:
                const month = parsedDate.toLocaleDateString("en-US", {
                    month: "short",
                });
                const day = parsedDate.getDate();
                const year = parsedDate.getFullYear();
                const time = parsedDate.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                });
                return `${month}. ${day}, ${year} ${time}`;

            case DateFormats.MM_DD_YYYY_hh_mm_A:
                return parsedDate.toLocaleString("en-US", {
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                });

            default:
                return parsedDate.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                });
        }
    } catch (error) {
        console.error("Error formatting date and time:", error);
        return "Invalid Date";
    }
}

/**
 * Formats a date for HTML input elements (type="date")
 * @param date date to format (string or Date object)
 * @returns date string in YYYY-MM-DD format
 *
 * @example
 * getDateForInputField(new Date()) // "2025-10-28"
 * getDateForInputField("2025-10-28T11:25:00") // "2025-10-28"
 */
export function getDateForInputField(date: string | Date): string {
    return getFormattedDate(date, DateFormats.YYYY_MM_DD);
}

import { useEffect, useState } from "react";
import defaultTheme from "tailwindcss/defaultTheme";

export const breakpoints: Record<string, number> = Object.entries(
    defaultTheme.screens,
).reduce(
    (acc, [key, raw]) => {
        const s = String(raw).trim();
        let px = 0;
        if (s.endsWith("px")) {
            px = parseInt(s, 10);
        } else if (s.endsWith("rem")) {
            px = Math.round(parseFloat(s.replace("rem", "")) * 16);
        } else {
            const n = parseInt(s.replace(/[^\d.]/g, ""), 10);
            px = isNaN(n) ? 0 : n;
        }
        acc[key] = px;
        return acc;
    },
    {} as Record<string, number>,
);

export const useCurrentScreenWidth = () => {
    const [screenWidth, setScreenWidth] = useState<number>(() =>
        typeof window !== "undefined" ? window.innerWidth : 0,
    );

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        handleResize();

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return screenWidth;
};

export const useIsSmUp = (breakpointKey = "sm") => {
    const width = useCurrentScreenWidth();
    const bp = breakpoints[breakpointKey] ?? 640;
    return width >= bp;
};

export default useCurrentScreenWidth;

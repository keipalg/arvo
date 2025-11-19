import { useEffect, type DependencyList } from "react";

/**
 * For development / demo use only.
 * Key combination: Cmd+Shift+0 (or Ctrl+Shift+0)
 * Only available in NODE_ENV=development
 *
 * @param onAutofill callback function to execute when shortcut is pressed
 * @param deps dependencies for the callback (based on useEffect)
 */
export function useDevAutofill(
    onAutofill: () => void,
    deps: DependencyList = [],
) {
    useEffect(() => {
        if (import.meta.env.MODE !== "development") {
            return;
        }

        const handleKeyPress = (event: KeyboardEvent) => {
            const isCorrectCombo =
                event.shiftKey &&
                event.key === "0" &&
                (event.ctrlKey || event.metaKey);

            if (isCorrectCombo) {
                event.preventDefault(); // Prevent any default behavior
                console.log("[DEV] Autofilling form with demo data...");
                onAutofill();
            }
        };

        window.addEventListener("keydown", handleKeyPress);

        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [onAutofill, ...deps]);
}

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: `${import.meta.env.VITE_BASE_URL || "http://localhost:8080"}/api/auth`,
});

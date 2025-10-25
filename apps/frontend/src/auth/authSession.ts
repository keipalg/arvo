import { authClient } from "./auth-client";
import { useQuery } from "@tanstack/react-query";

export const fetchAuthSession = async () => {
    const res = await authClient.getSession();
    return res.data;
};

export const useAuthSession = () => {
    return useQuery({
        queryKey: ["auth", "session"],
        queryFn: fetchAuthSession,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });
};

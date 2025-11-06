import {
    useQuery,
    useMutation,
    type UseQueryOptions,
    type UseMutationOptions,
} from "@tanstack/react-query";
import { queryClient } from "../utils/trpcClient";

interface TypeItem {
    id: string;
    name: string;
    isUsed?: boolean;
}

interface TypeManagerConfig {
    listQueryKey: string[];
    listQuery: { queryOptions: () => UseQueryOptions };
    addMutation: {
        mutationOptions: (options: UseMutationOptions) => UseMutationOptions;
    };
    deleteMutation: {
        mutationOptions: (options: UseMutationOptions) => UseMutationOptions;
    };
}

export const useTypeManager = (config: TypeManagerConfig) => {
    const { data: items = [] } = useQuery(config.listQuery.queryOptions());

    const addMutation = useMutation(
        config.addMutation.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: config.listQueryKey,
                });
            },
        }),
    );

    const deleteMutation = useMutation(
        config.deleteMutation.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: config.listQueryKey,
                });
            },
        }),
    );

    return {
        items: items as TypeItem[],
        addItem: addMutation.mutateAsync,
        deleteItem: deleteMutation.mutate,
        isAdding: addMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};

export type { TypeItem };

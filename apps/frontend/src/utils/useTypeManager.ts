/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../utils/trpcClient";

interface TypeItem {
    id: string;
    name: string;
    isUsed?: boolean;
}

interface TypeManagerConfig {
    listQueryKey: any;
    listQuery: any;
    addMutation: any;
    deleteMutation: any;
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

    const addItemWrapper = async (data: { name: string }) => {
        const result = await (addMutation.mutateAsync as any)(data);
        return result as { id: string };
    };

    const deleteItemWrapper = (data: { id: string }) => {
        (deleteMutation.mutate as any)(data);
    };

    return {
        items: items as TypeItem[],
        addItem: addItemWrapper,
        deleteItem: deleteItemWrapper,
        isAdding: addMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};

export type { TypeItem };

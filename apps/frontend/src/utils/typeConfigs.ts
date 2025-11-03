import { trpc } from "../utils/trpcClient";

export const productTypeConfig = {
    listQueryKey: trpc.productTypes.list.queryKey(),
    listQuery: trpc.productTypes.list,
    addMutation: trpc.productTypes.add,
    deleteMutation: trpc.productTypes.delete,
};

export const materialTypeConfig = {
    listQueryKey: trpc.materialTypes.list.queryKey(),
    listQuery: trpc.materialTypes.list,
    addMutation: trpc.materialTypes.add,
    deleteMutation: trpc.materialTypes.delete,
};

import { toast } from "sonner"
import { InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from "@/lib/hono"

type ResponseType = InferResponseType<typeof client.api.transactions[":id"]["$delete"]>;

export const useDeleteTransaction = (id?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error
    >({
        mutationFn: async (json) => {
            const response = await client.api.transactions[":id"]["$delete"]({ param: { id }, })
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Transaction deleted");
            queryClient.invalidateQueries({ queryKey: ["transaction", { id }] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });

        },
        onError: (error) => {
            toast.error("Failed to delete transaction");
        },
    });
    return mutation;
}


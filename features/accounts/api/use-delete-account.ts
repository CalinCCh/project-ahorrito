import { toast } from "sonner"
import { InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from "@/lib/hono"

type ResponseType = InferResponseType<typeof client.api.accounts[":id"]["$delete"]>;

export const useDeleteAccount = (id?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        void,
        { previousAccounts?: any }
    >({
        mutationFn: async () => {
            const response = await client.api.accounts[":id"]["$delete"]({ param: { id }, })
            return await response.json();
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["accounts"] });

            const previousAccounts = queryClient.getQueryData(["accounts"]);

            return { previousAccounts };
        },
        onSuccess: (data, variables, context) => {
            toast.success("Account deleted");

            queryClient.invalidateQueries({ queryKey: ["account", { id }] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });

            return id;
        },
        onError: (error, variables, context) => {
            toast.error("Failed to delete account");

            if (context?.previousAccounts) {
                queryClient.setQueryData(["accounts"], context.previousAccounts);
            }
        },
    });
    return mutation;
}


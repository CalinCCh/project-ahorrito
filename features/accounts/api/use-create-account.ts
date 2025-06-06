import { toast } from "sonner"
import { InferRequestType, InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from "@/lib/hono"

type ResponseType = InferResponseType<typeof client.api.accounts.$post>;
type RequestType = InferRequestType<typeof client.api.accounts.$post>["json"];

export const useCreateAccount = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (json) => {
            console.log('[CREATE ACCOUNT] Payload enviado:', json);
            const response = await client.api.accounts.$post({ json })
            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.error('[CREATE ACCOUNT] Error parseando respuesta:', e);
                throw e;
            }
            console.log('[CREATE ACCOUNT] Respuesta:', data, 'Status:', response.status);
            if (!response.ok) {
                throw new Error('error' in data ? data.error : 'Unknown error');
            }
            return data;
        },
        onSuccess: (data) => {
            toast.success("Account created successfully!");

            // Invalidar todas las consultas que podrían verse afectadas por la creación de la cuenta
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });

            // Opcional: Actualizar el caché directamente para mostrar la nueva cuenta de inmediato
            try {
                const previousAccounts = queryClient.getQueryData<any[]>(["accounts"]) || [];
                if (Array.isArray(previousAccounts) && 'data' in data) {
                    queryClient.setQueryData(["accounts"], [...previousAccounts, data.data]);
                }
            } catch (e) {
                console.error('Error actualizando el caché:', e);
            }

            // Disparar un evento personalizado para que otros componentes puedan reaccionar
            window.dispatchEvent(new CustomEvent("account-created", {
                detail: { accountId: 'data' in data ? data.data?.id : undefined }
            }));
        },
        onError: (error) => {
            console.error('[CREATE ACCOUNT] Error:', error);
            toast.error(`Failed to create account: ${error.message || 'Unknown error'}`);
        },
    });
    return mutation;
}


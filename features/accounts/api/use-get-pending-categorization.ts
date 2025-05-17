import { useQuery } from '@tanstack/react-query';
import { client } from "@/lib/hono";

export const useGetPendingCategorization = () => {
    return useQuery({
        queryKey: ['accounts', 'pending-categorization'],
        queryFn: async () => {
            const response = await client.api.accounts["pending-categorization"].$get();
            if (!response.ok) throw new Error('Failed to fetch pending categorization');
            const json = await response.json();
            // Devuelve un mapa { [accountId]: boolean }
            const map: Record<string, boolean> = {};
            (json.pending || []).forEach((item: { accountId: string, pendingCount: number }) => {
                map[item.accountId] = item.pendingCount > 0;
            });
            return map;
        }
    });
}; 
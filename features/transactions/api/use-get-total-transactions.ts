import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

interface ResponseShape {
    total: number;
}

export const useGetTotalTransactions = () => {
    return useQuery({
        queryKey: ['transactions', 'total'],
        queryFn: async (): Promise<number> => {
            const response = await client.api.transactions['count'].$get();
            if (!response.ok) {
                throw new Error('Failed to fetch total transactions');
            }
            const json: ResponseShape = await response.json();
            return json.total ?? 0;
        },
    });
}; 
import { useQuery } from '@tanstack/react-query';
import { client } from "@/lib/hono"

export const useGetAccounts = () => {
    const query = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            const response = await client.api.accounts.$get()

            if (!response.ok) {
                throw new Error('Failed to fetch accounts');
            }

            const json = await response.json()
            return json.accounts || []
        }
    })

    return query
}
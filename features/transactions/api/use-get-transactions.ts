import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation'
import { format, subDays } from 'date-fns';

import { client } from "@/lib/hono"
import { convertAmountFromMiliunits } from '@/lib/utils';

export const useGetTransactions = () => {
    const params = useSearchParams()
    const from = params.get('from')
    const to = params.get('to')
    const accountId = params.get('accountId') || ""

    // Calcular fechas por defecto para mostrar los últimos 30 días
    // Solo se aplican cuando no hay parámetros de fecha en la URL
    const today = new Date();
    const defaultFromDate = format(subDays(today, 30), 'yyyy-MM-dd');

    // Si no hay fechas en la URL, usamos los valores por defecto
    const fromValue = from || defaultFromDate;
    const toValue = to || format(today, 'yyyy-MM-dd');

    const query = useQuery({
        queryKey: ['transactions', { from: fromValue, to: toValue, accountId }],
        queryFn: async () => {
            const response = await client.api.transactions.$get({
                query: {
                    from: fromValue,
                    to: toValue,
                    accountId
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }

            const { data } = await response.json()
            return data
        }
    })

    return query
}
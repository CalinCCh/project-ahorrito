import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation'

import { client } from "@/lib/hono"
import { convertAmountFromMiliunits } from '@/lib/utils';

export const useGetSummary = () => {
    const params = useSearchParams()
    const from = params.get('from') || ""
    const to = params.get('to') || ""
    const accountId = params.get('accountId') || ""


    const query = useQuery({
        queryKey: ['summary', { from, to, accountId }],
        queryFn: async () => {
            const response = await client.api.summary.$get({
                query: {
                    from,
                    to,
                    accountId
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch summary');
            } const { data } = await response.json()

            if (!data) {
                return null;
            }

            return {
                ...data,
                incomeAmount: convertAmountFromMiliunits(data.incomeAmount || 0),
                expensesAmount: convertAmountFromMiliunits(data.expensesAmount || 0),
                remainingAmount: convertAmountFromMiliunits(data.remainingAmount || 0),
                categories: (data.categories || []).map((category: any) => ({
                    ...category,
                    value: convertAmountFromMiliunits(category.value || 0),
                })),
                days: (data.days || []).map((day: any) => ({
                    ...day,
                    income: convertAmountFromMiliunits(day.income || 0),
                    expenses: convertAmountFromMiliunits(day.expenses || 0),
                })),
            }
        }
    })

    return query
}
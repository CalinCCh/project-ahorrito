import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export interface AccountDetails {
    account: {
        id: string;
        name: string;
        plaidId: string | null;
    };
    bank: {
        institutionName: string | null;
        status: string | null;
        logoUrl?: string | null;
    };
    balance: {
        current: number;
        available: number;
        currency: string;
    } | null;
    balancesHistory: Array<{ timestamp: string; current: number }>; // Para sparkline y cambio %
    transactionsCount: number;
    lastTransaction: {
        id: string;
        amount: number;
        payee: string;
        date: string;
    } | null;
    lastSynced: string | null;
    accountNumberDisplay?: string | null;
}

export function useAccountDetails(accountId?: string) {
    return useQuery<AccountDetails | null>({
        enabled: !!accountId,
        queryKey: ['account-details', { accountId }],
        queryFn: async () => {
            if (!accountId) return null;
            const response = await client.api.accounts[":id"].details.$get({ param: { id: accountId } });
            if (!response.ok) throw new Error('Failed to fetch account details');
            const { data } = await response.json();
            return data;
        },
    });
} 
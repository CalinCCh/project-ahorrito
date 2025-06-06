import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Account {
    id: string;
    name: string;
    type: 'checking' | 'savings' | 'credit' | 'investment';
    balance: number;
    currency: string;
    bankName?: string;
    accountNumber?: string;
    isConnected: boolean;
    lastSynced?: string;
}

interface AccountsState {
    accounts: Account[];
    isLoading: boolean;
    error: string | null;
    selectedAccountId: string | null;
}

const initialState: AccountsState = {
    accounts: [],
    isLoading: false,
    error: null,
    selectedAccountId: null,
};

const accountsSlice = createSlice({
    name: 'accounts',
    initialState,
    reducers: {
        fetchAccountsStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        fetchAccountsSuccess: (state, action: PayloadAction<Account[]>) => {
            state.isLoading = false;
            state.accounts = action.payload;
            state.error = null;
        },
        fetchAccountsFailure: (state, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        addAccount: (state, action: PayloadAction<Account>) => {
            state.accounts.push(action.payload);
        },
        updateAccount: (state, action: PayloadAction<Account>) => {
            const index = state.accounts.findIndex(a => a.id === action.payload.id);
            if (index !== -1) {
                state.accounts[index] = action.payload;
            }
        },
        deleteAccount: (state, action: PayloadAction<string>) => {
            state.accounts = state.accounts.filter(a => a.id !== action.payload);
            if (state.selectedAccountId === action.payload) {
                state.selectedAccountId = null;
            }
        },
        setSelectedAccount: (state, action: PayloadAction<string | null>) => {
            state.selectedAccountId = action.payload;
        },
        updateAccountBalance: (state, action: PayloadAction<{ id: string; balance: number }>) => {
            const account = state.accounts.find(a => a.id === action.payload.id);
            if (account) {
                account.balance = action.payload.balance;
            }
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    fetchAccountsStart,
    fetchAccountsSuccess,
    fetchAccountsFailure,
    addAccount,
    updateAccount,
    deleteAccount,
    setSelectedAccount,
    updateAccountBalance,
    clearError,
} = accountsSlice.actions;

export default accountsSlice.reducer;
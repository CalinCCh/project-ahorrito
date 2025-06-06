import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import transactionsSlice from './slices/transactionsSlice';
import accountsSlice from './slices/accountsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    transactions: transactionsSlice,
    accounts: accountsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
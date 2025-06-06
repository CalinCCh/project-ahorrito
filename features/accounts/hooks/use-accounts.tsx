import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useUnifiedSync } from "@/features/sync/hooks/use-unified-sync";

interface Account {
  id: string;
  name: string;
  plaidId: string; // TrueLayer account ID (kept as plaidId for DB compatibility)
}

interface Balance {
  current: number;
  available: number;
  currency: string;
}

interface AccountData {
  account: Account;
  balance: Balance | null;
  transactions: number;
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Use the unified sync hook
  const {
    isSyncing: refreshing,
    syncingAccountId: refreshingAccountId,
    syncStatus,
    syncSingleAccount,
    isAccountSyncing,
  } = useUnifiedSync();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (refreshing) {
        e.preventDefault();
        e.returnValue =
          "Changes you made may not be saved if you leave the page during synchronization.";
        return e.returnValue;
      }
    };

    if (refreshing) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [refreshing]);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/accounts");
      if (response.data.success) {
        setAccounts(response.data.accounts);
        if (response.data.lastSynced)
          setLastSynced(new Date(response.data.lastSynced));
      } else setError("Failed to load accounts");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Unknown error occurred";
        setError(`Could not load your accounts: ${errorMessage}`);
      } else {
        setError("Could not load your accounts. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshAccount = async (accountId: string) => {
    setError(null);
    try {
      const account = accounts.find((a) => a.account.id === accountId);
      if (account?.account.plaidId) {
        await syncSingleAccount({
          id: account.account.id,
          plaidId: account.account.plaidId, 
        });
        await loadAccounts();
      } else {
        throw new Error("Account not found or missing bank connection");
      }
    } catch (error) {
      let errorMsg = "Connection error";

      if (axios.isAxiosError(error)) {
        errorMsg =
          error.response?.data?.error || error.message || "Network error";
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }

      setError(`Could not connect to your bank: ${errorMsg}`);
    }
  };

  const filteredAccounts = accounts.filter((accountData) =>
    accountData.account.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAccountRefreshing = (accountId: string) =>
    isAccountSyncing(accountId);

  const setSearch = (query: string) => setSearchQuery(query);

  return {
    accounts,
    filteredAccounts,
    loading,
    refreshing,
    refreshingAccountId,
    lastSynced,
    syncStatus,
    error,
    searchQuery,
    refreshAccount,
    isAccountRefreshing,
    setSearch,
    loadAccounts,
  };
}

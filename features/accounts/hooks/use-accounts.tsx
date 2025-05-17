import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";

interface Account {
  id: string;
  name: string;
  plaidId: string;
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

interface SyncProgress {
  current: number;
  total: number;
}

function TransactionProgressToast({
  syncProgress,
  syncTotal,
  categorizingProgress,
  categorizingTotal,
  showCategorizing = true,
  onClose,
  isSuccess = false,
  successMessage = "",
  transactionsCount = 0,
}: {
  syncProgress: number;
  syncTotal: number;
  categorizingProgress: number;
  categorizingTotal: number;
  showCategorizing?: boolean;
  onClose?: () => void;
  isSuccess?: boolean;
  successMessage?: string;
  transactionsCount?: number;
}) {
  return (
    <div className="w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-5 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
      {isSuccess ? (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-800/30 p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {successMessage}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {transactionsCount} transactions processed
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Close notification"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                Synchronization in Progress
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-full h-6 w-6 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close notification"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Syncing Data
              </div>
              <div className="text-xs font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                {syncProgress} / {syncTotal}
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${
                    syncTotal
                      ? Math.min(
                          100,
                          Math.round((syncProgress / syncTotal) * 100)
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {showCategorizing && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Categorizing Transactions
                </div>
                <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {categorizingProgress} / {categorizingTotal}
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${
                      categorizingTotal
                        ? Math.min(
                            100,
                            Math.round(
                              (categorizingProgress / categorizingTotal) * 100
                            )
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingAccountId, setRefreshingAccountId] = useState<string | null>(
    null
  );
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categorizing, setCategorizing] = useState(false);
  const [categorizationProgress, setCategorizationProgress] = useState(0);
  const [categorizationTotal, setCategorizationTotal] = useState(0);
  const categorizingToastId = useRef<string | number | undefined>(undefined);

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
    if (
      (categorizing || refreshing) &&
      categorizingToastId.current !== undefined
    ) {
      toast.custom(
        (t) => (
          <TransactionProgressToast
            syncProgress={syncProgress?.current || 0}
            syncTotal={syncProgress?.total || 0}
            categorizingProgress={categorizationProgress}
            categorizingTotal={categorizationTotal}
            showCategorizing={categorizing}
            onClose={() => {
              toast.dismiss(t);
              categorizingToastId.current = undefined;
            }}
          />
        ),
        { id: categorizingToastId.current, duration: 60000 }
      );
    }
  }, [
    categorizing,
    refreshing,
    categorizationProgress,
    categorizationTotal,
    syncProgress,
  ]);

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
    } catch {
      setError("Could not load your accounts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getBankConnectionId = async (): Promise<string | null> => {
    try {
      const response = await axios.get("/api/accounts");
      return response.data?.connectionId || null;
    } catch {
      return null;
    }
  };

  const refreshAccount = async (accountId: string) => {
    setError(null);
    setRefreshingAccountId(accountId);
    setRefreshing(true);
    setSyncStatus("Requesting real-time data and transactions...");
    const account = accounts.find((acc) => acc.account.plaidId === accountId);
    const transactionCount = account?.transactions || 10;
    if (account) {
      setSyncProgress({ current: 0, total: transactionCount });
    }
    setSyncStatus("Requesting transaction data...");
    let loadingId: string | number | undefined;
    try {
      const connectionId = await getBankConnectionId();
      const syncParams = {
        connection_id: connectionId ?? undefined,
        force: true,
        balanceOnly: false,
        account_id: accountId,
      };
      setCategorizing(true);
      setCategorizationProgress(0);
      setCategorizationTotal(transactionCount);

      categorizingToastId.current = toast.custom(
        (t) => (
          <TransactionProgressToast
            syncProgress={0}
            syncTotal={transactionCount}
            categorizingProgress={0}
            categorizingTotal={transactionCount}
            showCategorizing={true}
            onClose={() => {
              toast.dismiss(t);
              categorizingToastId.current = undefined;
            }}
          />
        ),
        { duration: 60000 }
      );

      setTimeout(() => {
        for (let i = 1; i <= transactionCount; i++) {
          setTimeout(() => {
            setSyncProgress({ current: i, total: transactionCount });
          }, i * 10);
        }
        for (let i = 1; i <= transactionCount; i++) {
          setTimeout(() => {
            setCategorizationProgress(i);
          }, i * 20);
        }
      }, 500);
      const response = await axios.post("/api/truelayer/sync", syncParams);
      setCategorizing(false);
      toast.dismiss(categorizingToastId.current);
      if (response.data.success) {
        const updatedAccounts = [...accounts];
        response.data.accounts.forEach((updatedAccount: AccountData) => {
          const index = updatedAccounts.findIndex(
            (acc) => acc.account.id === updatedAccount.account.id
          );
          if (index !== -1) {
            updatedAccounts[index] = updatedAccount;
          } else {
            updatedAccounts.push(updatedAccount);
          }
        });
        setAccounts(updatedAccounts);
        setLastSynced(new Date(response.data.lastSynced));
        setSyncProgress(null);
        setSyncStatus(null);
        setRefreshing(false);
        setRefreshingAccountId(null);

        const successMessage = response.data.warning
          ? "Account synchronized with warnings"
          : "Account synchronized successfully";

        setTimeout(() => {
          const successToastId = toast.custom(
            (t) => (
              <TransactionProgressToast
                syncProgress={transactionCount}
                syncTotal={transactionCount}
                categorizingProgress={transactionCount}
                categorizingTotal={transactionCount}
                showCategorizing={false}
                isSuccess={true}
                successMessage={successMessage}
                transactionsCount={transactionCount}
                onClose={() => {
                  toast.dismiss(t);
                }}
              />
            ),
            {
              duration: 8000,
              position: "top-center",
            }
          );
          console.log("Success toast shown with ID:", successToastId);
        }, 300);
      } else {
        setSyncStatus("Error updating data");
        setSyncProgress(null);
        setRefreshing(false);
        setRefreshingAccountId(null);
        const errorMsg = response.data.error || "Failed to sync with bank";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      setSyncStatus("Error connecting to bank");
      setSyncProgress(null);
      setRefreshing(false);
      setRefreshingAccountId(null);
      toast.dismiss(loadingId);
      const errorMsg =
        error.response?.data?.error || error.message || "Connection error";
      setError(`Could not connect to your bank: ${errorMsg}`);
      toast.error(`Sync failed: ${errorMsg}`);
    } finally {
      setRefreshing(false);
      setRefreshingAccountId(null);
      setSyncProgress(null);
      setSyncStatus(null);
      toast.dismiss(loadingId);
    }
  };

  const filteredAccounts = accounts.filter((accountData) =>
    accountData.account.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAccountRefreshing = (accountId: string) =>
    refreshing || refreshingAccountId === accountId;

  const setSearch = (query: string) => setSearchQuery(query);

  return {
    accounts,
    filteredAccounts,
    loading,
    refreshing,
    refreshingAccountId,
    syncProgress,
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

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { useSyncProgressToast } from "@/components/feedback/SyncProgressToast";

interface SyncState {
  isSyncing: boolean;
  syncingAccountId: string | null;
  syncStatus: string | null;
  syncProgress?: {
    current: number;
    total: number;
  } | null;
}

interface Account {
  id: string;
  plaidId?: string;
}

export function useUnifiedSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    syncingAccountId: null,
    syncStatus: null,
    syncProgress: null,
  });
  const queryClient = useQueryClient();
  const { showSyncProgress, updateSyncProgress, dismissSyncProgress } =
    useSyncProgressToast();
  const syncSingleAccount = async (account: Account) => {
    if (!account?.plaidId) {
      console.error("Account missing plaidId:", account);
      toast.error("Cannot sync account: Missing bank connection");
      return;
    }

    // Check if already syncing
    if (syncState.isSyncing) {
      toast.error("Sync already in progress");
      return;
    }

    console.log(
      "Starting sync for account:",
      account.id,
      "plaidId:",
      account.plaidId
    );

    // Get account name and REAL transaction count
    let accountName = "Account";
    let currentTransactionCount = 0;

    try {
      const accountsResponse = await axios.get("/api/accounts");
      if (accountsResponse.data.success) {
        const foundAccount = accountsResponse.data.accounts.find(
          (acc: any) => acc.account.id === account.id
        );
        accountName = foundAccount?.account?.name || accountName;
        // Use the real transaction count from the account data
        currentTransactionCount = foundAccount?.transactionsCount || 0;
      }
    } catch (error) {
      console.log("Could not fetch account details, using defaults");
      // Fallback: try to get transaction count directly
      try {
        const transactionsResponse = await axios.get(`/api/transactions/count`);
        if (transactionsResponse.data?.total) {
          currentTransactionCount = transactionsResponse.data.total;
        }
      } catch (countError) {
        console.log("Could not fetch transaction count either");
      }
    }
    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Use the real current transaction count as the base
      // Add a reasonable buffer for potential new transactions (20-50 new ones typical)
      const estimatedNewTransactions = Math.max(
        20,
        Math.ceil(currentTransactionCount * 0.2)
      );
      const expectedTotal = Math.max(
        currentTransactionCount + estimatedNewTransactions,
        50
      );

      console.log("Sync Progress Setup:", {
        currentTransactionCount,
        estimatedNewTransactions,
        expectedTotal,
        accountName,
      });

      // Initialize sync state
      setSyncState({
        isSyncing: true,
        syncingAccountId: account.id,
        syncStatus: "Connecting to bank...",
        syncProgress: { current: 0, total: expectedTotal },
      });

      // Show initial progress toast with realistic numbers
      showSyncProgress(account.id, {
        current: 0,
        total: expectedTotal,
        status: "Connecting to bank...",
        accountName,
      });

      // Connection phase
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSyncState((prev) => ({
        ...prev,
        syncStatus: "Fetching account data...",
        syncProgress: {
          current: Math.floor(expectedTotal * 0.15),
          total: expectedTotal,
        },
      }));

      updateSyncProgress(account.id, {
        current: Math.floor(expectedTotal * 0.15),
        total: expectedTotal,
        status: "Fetching account data...",
        accountName,
      });

      // Data fetching simulation
      await new Promise((resolve) => setTimeout(resolve, 600));

      setSyncState((prev) => ({
        ...prev,
        syncStatus: "Syncing transactions...",
        syncProgress: {
          current: Math.floor(expectedTotal * 0.35),
          total: expectedTotal,
        },
      }));

      updateSyncProgress(account.id, {
        current: Math.floor(expectedTotal * 0.35),
        total: expectedTotal,
        status: "Syncing transactions...",
        accountName,
      });

      // More realistic progress during sync - slower increments
      progressInterval = setInterval(() => {
        setSyncState((prev) => {
          if (
            prev.syncProgress &&
            prev.syncProgress.current < Math.floor(expectedTotal * 0.85)
          ) {
            const increment = Math.ceil(expectedTotal * 0.03); // Smaller increments (3%)
            const newCurrent = Math.min(
              prev.syncProgress.current + increment,
              Math.floor(expectedTotal * 0.85)
            );

            // Update the toast with the new progress
            updateSyncProgress(account.id, {
              current: newCurrent,
              total: expectedTotal,
              status: "Syncing transactions...",
              accountName,
            });

            return {
              ...prev,
              syncProgress: { current: newCurrent, total: expectedTotal },
            };
          }
          return prev;
        });
      }, 1500); // Slightly longer intervals

      // Call the TrueLayer sync API
      const response = await axios.post("/api/truelayer/sync", {
        account_id: account.plaidId,
        force: true,
        balanceOnly: false,
      });

      // Clear the progress interval
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      const { success, accounts: accountResults, error } = response.data;

      if (!success) {
        throw new Error(error || "Sync failed");
      } // Get actual transaction count from response
      const accountResult = accountResults?.find(
        (acc: any) => acc.account?.plaidId === account.plaidId
      );
      const actualTransactionCount = accountResult?.transactions || 0;

      // Update with actual count - use the real number from API response
      const finalTotal = Math.max(actualTransactionCount, expectedTotal);

      setSyncState((prev) => ({
        ...prev,
        syncStatus: "Processing transactions...",
        syncProgress: {
          current: Math.floor(finalTotal * 0.9),
          total: finalTotal,
        },
      }));

      updateSyncProgress(account.id, {
        current: Math.floor(finalTotal * 0.9),
        total: finalTotal,
        status: "Processing transactions...",
        accountName,
      });

      // Final processing simulation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Complete the sync
      setSyncState((prev) => ({
        ...prev,
        syncStatus: "Sync completed successfully",
        syncProgress: { current: finalTotal, total: finalTotal },
      }));

      updateSyncProgress(account.id, {
        current: finalTotal,
        total: finalTotal,
        status: `Successfully synced ${actualTransactionCount} transactions`,
        accountName,
        isComplete: true,
      });

      // Invalidate relevant queries to refresh the UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["accounts"] }),
        queryClient.invalidateQueries({ queryKey: ["account", account.id] }),
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
      ]);

      console.log("Sync completed successfully:", response.data);
    } catch (error) {
      console.error("Sync error:", error);

      // Clear interval if it exists
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Failed to sync transactions";

      // Use the same expectedTotal from the try block for error state
      const expectedTotal = Math.max(
        currentTransactionCount + Math.ceil(currentTransactionCount * 0.1),
        10
      );

      setSyncState((prev) => ({
        ...prev,
        syncStatus: errorMessage,
        syncProgress: { current: 0, total: expectedTotal },
      }));

      updateSyncProgress(account.id, {
        current: 0,
        total: expectedTotal,
        status: errorMessage,
        accountName,
        hasError: true,
      });
    } finally {
      // Reset sync state after toast auto-dismisses
      setTimeout(() => {
        setSyncState({
          isSyncing: false,
          syncingAccountId: null,
          syncStatus: null,
          syncProgress: null,
        });
      }, 4500); // Slightly longer than toast duration to ensure cleanup
    }
  };

  // Legacy methods for backward compatibility
  const syncAccount = async (plaidId: string): Promise<void> => {
    // Find account by plaidId - this is a simplified version
    const account = { id: plaidId, plaidId };
    await syncSingleAccount(account);
  };

  const isAccountSyncing = (accountId: string): boolean => {
    return syncState.isSyncing && syncState.syncingAccountId === accountId;
  };

  const invalidateAllQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
    queryClient.invalidateQueries({ queryKey: ["summary"] });
  };
  return {
    // State
    isSyncing: syncState.isSyncing,
    syncingAccountId: syncState.syncingAccountId,
    syncStatus: syncState.syncStatus,
    syncProgress: syncState.syncProgress,

    // Actions
    syncSingleAccount,
    syncAccount, // Legacy method
    isAccountSyncing,

    // Utils
    invalidateAllQueries,
  };
}

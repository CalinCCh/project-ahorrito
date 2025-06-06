"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Check, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SyncProgressData {
  current: number;
  total: number;
  status: string;
  accountName?: string;
  isComplete?: boolean;
  hasError?: boolean;
}

interface SyncProgressToastProps {
  data: SyncProgressData;
  toastId: string | number;
}

const SyncProgressToast: React.FC<SyncProgressToastProps> = ({
  data,
  toastId,
}) => {
  const { current, total, status, accountName, isComplete, hasError } = data;
  const [progress, setProgress] = useState(0);

  const handleClose = () => {
    toast.dismiss(toastId);
  };

  // Smooth progress animation
  useEffect(() => {
    const targetProgress =
      total > 0 ? Math.min(100, (current / total) * 100) : 0;
    const timer = setTimeout(() => {
      setProgress(targetProgress);
    }, 100);

    return () => clearTimeout(timer);
  }, [current, total]);
  const getStatusIcon = () => {
    if (hasError) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    if (isComplete) {
      return <Check className="h-5 w-5 text-green-500 success-bounce" />;
    }
    return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
  };
  const getProgressBarClass = () => {
    if (hasError) return "progress-bar-error";
    if (isComplete) return "progress-bar-success";
    return "progress-bar-modern";
  };
  const formatProgressText = () => {
    if (hasError) {
      return "Failed";
    }
    if (isComplete) {
      return "Done";
    }

    // Show percentage for progress
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    return `${percentage}%`;
  };

  const getTechnicalStatusMessage = () => {
    if (hasError) {
      return "Connection error - retry required";
    }
    if (isComplete) {
      return "Data validation complete";
    }

    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    if (percentage === 0) {
      return "Initializing API connection...";
    } else if (percentage < 20) {
      return "Authenticating with bank servers...";
    } else if (percentage < 40) {
      return "Fetching transaction data...";
    } else if (percentage < 60) {
      return "Processing financial records...";
    } else if (percentage < 80) {
      return "Categorizing transactions...";
    } else if (percentage < 95) {
      return "Validating data integrity...";
    } else {
      return "Finalizing synchronization...";
    }
  };

  return (
    <div
      className={cn(
        "relative toast-glass rounded-xl shadow-2xl p-6 min-w-[420px] max-w-[480px]",
        "border-2 transition-all duration-300 hover:shadow-xl bounce-in",
        hasError
          ? "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20"
          : isComplete
          ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20"
          : "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20"
      )}
    >
      {" "}
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div
            className={cn(
              "p-2.5 rounded-full",
              hasError
                ? "bg-red-100 dark:bg-red-900/30"
                : isComplete
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-blue-100 dark:bg-blue-900/30"
            )}
          >
            {getStatusIcon()}
          </div>{" "}
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {isComplete
                ? "Sync Complete"
                : hasError
                ? "Sync Error"
                : "Syncing Transactions"}
            </h4>
            {accountName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {accountName}
              </p>
            )}
          </div>
        </div>{" "}
        {/* Enhanced Progress Display - Subtle and elegant */}
        <div className="text-right">
          <div
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold text-xl",
              "border transition-all duration-300",
              hasError
                ? "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                : isComplete
                ? "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                : "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
            )}
          >
            {formatProgressText()}
          </div>
        </div>{" "}
      </div>{" "}
      {/* Technical Status Message - Dynamic technical information */}
      <div className="mb-3">
        <p
          className={cn(
            "text-sm font-medium",
            hasError
              ? "text-red-700 dark:text-red-300"
              : isComplete
              ? "text-green-700 dark:text-green-300"
              : "text-blue-700 dark:text-blue-300"
          )}
        >
          {getTechnicalStatusMessage()}
        </p>
      </div>
      {/* Transaction Count - Only show on completion */}
      {isComplete && current > 0 && (
        <div className="mb-3">
          <p className="text-sm text-green-600 dark:text-green-400">
            {current} transactions synced successfully
          </p>
        </div>
      )}
      {/* Progress Bar - Clean design without redundant labels */}
      <div>
        <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              getProgressBarClass()
            )}
            style={{
              width: `${progress}%`,
            }}
          />

          {/* Shimmer overlay for active progress */}
          {!isComplete && !hasError && progress > 0 && (
            <div
              className="absolute inset-0 progress-shimmer rounded-full"
              style={{ width: `${progress}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Hook to manage sync progress toasts
export const useSyncProgressToast = () => {
  const [activeToasts, setActiveToasts] = useState<
    Map<string, { id: string | number; data: SyncProgressData }>
  >(new Map());

  const showSyncProgress = (
    accountId: string,
    initialData: SyncProgressData
  ): string | number => {
    // Dismiss any existing toast for this account first
    const existingToast = activeToasts.get(accountId);
    if (existingToast) {
      toast.dismiss(existingToast.id);
    }

    const toastId = toast.custom(
      (t) => <SyncProgressToast data={initialData} toastId={t} />,
      {
        duration: Infinity,
        position: "top-center",
        id: `sync-${accountId}`, // Use consistent ID
      }
    );

    setActiveToasts((prev) =>
      new Map(prev).set(accountId, {
        id: toastId,
        data: initialData,
      })
    );
    return toastId;
  };

  const updateSyncProgress = (accountId: string, data: SyncProgressData) => {
    const existingToast = activeToasts.get(accountId);
    if (existingToast) {
      // Update the stored data
      setActiveToasts((prev) =>
        new Map(prev).set(accountId, {
          id: existingToast.id,
          data: data,
        })
      ); // Update the toast content
      toast.custom((t) => <SyncProgressToast data={data} toastId={t} />, {
        id: existingToast.id,
        duration: data.isComplete || data.hasError ? 2000 : Infinity,
        position: "top-center",
      });

      // Auto-dismiss and clean up after completion
      if (data.isComplete || data.hasError) {
        setTimeout(() => {
          dismissSyncProgress(accountId);
        }, 2000);
      }
    } else {
      // If no existing toast, create a new one
      showSyncProgress(accountId, data);
    }
  };

  const dismissSyncProgress = (accountId: string) => {
    const existingToast = activeToasts.get(accountId);
    if (existingToast) {
      toast.dismiss(existingToast.id);
      setActiveToasts((prev) => {
        const newMap = new Map(prev);
        newMap.delete(accountId);
        return newMap;
      });
    }
  };

  const dismissAllSyncProgress = () => {
    activeToasts.forEach((toastData) => toast.dismiss(toastData.id));
    setActiveToasts(new Map());
  };

  const getToastData = (accountId: string): SyncProgressData | null => {
    return activeToasts.get(accountId)?.data || null;
  };

  return {
    showSyncProgress,
    updateSyncProgress,
    dismissSyncProgress,
    dismissAllSyncProgress,
    getToastData,
    activeToasts: Array.from(activeToasts.keys()),
  };
};

export default SyncProgressToast;

import {
  Banknote,
  BanknoteX,
  Loader2,
  MoreHorizontal,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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

interface AccountCardProps {
  accountData: AccountData;
  refreshAccount: (accountId: string) => Promise<void>;
  isAccountRefreshing: (accountId: string) => boolean;
  refreshingAccountId: string | null;
  syncProgress: SyncProgress | null;
  syncStatus: string | null;
  lastSynced: Date | null;
  showLastSynced: boolean;
  openAccount: {
    onOpen: (accountId: string) => void;
  };
  isCategorizing?: boolean;
}

function formatAccountCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
  }).format(amount);
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLastSynced(date: Date | null) {
  if (!date) return "Never";
  const today = new Date();
  if (isSameDay(date, today)) return `Today at ${formatTime(date)}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) return `Yesterday at ${formatTime(date)}`;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AccountCard({
  accountData,
  refreshAccount,
  isAccountRefreshing,
  refreshingAccountId,
  syncProgress,
  syncStatus,
  lastSynced,
  showLastSynced,
  openAccount,
  isCategorizing = false,
}: AccountCardProps) {
  const renderBalance = () => {
    if (!accountData.account.plaidId) {
      return (
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight text-center w-full">
          {accountData.balance
            ? formatAccountCurrency(
                accountData.balance.available || accountData.balance.current,
                accountData.balance.currency
              )
            : "Balance not available"}
        </div>
      );
    }

    const isLoading = refreshingAccountId === accountData.account.plaidId;
    const balanceValue = accountData.balance
      ? formatAccountCurrency(
          accountData.balance.available || accountData.balance.current,
          accountData.balance.currency
        )
      : "Balance not available";
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center w-full">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2 opacity-30 flex items-center">
            <Loader2 className="h-7 w-7 text-blue-500 animate-spin mr-2" />
            {balanceValue}
          </div>
        </div>
      );
    }
    return (
      <div className="text-3xl font-extrabold text-slate-900 tracking-tight text-center w-full">
        {balanceValue}
      </div>
    );
  };

  return (
    <Card
      className="overflow-hidden border border-slate-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all hover:scale-[1.025] duration-200 relative p-1"
      style={{
        boxShadow: "0 2px 8px 0 rgba(59,130,246,0.06)",
      }}
    >
      <div className="absolute top-0 right-0 w-1/2 h-1/3 bg-gradient-to-br from-white/40 to-transparent rounded-tl-[100px] rounded-br-[100px] -z-0 opacity-50"></div>
      <div
        className="absolute inset-0 rounded-2xl z-0"
        style={{
          background: "white",
          border: "2px solid transparent",
          borderRadius: "1rem",
          backgroundClip: "padding-box",
          padding: "2px",
        }}
      ></div>
      <div
        className="absolute inset-0 rounded-2xl z-0"
        style={{
          background: `
            conic-gradient(
              from 215deg at 50% 50%,
              rgba(37, 99, 235, 0.65) 0deg,
              rgba(59, 130, 246, 0.45) 90deg,
              rgba(14, 165, 233, 0.6) 180deg,
              rgba(37, 99, 235, 0.7) 270deg,
              rgba(59, 130, 246, 0.5) 360deg
            )
          `,
          borderRadius: "1rem",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          padding: "2px",
          pointerEvents: "none",
        }}
      ></div>
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-blue-500 transition-all rounded-full h-8 w-8"
              aria-label="Account options"
            >
              {refreshingAccountId === accountData.account.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              ) : (
                <MoreHorizontal className="w-4 h-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => openAccount.onOpen(accountData.account.id)}
              disabled={isAccountRefreshing(accountData.account.id)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {accountData.account.plaidId && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => refreshAccount(accountData.account.plaidId!)}
                  disabled={isAccountRefreshing(accountData.account.id)}
                >
                  {refreshingAccountId === accountData.account.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col justify-between h-full p-4 pt-5 pb-4 relative z-10 text-center">
        <div className="space-y-1 mb-2">
          <CardTitle className="text-2xl font-bold text-slate-800 tracking-tight text-center">
            {accountData.account.name}
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-slate-600 mt-0.5 justify-center text-center">
            {accountData.account.plaidId && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Banknote className="w-3.5 h-3.5 text-green-500 mr-1" />
                  </TooltipTrigger>
                  <TooltipContent>Bank account linked</TooltipContent>
                </Tooltip>
                <span className="font-semibold">Bank linked</span>
              </>
            )}
            {!accountData.account.plaidId && (
              <div className="h-[1.125rem]"></div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center items-center pt-2 pb-3 min-h-[80px]">
          {renderBalance()}
        </div>

        <div className="text-xs text-slate-600 space-y-0.5 pt-3 text-center relative">
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[90%] h-[2px] opacity-80"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(59, 130, 246, 0.35) 50%, rgba(255,255,255,0) 100%)",
              boxShadow: "0 1px 2px rgba(59, 130, 246, 0.15)",
            }}
          ></div>
          <div className="flex items-center justify-center text-center mt-1">
            <span className="font-medium">{accountData.transactions}</span>
            &nbsp;transactions
          </div>
          {showLastSynced && accountData.account.plaidId ? (
            <div className="font-medium">
              Last synced: {formatLastSynced(lastSynced)}
              {accountData.account.plaidId && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 inline-flex items-center text-blue-500 cursor-help align-middle">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3 relative top-[-1px]"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                      </svg>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px] text-xs">
                    Recent transactions may take up to 48 hours to appear
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          ) : (
            <div className="h-[1rem] opacity-0 select-none">
              Espacio uniforme
            </div>
          )}
        </div>
        {isCategorizing && (
          <div className="flex items-center justify-center mt-2 text-xs text-blue-500 gap-2 animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin" />
            Categorizando transacciones automáticamente...
          </div>
        )}
      </div>
    </Card>
  );
}

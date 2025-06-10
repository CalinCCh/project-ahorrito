"use client"; // Ensure it's a client component

import React, { memo, useCallback, useMemo, useEffect, useState } from "react";
import {
  Banknote,
  BanknoteX,
  Loader2,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  CheckCircle,
  Triangle,
  Landmark,
  ClipboardList,
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
import {
  useAccountDetails,
  AccountDetails,
} from "@/features/accounts/hooks/use-account-details";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Area,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import CountUp from "react-countup";
import { useIsMobile } from "@/hooks/use-mobile";

interface AccountCardProps {
  accountId: string;
  openAccount: { onOpen: (accountId: string) => void };
  refreshAccount: (accountId: string) => Promise<void>;
  isAccountRefreshing: (accountId: string) => boolean;
  refreshingAccountId: string | null;
  isCategorizing?: boolean;
  large?: boolean;
  className?: string;
  isActive?: boolean;
  isNewlyConnected?: boolean;
}

// Function to format the number for display (en-US, no currency symbol)
function formatCurrencyForDisplay(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Modified to use appropriate locale for currency positioning
function formatCurrency(amount: number, currency: string) {
  const currencyCode = currency || "EUR";

  // Use appropriate locale based on currency
  let locale = "en-US";
  if (currencyCode === "EUR") {
    locale = "es-ES"; // Spanish locale places EUR symbol after the value
  } else if (currencyCode === "GBP") {
    locale = "en-GB"; // British locale for GBP
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getPercentChange(history: { current: number }[]) {
  if (history.length < 2) return null;
  const first = history[0].current;
  const last = history[history.length - 1].current;
  if (first === 0) return null;
  return ((last - first) / Math.abs(first)) * 100;
}

const Sparkline = memo(function Sparkline({
  data,
}: {
  data: { current: number }[];
}) {
  if (!data || data.length < 2) return null;

  return (
    <div className="w-full flex justify-center my-2">
      <ResponsiveContainer width={120} height={32}>
        <LineChart
          data={data}
          margin={{ top: 6, right: 0, left: 0, bottom: 0 }}
        >
          <RechartsTooltip
            content={({ active, payload }) =>
              active && payload && payload.length ? (
                <div className="bg-white rounded px-2 py-1 text-xs shadow-sm">
                  {payload[0].value}
                </div>
              ) : null
            }
            cursor={false}
          />
          <Line
            type="monotone"
            dataKey="current"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export const AccountCard = memo(function AccountCard({
  accountId,
  openAccount,
  refreshAccount,
  isAccountRefreshing,
  refreshingAccountId,
  isCategorizing = false,
  large = false,
  className = "",
  isActive = true,
  isNewlyConnected = false,
}: AccountCardProps) {
  const { data: accountData, isLoading } = useAccountDetails(accountId);
  const data = accountData as AccountDetails;
  const isMobile = useIsMobile();
  const [showNewBadge, setShowNewBadge] = useState(isNewlyConnected);

  // Highlight new accounts for longer (30 seconds)
  useEffect(() => {
    if (isNewlyConnected) {
      console.log("Showing new badge for account:", accountId);
      const timer = setTimeout(() => {
        setShowNewBadge(false);
      }, 30000); // 30 seconds
      return () => clearTimeout(timer);
    }
  }, [isNewlyConnected, accountId]);

  const percentChange = useMemo(
    () =>
      data?.balancesHistory ? getPercentChange(data.balancesHistory) : null,
    [data?.balancesHistory]
  );

  const isLinked = useMemo(
    () => Boolean(data?.account?.plaidId),
    [data?.account?.plaidId]
  );

  const handleRefresh = useCallback(async () => {
    if (!data?.account?.id) return;
    await refreshAccount(data.account.id);
  }, [refreshAccount, data?.account?.id]);

  const handleOpenAccount = useCallback(() => {
    if (!data?.account?.id) return;
    openAccount.onOpen(data.account.id);
  }, [openAccount, data?.account?.id]);

  if (isLoading || !data) {
    return (
      <Card
        className={`flex items-center justify-center ${
          isMobile ? "h-[160px]" : "h-[400px] md:h-[500px]"
        } bg-white shadow-xl rounded-2xl`}
      >
        <Loader2 className="animate-spin w-8 h-8 text-blue-400" />
      </Card>
    );
  }

  // Mobile-specific responsive classes
  const balanceNumberClasses = isMobile
    ? "text-2xl font-bold text-slate-800 tracking-tight"
    : large
    ? "text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 tracking-tight"
    : "text-2xl font-bold text-slate-800 tracking-tight";

  const euroSymbolClasses = isMobile
    ? "text-sm text-slate-500 font-normal ml-1"
    : large
    ? "text-xl md:text-2xl lg:text-3xl text-slate-500 font-normal ml-2"
    : "text-sm text-slate-500 font-normal ml-1";

  const cardPadding = isMobile
    ? "px-3 py-3"
    : large
    ? "px-20 md:px-6 py-6 md:py-8"
    : "px-16 py-5";

  const cardHeight = isMobile
    ? "h-auto min-h-[160px]"
    : large
    ? "h-[520px] md:h-[600px]"
    : "h-auto";

  return (
    <Card
      className={[
        "relative bg-white flex flex-col transition-all duration-300 ease-out account-card-organic account-card-organic-glow",
        cardPadding,
        cardHeight,
        "rounded-xl shadow-lg",
        className,
        isAccountRefreshing(accountId) ? "opacity-50 pointer-events-none" : "",
        isNewlyConnected
          ? "ring-4 ring-blue-500 ring-offset-4 shadow-xl shadow-blue-200"
          : "",
      ]
        .join(" ")
        .trim()}
      style={{
        minHeight: isMobile ? "160px" : large ? "600px" : "auto",
        width: "100%",
        minWidth: isMobile ? "auto" : large ? "450px" : "auto",
      }}
    >
      {showNewBadge && (
        <div className="absolute top-0 right-0 -mt-3 -mr-3 z-20">
          <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
            Nueva cuenta
          </div>
        </div>
      )}

      {/* Add a "Connected" banner for newly connected accounts */}
      {isNewlyConnected && (
        <div className="absolute top-0 left-0 w-full bg-blue-500 text-white text-center py-1 rounded-t-xl z-10">
          Conectada correctamente
        </div>
      )}

      <div className="relative z-10 w-full h-full flex flex-col flex-grow min-h-0 justify-between">
        {/* Header: account name and categorization badge - compact for mobile */}
        <div
          className={`flex flex-col items-center gap-2 ${
            isMobile ? "pt-2 pb-2 min-h-[50px]" : "pt-3 pb-4 min-h-[90px]"
          }`}
        >
          <div className="flex items-center w-full justify-center relative">
            <CardTitle
              className={
                isMobile
                  ? "text-base font-semibold text-slate-800 text-center w-full truncate"
                  : large
                  ? "text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-800 text-center w-full"
                  : "text-lg font-semibold text-slate-800 my-2 text-center w-full"
              }
              title={data.account.name}
            >
              {data.account.name}
            </CardTitle>
          </div>
          {isCategorizing && !isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-orange-400 hover:text-orange-500 transition-all rounded-full h-8 w-8 cursor-default focus-visible:ring-2 focus-visible:ring-orange-400"
                  aria-label="Pending categorization"
                >
                  <BanknoteX className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This account has transactions pending categorization.</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Center: balance, perfectly centered - compact for mobile */}
        <div className="flex flex-col flex-grow min-h-0 justify-center items-center relative">
          <div
            className={`flex flex-col items-center justify-center gap-2 ${
              isMobile
                ? "py-2"
                : "gap-4 md:gap-6 lg:gap-8 py-6 md:py-10 lg:py-12"
            } w-full relative`}
          >
            <div className="flex justify-center w-full items-center">
              <div className="relative inline-block">
                <div className="flex items-baseline justify-center text-center">
                  {data.balance ? (
                    <>
                      <span className={balanceNumberClasses}>
                        <CountUp
                          start={0}
                          end={data.balance.current}
                          decimals={2}
                          preserveValue={true}
                        >
                          {/* @ts-expect-error TypeScript doesn't recognize 'value' in RenderCounterProps here, but it functionally exists and is needed */}
                          {({ countUpRef, value }) => (
                            <span ref={countUpRef}>
                              {value
                                ? formatCurrencyForDisplay(parseFloat(value))
                                : formatCurrencyForDisplay(0)}
                            </span>
                          )}
                        </CountUp>
                      </span>
                      <span className={euroSymbolClasses}>
                        {data.balance.currency
                          ? new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: data.balance.currency,
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })
                              .formatToParts(0)
                              .find((part) => part.type === "currency")
                              ?.value || data.balance.currency
                          : "x"}
                      </span>
                    </>
                  ) : (
                    <span className={balanceNumberClasses}>No balance</span>
                  )}
                </div>
                {percentChange !== null && percentChange !== 0 && !isMobile && (
                  <span className="absolute -top-3 -right-16 flex items-center gap-1 text-xs md:text-sm rounded-full px-1.5 py-0.5">
                    {percentChange > 0 ? (
                      <Triangle
                        className="w-2 h-2 md:w-3 md:h-3 text-green-500"
                        style={{ transform: "rotate(0deg)" }}
                        fill="currentColor"
                        strokeWidth={0}
                        aria-label="Balance increasing"
                      />
                    ) : (
                      <Triangle
                        className="w-2 h-2 md:w-3 md:h-3 text-red-500"
                        style={{ transform: "rotate(180deg)" }}
                        fill="currentColor"
                        strokeWidth={0}
                        aria-label="Balance decreasing"
                      />
                    )}
                    <span
                      className={
                        percentChange > 0
                          ? "text-green-600 font-normal"
                          : "text-red-600 font-normal"
                      }
                    >
                      {percentChange > 0 ? "+" : ""}
                      {percentChange.toFixed(1)}%
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer: actions and details - simplified for mobile */}
        <div
          className={`w-full rounded-b-3xl flex flex-col ${
            isMobile ? "gap-2 px-0 pt-2 pb-2" : "gap-3 md:gap-4 px-0 pt-4 pb-4"
          } mt-auto`}
        >
          {/* Actions - simplified for mobile */}
          <div
            className={`flex flex-row gap-2 w-full ${
              isMobile ? "px-3" : "px-6 md:px-8"
            }`}
          >
            <Button
              size={isMobile ? "sm" : large ? "default" : "sm"}
              variant="default"
              className={
                isMobile
                  ? "flex-1 rounded-md px-2 py-1.5 text-xs account-button-organic-primary text-white shadow-md hover:shadow-lg transition-all duration-200"
                  : large
                  ? "flex-1 rounded-lg px-6 py-3 text-sm md:text-base account-button-organic-primary text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                  : "flex-1 rounded-md px-3 py-1.5 text-xs account-button-organic-primary text-white shadow-md hover:shadow-lg transition-all duration-200"
              }
              onClick={() => openAccount.onOpen(data.account.id)}
              disabled={isAccountRefreshing(data.account.id) || !isActive}
            >
              <Pencil
                className={
                  isMobile
                    ? "w-3 h-3 mr-1"
                    : large
                    ? "w-4 h-4 md:w-5 md:h-5 mr-2"
                    : "w-3.5 h-3.5 mr-1.5"
                }
              />
              Edit
            </Button>
            {isLinked && (
              <Button
                size={isMobile ? "sm" : large ? "default" : "sm"}
                variant="default"
                className={
                  isMobile
                    ? "flex-1 rounded-md px-2 py-1.5 text-xs account-button-organic-secondary text-white shadow-md hover:shadow-lg transition-all duration-200"
                    : large
                    ? "flex-1 rounded-lg px-6 py-3 text-sm md:text-base account-button-organic-secondary text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                    : "flex-1 rounded-md px-3 py-1.5 text-xs account-button-organic-secondary text-white shadow-md hover:shadow-lg transition-all duration-200"
                }
                onClick={() => refreshAccount(data.account.id)}
                disabled={isAccountRefreshing(data.account.id) || !isActive}
              >
                {isAccountRefreshing(data.account.id) ? (
                  <Loader2
                    className={`${
                      isMobile
                        ? "w-3 h-3 mr-1"
                        : large
                        ? "w-4 h-4 md:w-5 md:h-5 mr-2"
                        : "w-3.5 h-3.5 mr-1.5"
                    } animate-spin`}
                  />
                ) : (
                  <RefreshCw
                    className={
                      isMobile
                        ? "w-3 h-3 mr-1"
                        : large
                        ? "w-4 h-4 md:w-5 md:h-5 mr-2"
                        : "w-3.5 h-3.5 mr-1.5"
                    }
                  />
                )}
                Refresh
              </Button>
            )}
          </div>

          {/* Details Section - only show most important info on mobile */}
          {!isMobile && (
            <div className="flex flex-col w-full px-6 md:px-8 gap-y-2">
              {isLinked && data.bank?.institutionName && (
                <div className="flex flex-row items-center justify-between w-full gap-2">
                  <span className="text-slate-500 font-normal flex items-center gap-1">
                    <Landmark
                      className={`${
                        large ? "w-3 h-3 md:w-4 md:h-4" : "w-3 h-3"
                      } text-slate-400 flex-shrink-0`}
                    />
                    Institution:
                  </span>
                  <span
                    className="text-slate-700 font-semibold truncate text-right"
                    title={data.bank.institutionName}
                  >
                    {data.bank.institutionName}
                  </span>
                </div>
              )}
              {data.accountNumberDisplay && (
                <div className="flex flex-row items-center justify-between w-full gap-2">
                  <span className="text-slate-500 font-normal">
                    Account No:
                  </span>
                  <span className="text-slate-800 font-semibold tracking-tighter font-mono truncate text-right">
                    {data.accountNumberDisplay}
                  </span>
                </div>
              )}
              <div className="flex flex-row items-center justify-between w-full gap-2">
                <span className="text-slate-500 font-normal flex items-center gap-1">
                  <ClipboardList
                    className={`${
                      large ? "w-3 h-3 md:w-4 md:h-4" : "w-3 h-3"
                    } text-slate-400 flex-shrink-0`}
                  />
                  Transactions:
                </span>
                <span className="text-slate-700 font-semibold text-right">
                  {typeof data.transactionsCount === "number"
                    ? data.transactionsCount === 0
                      ? "No transactions"
                      : data.transactionsCount
                    : "No transactions"}
                </span>
              </div>
              <div className="flex flex-row items-center justify-between w-full gap-2">
                <span className="text-slate-500 font-normal">
                  Last Transaction:
                </span>
                <span
                  className="text-slate-700 font-semibold truncate text-right"
                  title={data.lastTransaction?.payee || "No transactions"}
                >
                  {data.lastTransaction ? (
                    <>
                      {data.lastTransaction.amount < 0 ? "-" : "+"}
                      {formatCurrency(
                        Math.abs(data.lastTransaction.amount),
                        data.balance?.currency || "EUR"
                      )}
                      <span className="italic ml-1">
                        {data.lastTransaction.payee}
                      </span>
                    </>
                  ) : (
                    "No transactions"
                  )}
                </span>
              </div>
              {isLinked && data.lastSynced && (
                <div className="flex flex-row items-center justify-between w-full gap-2">
                  <span className="text-slate-500 font-normal">Last Sync:</span>
                  <span className="text-slate-700 font-semibold tracking-tighter truncate text-right">
                    {new Date(data.lastSynced).toLocaleString("en-US", {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mobile: Show only essential info */}
          {isMobile && (
            <div className="flex flex-col w-full px-3 gap-y-1">
              <div className="flex flex-row items-center justify-between w-full gap-2">
                <span className="text-slate-500 font-normal text-xs flex items-center gap-1">
                  <ClipboardList className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  Transactions:
                </span>
                <span className="text-slate-700 font-semibold text-right text-xs">
                  {typeof data.transactionsCount === "number"
                    ? data.transactionsCount === 0
                      ? "None"
                      : data.transactionsCount
                    : "None"}
                </span>
              </div>
              {isLinked && data.bank?.institutionName && (
                <div className="flex flex-row items-center justify-between w-full gap-2">
                  <span className="text-slate-500 font-normal text-xs flex items-center gap-1">
                    <Landmark className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    Bank:
                  </span>
                  <span
                    className="text-slate-700 font-semibold truncate text-right text-xs"
                    title={data.bank.institutionName}
                  >
                    {data.bank.institutionName}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});

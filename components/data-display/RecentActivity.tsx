"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Coffee,
  ShoppingBag,
  Car,
  Home,
  MoreHorizontal,
  TrendingUp,
  Wallet,
  CreditCard,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { formatCurrency, convertAmountFromMiliunits } from "@/lib/utils";
import { format } from "date-fns";
import type { InferResponseType } from "hono";
import { client } from "@/lib/hono";

type TransactionType = InferResponseType<
  typeof client.api.transactions.$get,
  200
>["data"][0];

interface RecentActivityProps {
  className?: string;
}

interface ActivityItem {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  time: string;
  icon: any;
  color: string;
  emoji?: string | null;
}

export const RecentActivity = ({ className }: RecentActivityProps) => {
  const { data: transactions = [], isLoading } = useGetTransactions();
  // Transform real transactions to the format needed for display
  // Take only the latest 6 transactions and limit to recent ones
  const recentTransactions: ActivityItem[] = transactions
    .slice(0, 6)
    .map((transaction: TransactionType) => {
      const isIncome = transaction.amount > 0;
      const amount = convertAmountFromMiliunits(transaction.amount); // Get category info with proper null checking
      const categoryName: string = transaction.category || "Uncategorized";
      const categoryEmoji = transaction.categoryEmoji || undefined;

      // Calculate relative time
      const transactionDate = new Date(transaction.date);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60)
      );
      const diffInDays = Math.floor(diffInHours / 24);
      let timeAgo: string;
      if (diffInHours < 1) {
        timeAgo = "Less than 1 hour ago";
      } else if (diffInHours < 24) {
        timeAgo = `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
      } else if (diffInDays === 1) {
        timeAgo = "1 day ago";
      } else if (diffInDays < 7) {
        timeAgo = `${diffInDays} days ago`;
      } else {
        timeAgo = format(transactionDate, "d MMM");
      }

      // Determine icon and color based on category and type
      let icon = Receipt; // Default icon
      let color = "slate";

      if (isIncome) {
        icon = TrendingUp;
        color = "emerald";
      } else {
        // Category-based icon selection - ensure categoryName is not null
        const lowerCategoryName = categoryName.toLowerCase();
        if (
          lowerCategoryName.includes("food") ||
          lowerCategoryName.includes("dining")
        ) {
          icon = Coffee;
          color = "amber";
        } else if (
          lowerCategoryName.includes("shopping") ||
          lowerCategoryName.includes("retail")
        ) {
          icon = ShoppingBag;
          color = "blue";
        } else if (
          lowerCategoryName.includes("transport") ||
          lowerCategoryName.includes("vehicle") ||
          lowerCategoryName.includes("car")
        ) {
          icon = Car;
          color = "purple";
        } else if (
          lowerCategoryName.includes("housing") ||
          lowerCategoryName.includes("utilities") ||
          lowerCategoryName.includes("home")
        ) {
          icon = Home;
          color = "rose";
        } else if (
          lowerCategoryName.includes("groceries") ||
          lowerCategoryName.includes("supermarket")
        ) {
          icon = ShoppingBag;
          color = "green";
        } else {
          icon = Wallet;
          color = "slate";
        }
      }

      return {
        id: transaction.id,
        type: isIncome ? ("income" as const) : ("expense" as const),
        category: categoryName,
        description: transaction.payee,
        amount: amount,
        time: timeAgo,
        icon: icon,
        color: color,
        emoji: categoryEmoji,
      };
    });

  // Fallback data when no transactions or loading
  const fallbackTransactions: ActivityItem[] = [
    {
      id: "fallback-1",
      type: "expense",
      category: "Food & Dining",
      description: "No recent transactions",
      amount: 0,
      time: "Connect a bank account",
      icon: Coffee,
      color: "slate",
    },
  ];

  const activitiesToShow: ActivityItem[] = isLoading
    ? Array(4)
        .fill(null)
        .map((_, i) => ({
          id: `loading-${i}`,
          type: "expense" as const,
          category: "Loading...",
          description: "Getting transactions...",
          amount: 0,
          time: "...",
          icon: Receipt,
          color: "slate",
        }))
    : recentTransactions.length > 0
    ? recentTransactions
    : fallbackTransactions;

  const getColorClasses = (color: string) => {
    switch (color) {
      case "amber":
        return {
          bg: "bg-amber-500",
          light: "bg-amber-50",
          text: "text-amber-600",
          border: "border-amber-200",
        };
      case "emerald":
        return {
          bg: "bg-emerald-500",
          light: "bg-emerald-50",
          text: "text-emerald-600",
          border: "border-emerald-200",
        };
      case "blue":
        return {
          bg: "bg-blue-500",
          light: "bg-blue-50",
          text: "text-blue-600",
          border: "border-blue-200",
        };
      case "purple":
        return {
          bg: "bg-purple-500",
          light: "bg-purple-50",
          text: "text-purple-600",
          border: "border-purple-200",
        };
      case "rose":
        return {
          bg: "bg-rose-500",
          light: "bg-rose-50",
          text: "text-rose-600",
          border: "border-rose-200",
        };
      default:
        return {
          bg: "bg-slate-500",
          light: "bg-slate-50",
          text: "text-slate-600",
          border: "border-slate-200",
        };
    }
  };
  return (
    <div className={cn("space-y-4", className)}>
      {/* Modern Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-blue-50/80 via-indigo-50/90 to-purple-50/80 backdrop-blur-xl border border-blue-200/70 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-blue-500/15 transition-all duration-500 overflow-hidden"
      >
        {/* Enhanced gradient background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-indigo-50/30 to-purple-100/40 opacity-60" />

        <div className="relative p-4 lg:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="p-2.5 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl shadow-lg"
              >
                <TrendingUp className="w-5 h-5 text-white" />
              </motion.div>{" "}
              <div>
                {" "}
                <h3 className="text-lg font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                  Recent Activity
                </h3>
                <p className="text-sm text-slate-500">
                  {isLoading
                    ? "Loading transactions..."
                    : recentTransactions.length > 0
                    ? "Latest transactions"
                    : "Latest transactions and updates"}
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 text-slate-600 hover:text-slate-800 hover:bg-white/80 transition-all duration-200"
            >
              <MoreHorizontal className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-2 right-2 w-12 h-12 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-xl animate-pulse" />
      </motion.div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {activitiesToShow.map((activity, index) => {
          const colors = getColorClasses(activity.color);
          const isIncome = activity.type === "income";
          const isLoading = activity.id.startsWith("loading-");

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50/90 via-white/95 to-blue-50/90 backdrop-blur-sm border border-slate-200/60 p-3 transition-all duration-300",
                isLoading
                  ? "animate-pulse"
                  : "hover:shadow-lg hover:border-slate-300/70 hover:scale-[1.01]"
              )}
            >
              {/* Soft gradient background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="flex items-center gap-3 relative">
                {/* Icon or Emoji */}
                <motion.div
                  whileHover={isLoading ? {} : { scale: 1.1, rotate: 5 }}
                  className={cn(
                    "p-2 rounded-lg shrink-0",
                    colors.light,
                    colors.border,
                    "border"
                  )}
                >
                  {activity.emoji ? (
                    <span className="text-sm">{activity.emoji}</span>
                  ) : (
                    <activity.icon className={cn("w-4 h-4", colors.text)} />
                  )}
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-semibold truncate",
                          isLoading ? "text-slate-400" : "text-slate-900"
                        )}
                      >
                        {activity.description}
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-0.5",
                          isLoading ? "text-slate-300" : "text-slate-500"
                        )}
                      >
                        {activity.category}
                      </p>
                    </div>

                    <div className="text-right ml-3 shrink-0">
                      {activity.amount === 0 && !isLoading ? (
                        <div className="text-sm text-slate-500 italic">
                          No data
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "text-base font-bold flex items-center gap-1",
                            isLoading
                              ? "text-slate-400"
                              : isIncome
                              ? "text-emerald-600"
                              : "text-slate-900"
                          )}
                        >
                          {!isLoading && (
                            <>
                              {isIncome ? (
                                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <ArrowDownLeft className="w-3 h-3 text-rose-500" />
                              )}
                              <span>
                                {formatCurrency(Math.abs(activity.amount))}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      <p
                        className={cn(
                          "text-xs mt-0.5",
                          isLoading ? "text-slate-300" : "text-slate-500"
                        )}
                      >
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction type indicator */}
              <div
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300",
                  isLoading
                    ? "bg-slate-300"
                    : isIncome
                    ? "bg-emerald-500"
                    : "bg-rose-500",
                  "opacity-0 group-hover:opacity-100"
                )}
              />
            </motion.div>
          );
        })}
      </div>{" "}
      {/* View All Button - Enhanced with gradient and effects */}{" "}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-br from-blue-50/80 via-indigo-50/90 to-purple-50/80 hover:from-blue-100/80 hover:via-indigo-100/90 hover:to-purple-100/80 backdrop-blur-sm border border-blue-200/70 hover:border-blue-300/80 text-blue-700 hover:text-blue-800 font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/15 group relative overflow-hidden"
        onClick={() => (window.location.href = "/transactions")}
      >
        {" "}
        {/* Enhanced animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-blue-100/40 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {recentTransactions.length > 0
            ? "View All Transactions"
            : "Go to Transactions"}
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </span>
      </motion.button>
    </div>
  );
};

"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CountUp from "react-countup";

interface FinancialInsightsProps {
  className?: string;
}

export const FinancialInsights = ({ className }: FinancialInsightsProps) => {
  const insights = [
    {
      title: "Spending Velocity",
      value: 1340,
      currency: "EUR",
      change: 8.2,
      trend: "up",
      description: "Daily average spend",
      icon: TrendingUp,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Savings Goal",
      value: 2847,
      currency: "EUR",
      change: -2.1,
      trend: "down",
      description: "Monthly target progress",
      icon: Target,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Budget Remaining",
      value: 1256,
      currency: "EUR",
      change: 15.7,
      trend: "up",
      description: "Available this month",
      icon: Wallet,
      gradient: "from-purple-500 to-pink-500",
    },
  ];
  return (
    <div className={cn("space-y-4", className)}>
      {/* Modern Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg shadow-black/5 overflow-hidden"
      >
        {/* Gradient Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-indigo-50/40" />

        <div className="relative p-4 lg:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg"
              >
                <TrendingUp className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                  Financial Insights
                </h3>
                <p className="text-sm text-slate-500">Key metrics and trends</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 text-slate-600 hover:text-slate-800 hover:bg-white/80 transition-all duration-200"
            >
              <Calendar className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-2 right-2 w-12 h-12 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-xl animate-pulse" />
      </motion.div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative group"
          >
            <div className="relative overflow-hidden rounded-xl bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
              {/* Gradient background */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-500",
                  insight.gradient
                    .replace("from-", "from-")
                    .replace("to-", "to-")
                )}
              />

              {/* Content */}
              <div className="relative p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {insight.description}
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ rotate: 10 }}
                    className={cn(
                      "p-2 rounded-lg bg-gradient-to-br shadow-lg",
                      insight.gradient
                    )}
                  >
                    <insight.icon className="w-4 h-4 text-white" />
                  </motion.div>
                </div>

                {/* Value */}
                <div className="space-y-2">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                    className="text-xl font-bold text-slate-900"
                  >
                    <CountUp end={insight.value} />
                  </motion.div>

                  {/* Trend indicator */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.6 }}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                      insight.trend === "up"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    )}
                  >
                    {insight.trend === "up" ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span>
                      {insight.change > 0 ? "+" : ""}
                      {insight.change}%
                    </span>
                  </motion.div>
                </div>

                {/* Subtle decoration */}
                <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

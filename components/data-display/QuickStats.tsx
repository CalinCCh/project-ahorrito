"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  PiggyBank,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickStatsProps {
  className?: string;
}

export const QuickStats = ({ className }: QuickStatsProps) => {
  const stats = [
    {
      label: "Monthly Target",
      value: "€2,500",
      progress: 68,
      icon: Target,
      color: "emerald",
      trend: "+12%",
    },
    {
      label: "Savings Rate",
      value: "23%",
      progress: 23,
      icon: PiggyBank,
      color: "blue",
      trend: "+5%",
    },
    {
      label: "This Month",
      value: "€1,247",
      progress: 45,
      icon: Calendar,
      color: "purple",
      trend: "-8%",
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return {
          bg: "bg-emerald-500",
          light: "bg-emerald-50",
          text: "text-emerald-600",
          progress: "bg-emerald-500",
        };
      case "blue":
        return {
          bg: "bg-blue-500",
          light: "bg-blue-50",
          text: "text-blue-600",
          progress: "bg-blue-500",
        };
      case "purple":
        return {
          bg: "bg-purple-500",
          light: "bg-purple-50",
          text: "text-purple-600",
          progress: "bg-purple-500",
        };
      default:
        return {
          bg: "bg-slate-500",
          light: "bg-slate-50",
          text: "text-slate-600",
          progress: "bg-slate-500",
        };
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <motion.h3
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="text-lg font-semibold text-slate-800 mb-4"
      >
        Quick Stats
      </motion.h3>

      <div className="space-y-3">
        {stats.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          const isPositive = stat.trend.startsWith("+");

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-4 hover:shadow-lg transition-all duration-300 group"
            >
              {/* Background gradient */}
              <div className={cn("absolute inset-0 opacity-5", colors.light)} />

              <div className="flex items-center justify-between relative">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", colors.light)}>
                    <stat.icon className={cn("w-5 h-5", colors.text)} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {stat.label}
                    </p>
                    <p className="text-xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                      isPositive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    )}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{stat.trend}</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{stat.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    transition={{ duration: 1.5, delay: index * 0.2 + 0.5 }}
                    className={cn("h-full rounded-full", colors.progress)}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

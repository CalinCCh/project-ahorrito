"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  CreditCard,
  Target,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  color?: "green" | "red" | "blue" | "purple" | "yellow";
  icon?: React.ReactNode;
}

function MetricCard({ title, value, change, trend = "neutral", color = "blue", icon }: MetricCardProps) {
  const colorClasses = {
    green: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-800",
      icon: "text-emerald-600",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200", 
      text: "text-red-800",
      icon: "text-red-600",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800", 
      icon: "text-blue-600",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-800",
      icon: "text-purple-600",
    },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "text-yellow-600",
    },
  };

  const trendIcon = {
    up: <TrendingUp className="w-4 h-4 text-green-500" />,
    down: <TrendingDown className="w-4 h-4 text-red-500" />,
    neutral: null,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-xl border ${colorClasses[color].bg} ${colorClasses[color].border}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <div className={colorClasses[color].icon}>{icon}</div>}
          <h4 className={`text-sm font-medium ${colorClasses[color].text}`}>{title}</h4>
        </div>
        {trendIcon[trend]}
      </div>
      <div className={`text-2xl font-bold ${colorClasses[color].text} mb-1`}>
        {value}
      </div>
      {change && (
        <div className={`text-xs ${colorClasses[color].text} opacity-70`}>
          {change}
        </div>
      )}
    </motion.div>
  );
}

interface FinancialMetricsProps {
  metrics: Array<{
    title: string;
    value: string;
    change?: string;
    trend?: "up" | "down" | "neutral";
    color?: "green" | "red" | "blue" | "purple" | "yellow";
    type?: "balance" | "savings" | "expenses" | "budget" | "goal" | "risk";
  }>;
  title?: string;
}

export function FinancialMetrics({ metrics, title = "Resumen Financiero" }: FinancialMetricsProps) {
  const getIcon = (type?: string) => {
    switch (type) {
      case "balance":
        return <DollarSign className="w-5 h-5" />;
      case "savings":
        return <PiggyBank className="w-5 h-5" />;
      case "expenses":
        return <CreditCard className="w-5 h-5" />;
      case "budget":
        return <Target className="w-5 h-5" />;
      case "goal":
        return <CheckCircle className="w-5 h-5" />;
      case "risk":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  return (
    <div className="my-4">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-500" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            color={metric.color}
            icon={getIcon(metric.type)}
          />
        ))}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  current: number;
  target: number;
  format?: "currency" | "percentage";
  color?: "green" | "blue" | "purple" | "yellow";
}

export function ProgressBar({ 
  label, 
  current, 
  target, 
  format = "currency", 
  color = "blue" 
}: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100);
  
  const formatValue = (value: number) => {
    if (format === "currency") {
      return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
    }
    return `${value.toFixed(1)}%`;
  };

  const colorClasses = {
    green: "bg-emerald-500",
    blue: "bg-blue-500", 
    purple: "bg-purple-500",
    yellow: "bg-yellow-500",
  };

  return (
    <div className="my-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-slate-700">{label}</h4>
        <span className="text-xs text-slate-500">
          {formatValue(current)} / {formatValue(target)}
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-2.5 rounded-full ${colorClasses[color]}`}
        />
      </div>
      <div className="mt-1 text-xs text-slate-600">
        {percentage.toFixed(1)}% completado
      </div>
    </div>
  );
}
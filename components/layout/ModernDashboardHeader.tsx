"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Bell,
  Search,
  TrendingUp,
  Wallet,
  Settings,
  BarChart3,
  Zap,
  Brain,
  Target,
  PiggyBank,
  TrendingDown,
  Calculator,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRightSidebar } from "@/hooks/use-right-sidebar";

interface ModernDashboardHeaderProps {
  title?: string;
  subtitle?: string;
  showActions?: boolean;
  onSearchChange?: (value: string) => void;
  children?: React.ReactNode;
  onAIChat?: (message: string) => void;
}

export function ModernDashboardHeader({
  title,
  subtitle,
  showActions = true,
  onSearchChange,
  children,
  onAIChat,
}: ModernDashboardHeaderProps) {
  const { user } = useUser();
  const router = useRouter();
  const { openChat } = useRightSidebar();

  // AI Smart Suggestions - Random useful suggestions with descriptive phrases and subtle colors
  const aiSuggestions = useMemo(
    () => [
      {
        icon: Brain,
        text: "Analyze my spending patterns this month",
        color: "from-purple-300 to-violet-400",
        fullQuestion:
          "Analyze my spending patterns over the last month. What categories am I spending the most on? Are there any unusual transactions or patterns I should be aware of? Give me actionable insights to optimize my budget.",
      },
      {
        icon: Target,
        text: "Help me optimize my budget better",
        color: "from-blue-300 to-cyan-400",
        fullQuestion:
          "Help me optimize my budget for this month. Analyze my income vs expenses, identify areas where I can cut costs, and suggest realistic savings goals based on my financial data.",
      },
      {
        icon: TrendingUp,
        text: "Show me my financial health score",
        color: "from-emerald-300 to-green-400",
        fullQuestion:
          "Calculate my financial health score. Analyze my savings rate, spending habits, cash flow, and debt-to-income ratio. What are the main factors affecting my score and how can I improve it?",
      },
      {
        icon: PiggyBank,
        text: "Give me personalized saving tips",
        color: "from-amber-300 to-orange-400",
        fullQuestion:
          "Based on my spending habits and income, suggest personalized saving strategies. What automated savings plans would work best for me? How can I increase my savings rate without affecting my lifestyle?",
      },
      {
        icon: Calculator,
        text: "Review my expense categories",
        color: "from-rose-300 to-pink-400",
        fullQuestion:
          "Review my expense categories and transactions. Are there any recurring subscriptions I might have forgotten? Any duplicate expenses or categories that could be consolidated? Help me clean up my financial tracking.",
      },
      {
        icon: Zap,
        text: "What can I improve right now?",
        color: "from-violet-300 to-purple-400",
        fullQuestion:
          "Give me 3-5 quick financial wins I can implement this week based on my current spending data. What are the easiest changes I can make to improve my financial situation immediately?",
      },
    ],
    []
  );

  // Select a random suggestion each time the component mounts
  const aiAction = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * aiSuggestions.length);
    return aiSuggestions[randomIndex];
  }, []); // Empty dependency array to keep it fixed during the session

  const handleAIAction = () => {
    // Use the new hook to open the right sidebar with the predefined message
    openChat(aiAction.fullQuestion);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let emoji = "👋"; // Default emoji
    let greetingMessage = "";

    if (hour < 12) {
      greetingMessage = "Good morning";
      emoji = "☀️"; // Sun emoji for morning
    } else if (hour < 18) {
      greetingMessage = "Good afternoon";
      emoji = "🌤️"; // Sun behind cloud for afternoon
    } else {
      greetingMessage = "Good evening";
      emoji = "🌙"; // Moon emoji for evening
    }
    // Return an object instead of a single string
    return {
      text: `${greetingMessage}, ${user?.firstName || "User"}`,
      emoji: emoji,
    };
  };

  const greeting = getGreeting(); // Call getGreeting once

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative"
    >
      {/* Modern Glass Header */}
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-lg shadow-black/5 overflow-hidden">
        {/* Gradient Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/40" />

        {/* Animated Gradient Border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-sm -z-10 animate-pulse" />
        <div className="relative p-6 lg:p-8">
          {/* Main Header Section - Compact */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* User Greeting & Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 flex-1 min-w-0"
            >
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center ring-2 ring-white/50 shadow-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-bold">
                  <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                    {greeting.text}
                  </span>
                  <span role="img" aria-label="greeting emoji" className="ml-1">
                    {greeting.emoji}
                  </span>
                </h1>
                {title && (
                  <h2 className="text-sm lg:text-base font-medium text-slate-600 truncate">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-500 truncate">{subtitle}</p>
                )}
              </div>
            </motion.div>

            {/* AI Smart Suggestion Button - Match right panel size */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex gap-2"
            >
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAIAction}
                className={`
                  h-11 px-4 text-sm flex items-center gap-2 
                  rounded-lg transition-all duration-200 cursor-pointer group
                  bg-gradient-to-r from-purple-600 to-indigo-700 text-white 
                  border border-purple-700/20 shadow-md hover:shadow-lg
                  hover:from-purple-700 hover:to-indigo-800
                  whitespace-nowrap
                `}
              >
                <aiAction.icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm">{aiAction.text}</span>
                <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse flex-shrink-0" />
              </motion.button>
            </motion.div>

            {/* Actions & Filters */}
            {showActions && children && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 w-full lg:w-auto"
              >
                {children}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl animate-pulse delay-1000" />
    </motion.div>
  );
}

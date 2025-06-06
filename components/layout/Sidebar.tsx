"use client";

import React, { memo, useCallback, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Crown,
  LayoutDashboard,
  Receipt,
  CreditCard,
  FolderOpen,
  Settings,
  UserCircle2,
  LogOut,
  Sparkles,
  TrendingUp,
  Zap,
  ChevronRight,
  PiggyBank,
  Trophy,
  MessageCircle,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { plans } from "@/lib/stripe-plans";
import { useSubscription } from "@/features/subscriptions/hooks/use-subscription";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
    color: "from-blue-500 to-cyan-500",
    description: "Dashboard overview and insights",
  },
  {
    name: "Accounts",
    href: "/accounts",
    icon: CreditCard,
    color: "from-emerald-500 to-teal-500",
    description: "Manage your bank accounts",
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: Receipt,
    color: "from-violet-500 to-purple-500",
    description: "View transaction history",
  },
  {
    name: "Savings",
    href: "/savings",
    icon: PiggyBank,
    color: "from-pink-500 to-rose-500",
    description: "Track your savings goals",
  },
  {
    name: "Achievements",
    href: "/achievements",
    icon: Trophy,
    color: "from-amber-500 to-yellow-500",
    description: "View your financial milestones",
  },
  {
    name: "Assistant",
    href: "/assistant",
    icon: MessageCircle,
    color: "from-violet-500 to-purple-600",
    description: "Chat with AI financial assistant",
  },
];

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { isVip, daysRemaining, subscription } = useSubscription();
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const monthlyPlan = useMemo(
    () => plans.find((p) => p.name === "Pro Monthly"),
    []
  );

  const isMonthlyAvailable = useMemo(
    () => monthlyPlan && monthlyPlan.priceId.startsWith("price_"),
    [monthlyPlan]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const handleUserProfile = useCallback(() => {
    openUserProfile();
  }, [openUserProfile]);

  const setHovered = useCallback((hovered: boolean) => {
    setIsHovered(hovered);
  }, []);
  return (
    <aside
      className="hidden lg:flex fixed top-0 left-0 h-screen w-72 flex-col bg-white border-r border-slate-200/60 z-20 shadow-lg overflow-hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Header with Logo */}
      <div className="pt-8 pb-6 flex flex-col pl-8 pr-6 border-b border-slate-200/60">
        <Link href="/" className="block">
          <div className="flex items-center gap-3 mb-3 cursor-pointer hover:opacity-90 transition-opacity duration-200">
            <div className="relative">
              <Image
                src="/logo2.svg"
                alt="Ahorrito Logo"
                width={40}
                height={40}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-blue-600">
                Ahorrito
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Personal Finance Hub
              </span>
            </div>
          </div>
        </Link>
      </div>
      {/* Navigation */}
      <nav
        className="flex-1 px-4 py-6 space-y-1"
        role="navigation"
        aria-label="Main menu"
      >
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const isAssistant = item.name === "Assistant";
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "group relative flex items-center px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : isAssistant
                    ? "text-slate-600 hover:bg-purple-100/80 hover:text-purple-800 bg-gradient-to-r from-purple-100/60 to-violet-100/60 border border-purple-200/80"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
                role="menuitem"
                aria-current={isActive ? "page" : undefined}
              >
                <div className="flex items-center gap-3 w-full">
                  <item.icon
                    className={cn(
                      "size-5 transition-colors duration-200",
                      isActive
                        ? "text-blue-600"
                        : isAssistant
                        ? "text-purple-700 group-hover:text-purple-800"
                        : "text-slate-500 group-hover:text-slate-700"
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium text-sm transition-colors duration-200",
                      isActive
                        ? "text-blue-700"
                        : isAssistant
                        ? "text-purple-800 group-hover:text-purple-900"
                        : "text-slate-700 group-hover:text-slate-900"
                    )}
                  >
                    {item.name}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
      {/* Upgrade to Pro Section - Only for non-VIP users */}
      {!isVip && (
        <div className="mx-4 mb-6">
          <motion.div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-6 shadow-xl shadow-purple-500/15 cursor-pointer"
            whileHover={{
              scale: 1.01,
              boxShadow: "0 20px 40px -12px rgba(139, 92, 246, 0.2)",
            }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-lg"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10">
              <motion.div
                className="flex items-center gap-3 mb-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.15 }}
              >
                <div className="relative">
                  <Crown className="size-8 text-yellow-300 drop-shadow-lg" />
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="size-8 text-yellow-200" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg tracking-wide">
                    PRO
                  </h3>
                  <p className="text-indigo-100 text-xs font-medium">
                    Premium Features
                  </p>
                </div>
              </motion.div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2 text-white/90 text-sm transition-all duration-200 hover:text-white">
                  <TrendingUp className="size-4 text-emerald-300" />
                  <span>Advanced Analytics</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm transition-all duration-200 hover:text-white">
                  <Zap className="size-4 text-yellow-300" />
                  <span>AI-Powered Insights</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm transition-all duration-200 hover:text-white">
                  <Sparkles className="size-4 text-pink-300" />
                  <span>Premium Support</span>
                </div>
              </div>

              <Link href="/pricing">
                <motion.button
                  className={cn(
                    "w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden",
                    isMonthlyAvailable
                      ? "bg-white text-indigo-700 shadow-lg hover:shadow-xl hover:bg-indigo-50"
                      : "bg-white/20 text-white/60 cursor-not-allowed backdrop-blur-sm"
                  )}
                  disabled={!isMonthlyAvailable}
                  whileHover={
                    isMonthlyAvailable
                      ? {
                          scale: 1.05,
                          boxShadow:
                            "0 10px 25px -5px rgba(255, 255, 255, 0.3)",
                        }
                      : {}
                  }
                  whileTap={isMonthlyAvailable ? { scale: 0.95 } : {}}
                  transition={{ duration: 0.2 }}
                >
                  {isMonthlyAvailable && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isMonthlyAvailable ? (
                      <>
                        <Crown className="size-4" />
                        Upgrade to Pro
                      </>
                    ) : (
                      "Not Available"
                    )}
                  </span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
      {/* User Profile */}
      {isLoaded && user && (
        <div className="px-4 pb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className={cn(
                "group flex items-center gap-3 p-4 border cursor-pointer rounded-xl transition-all duration-300 backdrop-blur-sm",
                isVip
                  ? "border-purple-300/80 hover:border-purple-400/80 bg-gradient-to-r from-purple-100/95 to-violet-100/95 hover:from-purple-150/95 hover:to-violet-150/95 hover:shadow-lg hover:shadow-purple-500/20"
                  : "border-slate-200/80 hover:border-blue-300/60 bg-white/90 hover:bg-blue-50/50 hover:shadow-lg hover:shadow-blue-500/10"
              )}>
                <div className="relative">
                  {user.imageUrl ? (
                    <div className={cn(
                      "relative overflow-hidden rounded-full ring-2 transition-all duration-300 group-hover:scale-105",
                      isVip
                        ? "ring-purple-300/80 group-hover:ring-purple-500/80"
                        : "ring-slate-200/80 group-hover:ring-blue-400/60"
                    )}>
                      <Image
                        src={user.imageUrl}
                        alt={user.fullName || "User avatar"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full",
                        isVip ? "bg-purple-500/20" : "bg-blue-500/10"
                      )} />
                    </div>
                  ) : (
                    <div className={cn(
                      "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center ring-2 group-hover:scale-105 transition-all duration-300 shadow-lg",
                      isVip
                        ? "from-purple-600 to-violet-600 ring-purple-300/80 group-hover:ring-purple-500/80 group-hover:shadow-purple-500/40"
                        : "from-blue-500 to-purple-500 ring-slate-200/80 group-hover:ring-blue-400/60 group-hover:shadow-blue-500/25"
                    )}>
                      <UserCircle2 className="size-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex flex-col gap-1">
                    {isVip && (
                      <div className="self-start">
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600 rounded-full shadow-sm">
                          <Crown className="size-3 text-white" />
                          <span className="text-xs font-bold text-white">
                            VIP
                          </span>
                        </div>
                      </div>
                    )}
                    <span className={cn(
                      "text-sm font-semibold truncate transition-colors duration-300",
                      isVip
                        ? "text-slate-800 group-hover:text-purple-800"
                        : "text-slate-800 group-hover:text-blue-700"
                    )}>
                      {user.fullName || user.firstName || "User"}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-slate-600 truncate transition-colors duration-300">
                    {user.primaryEmailAddress?.emailAddress || "No email"}
                  </span>
                </div>
                <div className="opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                  <ChevronRight className={cn(
                    "size-4 transition-colors duration-300",
                    isVip
                      ? "text-slate-400 group-hover:text-purple-600"
                      : "text-slate-400 group-hover:text-blue-500"
                  )} />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white/95 backdrop-blur-xl border-slate-200/60 shadow-xl"
            >
              {" "}
              <Link href="/settings">
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-blue-50/80 transition-colors duration-200"
                  role="menuitem"
                >
                  <Settings
                    className="mr-3 size-4 text-slate-600"
                    aria-hidden="true"
                  />
                  <span className="font-medium">Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer hover:bg-red-50/80 text-red-600 transition-colors duration-200"
                role="menuitem"
              >
                <LogOut className="mr-3 size-4" aria-hidden="true" />
                <span className="font-medium">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </aside>
  );
});

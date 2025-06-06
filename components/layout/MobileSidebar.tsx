"use client";

import React, { memo, useCallback, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  Menu,
  X,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { plans } from "@/lib/stripe-plans";
import { useSubscription } from "@/features/subscriptions/hooks/use-subscription";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Accounts",
    href: "/accounts",
    icon: CreditCard,
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: Receipt,
    color: "from-violet-500 to-purple-500",
  },
  {
    name: "Savings",
    href: "/savings",
    icon: PiggyBank,
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Achievements",
    href: "/achievements",
    icon: Trophy,
    color: "from-amber-500 to-yellow-500",
  },
  {
    name: "Assistant",
    href: "/assistant",
    icon: MessageCircle,
    color: "from-violet-500 to-purple-600",
  },
];

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MobileSidebar = memo<MobileSidebarProps>(function MobileSidebar({
  isOpen,
  setIsOpen,
}) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { isVip } = useSubscription();

  const monthlyPlan = useMemo(
    () => plans.find((p) => p.name === "Pro Monthly"),
    []
  );

  const isMonthlyAvailable = useMemo(
    () => monthlyPlan && monthlyPlan.priceId.startsWith("price_"),
    [monthlyPlan]
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    setIsOpen(false);
  }, [signOut, setIsOpen]);

  const handleMenuItemClick = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="left"
        className="w-full sm:w-80 p-0 bg-white border-r border-slate-200/60 overflow-hidden"
        aria-label="Mobile navigation menu"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {/* Navigation - moved to top */}
          <nav
            className="flex-1 px-4 py-6 space-y-1 overflow-y-auto"
            role="navigation"
            aria-label="Main menu"
          >
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const isAssistant = item.name === "Assistant";
              return (
                <Link key={item.name} href={item.href} onClick={handleMenuItemClick}>
                  <div
                    className={cn(
                      "group relative flex items-center px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer",
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

          {/* Upgrade to Pro Section - Only for non-VIP users - Compact version */}
          {!isVip && (
            <div className="mx-4 mb-3">
              <motion.div
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-4 shadow-lg"
                whileHover={{
                  scale: 1.01,
                  boxShadow: "0 15px 30px -10px rgba(139, 92, 246, 0.2)",
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="size-6 text-yellow-300" />
                    <div>
                      <h3 className="font-bold text-white text-base">
                        PRO
                      </h3>
                      <p className="text-indigo-100 text-xs">
                        Premium Features
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-white/90 text-xs">
                      <TrendingUp className="size-3 text-emerald-300" />
                      <span>Advanced Analytics</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90 text-xs">
                      <Zap className="size-3 text-yellow-300" />
                      <span>AI-Powered Insights</span>
                    </div>
                  </div>

                  <Link href="/pricing" onClick={handleMenuItemClick}>
                    <Button
                      className={cn(
                        "w-full py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-300",
                        isMonthlyAvailable
                          ? "bg-white text-indigo-700 shadow-md hover:shadow-lg hover:bg-indigo-50"
                          : "bg-white/20 text-white/60 cursor-not-allowed backdrop-blur-sm"
                      )}
                      disabled={!isMonthlyAvailable}
                    >
                      {isMonthlyAvailable ? (
                        <>
                          <Crown className="size-3 mr-1" />
                          Upgrade to Pro
                        </>
                      ) : (
                        "Not Available"
                      )}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          )}

          {/* User Profile - Compact version */}
          {isLoaded && user && (
            <div className="px-4 pb-4 border-t border-slate-200/60 pt-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className={cn(
                    "group flex items-center gap-3 p-3 border cursor-pointer rounded-lg transition-all duration-300 backdrop-blur-sm w-full",
                    isVip
                      ? "border-purple-300/80 hover:border-purple-400/80 bg-gradient-to-r from-purple-100/95 to-violet-100/95 hover:from-purple-150/95 hover:to-violet-150/95 hover:shadow-md"
                      : "border-slate-200/80 hover:border-blue-300/60 bg-white/90 hover:bg-blue-50/50 hover:shadow-md"
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
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={cn(
                          "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center ring-2 group-hover:scale-105 transition-all duration-300 shadow-md",
                          isVip
                            ? "from-purple-600 to-violet-600 ring-purple-300/80 group-hover:ring-purple-500/80"
                            : "from-blue-500 to-purple-500 ring-slate-200/80 group-hover:ring-blue-400/60"
                        )}>
                          <UserCircle2 className="size-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex flex-col gap-0.5">
                        {isVip && (
                          <div className="self-start">
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600 rounded-full shadow-sm">
                              <Crown className="size-2.5 text-white" />
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
                    <div className="opacity-60 group-hover:opacity-100 transition-all duration-300">
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
                  <Link href="/settings" onClick={handleMenuItemClick}>
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
        </div>
      </SheetContent>
    </Sheet>
  );
});

interface MobileMenuButtonProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MobileMenuButton = memo<MobileMenuButtonProps>(function MobileMenuButton({
  isOpen,
  setIsOpen,
}) {
  return (
    <button
      className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors duration-200"
      onClick={() => setIsOpen(!isOpen)}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation"
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X className="h-6 w-6" />
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Menu className="h-6 w-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
});
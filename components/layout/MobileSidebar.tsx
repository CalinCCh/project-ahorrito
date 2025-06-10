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
  Home,
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
    showInBottomNav: true,
  },
  {
    name: "Accounts",
    href: "/accounts",
    icon: CreditCard,
    color: "from-emerald-500 to-teal-500",
    showInBottomNav: true,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: Receipt,
    color: "from-violet-500 to-purple-500",
    showInBottomNav: true,
  },
  {
    name: "Savings",
    href: "/savings",
    icon: PiggyBank,
    color: "from-pink-500 to-rose-500",
    showInBottomNav: true,
  },
  {
    name: "Achievements",
    href: "/achievements",
    icon: Trophy,
    color: "from-amber-500 to-yellow-500",
    showInBottomNav: false,
  },
  {
    name: "Assistant",
    href: "/assistant",
    icon: MessageCircle,
    color: "from-violet-500 to-purple-600",
    showInBottomNav: true,
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
    <>
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
            {/* Header with logo and user info */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Image
                    src="/logo2.svg"
                    alt="Ahorrito"
                    width={24}
                    height={24}
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="font-bold text-lg text-slate-800">
                  Ahorrito
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User Profile - Simplified */}
            {isLoaded && user && (
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {user.imageUrl ? (
                      <div className="relative overflow-hidden rounded-full ring-2 ring-slate-200">
                        <Image
                          src={user.imageUrl}
                          alt={user.fullName || "User avatar"}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center ring-2 ring-slate-200 shadow-md">
                        <UserCircle2 className="size-6 text-white" />
                      </div>
                    )}
                    {isVip && (
                      <div className="absolute -top-1 -right-1">
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full shadow-sm">
                          <Crown className="size-2.5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-slate-800">
                      {user.fullName || user.firstName || "User"}
                    </span>
                    <span className="text-xs text-slate-500 truncate max-w-[180px]">
                      {user.primaryEmailAddress?.emailAddress || "No email"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation - bigger touch targets */}
            <nav
              className="flex-1 px-4 py-4 space-y-2 overflow-y-auto"
              role="navigation"
              aria-label="Main menu"
            >
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const isAssistant = item.name === "Assistant";
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleMenuItemClick}
                  >
                    <div
                      className={cn(
                        "group relative flex items-center px-4 py-4 rounded-xl transition-all duration-200 cursor-pointer",
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : isAssistant
                          ? "text-slate-600 hover:bg-purple-100/80 hover:text-purple-800 bg-gradient-to-r from-purple-100/60 to-violet-100/60 border border-purple-200/80"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                      role="menuitem"
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <item.icon
                          className={cn(
                            "size-6 transition-colors duration-200",
                            isActive
                              ? "text-blue-600"
                              : isAssistant
                              ? "text-purple-700 group-hover:text-purple-800"
                              : "text-slate-500 group-hover:text-slate-700"
                          )}
                        />
                        <span
                          className={cn(
                            "font-medium text-base transition-colors duration-200",
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

            {/* Footer actions */}
            <div className="px-4 py-3 border-t border-slate-200 space-y-2">
              <Link href="/settings" onClick={handleMenuItemClick}>
                <div className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50">
                  <Settings className="size-5" />
                  <span className="font-medium">Settings</span>
                </div>
              </Link>
              <div
                className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 cursor-pointer"
                onClick={handleSignOut}
              >
                <LogOut className="size-5" />
                <span className="font-medium">Sign Out</span>
              </div>
            </div>

            {/* Upgrade to Pro Section - Only for non-VIP users - More compact */}
            {!isVip && (
              <div className="px-4 py-3">
                <div className="rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-3 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Crown className="size-5 text-yellow-300" />
                      <span className="font-bold text-white text-sm">
                        Upgrade to PRO
                      </span>
                    </div>
                    <Link href="/pricing" onClick={handleMenuItemClick}>
                      <Button className="bg-white text-indigo-700 hover:bg-indigo-50 h-8 px-3 text-xs rounded-lg">
                        View Plans
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Bottom Navigation Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {menuItems
            .filter((item) => item.showInBottomNav)
            .slice(0, 5) // Limitar a 5 elementos para que quepan bien
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className="w-full">
                  <div className="flex flex-col items-center justify-center h-full">
                    <div
                      className={cn(
                        "flex flex-col items-center justify-center rounded-full w-12 h-12 transition-all duration-200",
                        isActive
                          ? "text-blue-600"
                          : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "size-5 mb-1",
                          isActive ? "text-blue-600" : "text-slate-500"
                        )}
                      />
                      <span
                        className={cn(
                          "text-[10px]",
                          isActive
                            ? "font-medium text-blue-600"
                            : "text-slate-500"
                        )}
                      >
                        {item.name}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center justify-center h-full w-full"
          >
            <div className="flex flex-col items-center justify-center rounded-full w-12 h-12 text-slate-500 hover:text-slate-800">
              <Menu className="size-5 mb-1" />
              <span className="text-[10px]">Menú</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
});

interface MobileMenuButtonProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MobileMenuButton = memo<MobileMenuButtonProps>(
  function MobileMenuButton({ isOpen, setIsOpen }) {
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
  }
);

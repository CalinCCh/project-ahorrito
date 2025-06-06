"use client";

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
  Brain,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { plans } from "@/lib/stripe-plans";
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
    name: "Assistant",
    href: "#",
    icon: Brain,
    color: "from-pink-500 to-rose-500",
    description: "AI Financial Assistant",
    isRightSidebar: true,
  },
];

export const Sidebar = ({
  onAssistantClick,
}: {
  onAssistantClick?: () => void;
}) => {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const monthlyPlan = plans.find((p) => p.name === "Pro Monthly");
  const isMonthlyAvailable =
    monthlyPlan && monthlyPlan.priceId.startsWith("price_");

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <motion.aside
      className="hidden lg:flex fixed top-0 left-0 h-screen w-72 flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-r border-slate-200/60 backdrop-blur-xl z-20 shadow-xl shadow-slate-900/5 overflow-hidden"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Interactive background gradient - reduced effect */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.05), transparent 40%)`,
        }}
        animate={{
          opacity: isHovered ? 0.15 : 0.05,
        }}
        transition={{ duration: 0.3 }}
      />
      {/* Header with Logo - reduced animations */}
      <motion.div className="pt-8 pb-6 flex flex-col pl-8 pr-6 border-b border-slate-200/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 to-purple-500/3 opacity-0 transition-opacity duration-300 hover:opacity-100" />

        <motion.div
          className="relative z-10 flex items-center gap-3 mb-3"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative">
            <Image
              src="/logo2.svg"
              alt="Ahorrito Logo"
              width={40}
              height={40}
              className="drop-shadow-lg"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-blue-600 drop-shadow-sm">
              Ahorrito
            </span>
            <span className="text-xs text-blue-400/70 font-medium">
              Smart Finance
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href && !item.isRightSidebar;

          if (item.isRightSidebar) {
            return (
              <div
                key={item.name}
                onClick={onAssistantClick}
                className="cursor-pointer"
              >
                <motion.div
                  className={cn(
                    "group relative flex items-center px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 shadow-lg shadow-blue-500/10"
                      : "text-slate-600 hover:bg-gradient-to-r hover:from-slate-100/80 hover:to-blue-50/80 hover:text-blue-700"
                  )}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  whileHover={{
                    scale: 1.01,
                    x: 2,
                    transition: { duration: 0.15 },
                  }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* Background gradient */}
                  <motion.div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r opacity-0 rounded-xl transition-opacity duration-300",
                      item.color,
                      isActive && "opacity-10",
                      "group-hover:opacity-5"
                    )}
                    whileHover={{ opacity: 0.1 }}
                  />

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full -translate-y-1/2"
                      layoutId="activeIndicator"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  )}

                  <div
                    className={cn(
                      "relative z-10 flex items-center gap-3 w-full"
                    )}
                  >
                    <motion.div
                      className={cn(
                        "p-2 rounded-lg transition-all duration-300",
                        isActive
                          ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 shadow-lg"
                          : "group-hover:bg-white/60 group-hover:shadow-md"
                      )}
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      transition={{ duration: 0.15 }}
                    >
                      <item.icon
                        className={cn(
                          "size-5 transition-all duration-300",
                          isActive
                            ? "text-blue-600"
                            : "text-slate-500 group-hover:text-blue-600"
                        )}
                      />
                    </motion.div>

                    <span
                      className={cn(
                        "font-semibold text-sm transition-all duration-300",
                        isActive
                          ? "text-blue-700"
                          : "text-slate-700 group-hover:text-blue-700"
                      )}
                    >
                      {item.name}
                    </span>

                    <motion.div
                      className="ml-auto opacity-60 group-hover:opacity-100"
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="size-4 text-slate-400" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            );
          }

          // Regular navigation items
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                className={cn(
                  "group relative flex items-center px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 shadow-lg shadow-blue-500/10"
                    : "text-slate-600 hover:bg-gradient-to-r hover:from-slate-100/80 hover:to-blue-50/80 hover:text-blue-700"
                )}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                whileHover={{
                  scale: 1.01,
                  x: 2,
                  transition: { duration: 0.15 },
                }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Background gradient */}
                <motion.div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-0 rounded-xl transition-opacity duration-300",
                    item.color,
                    isActive && "opacity-10",
                    "group-hover:opacity-5"
                  )}
                  whileHover={{ opacity: 0.1 }}
                />

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full -translate-y-1/2"
                    layoutId="activeIndicator"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                )}

                <div
                  className={cn("relative z-10 flex items-center gap-3 w-full")}
                >
                  <motion.div
                    className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 shadow-lg"
                        : "group-hover:bg-white/60 group-hover:shadow-md"
                    )}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ duration: 0.15 }}
                  >
                    <item.icon
                      className={cn(
                        "size-5 transition-all duration-300",
                        isActive
                          ? "text-blue-600"
                          : "text-slate-500 group-hover:text-blue-600"
                      )}
                    />
                  </motion.div>

                  <span
                    className={cn(
                      "font-semibold text-sm transition-all duration-300",
                      isActive
                        ? "text-blue-700"
                        : "text-slate-700 group-hover:text-blue-700"
                    )}
                  >
                    {item.name}
                  </span>

                  <motion.div
                    className="ml-auto opacity-60 group-hover:opacity-100"
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="size-4 text-slate-400" />
                  </motion.div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade to Pro Section - reduced effects */}
      <motion.div
        className="mx-4 mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-6 shadow-xl shadow-purple-500/15"
          whileHover={{
            scale: 1.01,
            boxShadow: "0 20px 40px -12px rgba(139, 92, 246, 0.2)",
          }}
          transition={{ duration: 0.2 }}
        >
          {/* Simplified background elements */}
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
                      boxShadow: "0 10px 25px -5px rgba(255, 255, 255, 0.3)",
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
          </div>
        </motion.div>
      </motion.div>

      {/* User Profile */}
      {isLoaded && user && (
        <motion.div
          className="px-4 pb-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                className="group flex items-center gap-3 p-4 border border-slate-200/60 hover:border-blue-300/60 bg-white/60 hover:bg-blue-50/60 cursor-pointer rounded-xl transition-all duration-300 backdrop-blur-sm"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.15)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  {user.imageUrl ? (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Image
                        src={user.imageUrl}
                        alt={user.fullName || "User avatar"}
                        width={40}
                        height={40}
                        className="rounded-full ring-2 ring-blue-200/60 group-hover:ring-blue-400/60 transition-all duration-300"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <UserCircle2 className="size-6 text-white" />
                    </motion.div>
                  )}
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, duration: 0.3 }}
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors duration-300">
                    {user.fullName || user.firstName || "User"}
                  </span>
                  <span className="text-xs text-slate-500 truncate">
                    {user.primaryEmailAddress?.emailAddress || "No email"}
                  </span>
                </div>
                <motion.div
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="size-4 text-slate-400" />
                </motion.div>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white/95 backdrop-blur-xl border-slate-200/60 shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => openUserProfile && openUserProfile()}
                className="cursor-pointer hover:bg-blue-50/80 transition-colors duration-200"
              >
                <Settings className="mr-3 size-4 text-slate-600" />
                <span className="font-medium">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer hover:bg-red-50/80 text-red-600 transition-colors duration-200"
              >
                <LogOut className="mr-3 size-4" />
                <span className="font-medium">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      )}
    </motion.aside>
  );
};

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Gem,
  LayoutDashboard,
  ListOrdered,
  CreditCard,
  FolderKanban,
  Settings,
  UserCircle2,
  LogOut,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useState } from "react";
import { plans } from "@/lib/stripe-plans";

const menuItems = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Accounts",
    href: "/accounts",
    icon: CreditCard,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: ListOrdered,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: FolderKanban,
  },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const monthlyPlan = plans.find((p) => p.name === "Pro Monthly");
  const isMonthlyAvailable =
    monthlyPlan && monthlyPlan.priceId.startsWith("price_");

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  return (
    <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-64 flex-col bg-white border-r shadow-sm z-20">
      <div className="pt-15 pb-10 flex items-center pl-9 pr-4 border-b gap-2">
        <Image src="/logo2.svg" alt="Ahorrito Logo" width={32} height={32} />
        <span className="text-2xl font-bold text-blue-700">Ahorrito</span>
      </div>
      <nav className="flex-1 px-4 py-6">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group flex items-center pl-5 pr-3 py-2 my-2 text-sm font-medium rounded-md transition-colors gap-2",
              pathname === item.href
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-blue-700"
            )}
          >
            <item.icon className="size-5 shrink-0" />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="mt-auto px-4 pb-4">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-500 rounded-xl p-4 shadow-lg flex flex-col items-center text-white mb-5">
          <span className="flex items-center gap-2 text-base font-semibold mb-2">
            <Gem className="size-6 md:size-7 text-white drop-shadow-lg" />
            PRO
          </span>
          <p className="text-xs opacity-90 mb-4 text-center">
            Unlock all premium features and take control of your finances.
          </p>
          <button
            className={
              isMonthlyAvailable
                ? "w-full py-2 px-4 rounded-lg bg-white text-blue-700 font-bold shadow-md hover:bg-blue-100 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                : "w-full py-2 px-4 rounded-lg bg-gray-300 text-gray-500 font-bold shadow-md cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            }
            onClick={handleUpgrade}
            disabled={!isMonthlyAvailable}
          >
            {isMonthlyAvailable ? "Upgrade to Pro" : "Not available"}
          </button>
        </div>

        {isLoaded && user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="group flex items-center gap-3 pt-5 pb-3 px-5 border-t border-gray-200 hover:bg-gray-100 cursor-pointer rounded-md transition-colors">
                {user.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName || "User avatar"}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                ) : (
                  <UserCircle2 className="size-9 text-gray-400" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-gray-700 truncate">
                    {user.fullName || user.firstName || "User"}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {user.primaryEmailAddress?.emailAddress || "No email"}
                  </span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => openUserProfile && openUserProfile()}
                className="cursor-pointer"
              >
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 size-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </aside>
  );
};

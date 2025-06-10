"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ModernDashboardHeader } from "@/components/layout/ModernDashboardHeader";
import { AccountFilter } from "@/components/filters/AccountFilter";
import { DataGrid } from "@/components/data-display/DataGrid";
import { RecentActivity } from "@/components/data-display/RecentActivity";
import { SavingsGoalsSection } from "@/components/savings/SavingsGoalsSection";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DebugClerk from "@/components/debug/clerk-debug";
import { useState } from "react";
import { redirect } from "next/navigation";

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  // DEBUG: Mostrar componente de debug si no está cargado
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>
          <div className="text-center mb-4">Loading Clerk...</div>
          <DebugClerk />
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to sign-in instead of landing
  if (!user) {
    redirect("/sign-in");
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    console.log("Search query:", value);
  };

  return (
    <DashboardLayout>
      <div className="relative min-h-screen smart-scroll">
        {/* Enhanced Fintech Background with Soft Gradients - Mobile Optimized */}
        <div className="fixed inset-0 -z-10">
          {/* Primary soft gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30" />
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-50/30 via-transparent to-cyan-50/20" />

          {/* Subtle overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/40" />

          {/* Refined floating orbs - responsive sizes */}
          <div className="absolute top-16 sm:top-32 left-4 sm:left-16 w-16 sm:w-32 h-16 sm:h-32 bg-gradient-to-br from-blue-400/8 to-cyan-400/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-48 sm:top-96 right-4 sm:right-24 w-12 sm:w-24 h-12 sm:h-24 bg-gradient-to-br from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-32 sm:bottom-80 left-1/4 w-10 sm:w-20 h-10 sm:h-20 bg-gradient-to-br from-emerald-400/8 to-teal-400/8 rounded-full blur-3xl animate-pulse delay-2000" />
          <div className="absolute bottom-16 sm:bottom-32 right-1/3 w-14 sm:w-28 h-14 sm:h-28 bg-gradient-to-br from-amber-400/8 to-orange-400/8 rounded-full blur-3xl animate-pulse delay-500" />

          {/* Very subtle grid pattern - mobile optimized */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "16px 16px sm:32px sm:32px",
            }}
          />
        </div>

        {/* Content Container - IGUAL QUE SAVINGS */}
        <div className="relative z-10">
          <div className="container mx-auto px-4 lg:px-6 py-3 sm:py-6 lg:pt-6">
            {/* Modern Dashboard Header - Mobile Responsive */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-4 sm:mb-6 lg:mb-8"
            >
              <ModernDashboardHeader
                subtitle="Manage your finances with intelligence and style"
                onSearchChange={handleSearchChange}
              >
                {/* Filter section inside the header - responsive */}
                <div className="flex items-center">
                  <div className="w-full sm:w-auto">
                    <AccountFilter />
                  </div>
                </div>
              </ModernDashboardHeader>
            </motion.div>

            {/* Main Content Grid - Mobile Optimized Spacing */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Data Grid Section - Mobile Optimized */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="w-full"
              >
                <DataGrid />
              </motion.div>

              {/* Savings Goals & Achievements Section - Mobile Optimized */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="w-full"
              >
                <SavingsGoalsSection />
              </motion.div>

              {/* Recent Activity Section - Mobile Optimized */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full"
              >
                <RecentActivity />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

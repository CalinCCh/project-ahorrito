"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Target, Plus, Search, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SavingsDashboard, SavingsDashboardRef } from "@/components/savings/SavingsDashboard";

export default function SavingsPage() {
  const dashboardRef = useRef<SavingsDashboardRef>(null);

  const handleNewGoal = () => {
    dashboardRef.current?.openCreateForm();
  };
  return (
    <div className="relative min-h-screen">
      {/* Enhanced Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/30" />
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-50/40 via-transparent to-cyan-50/30" />

        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-purple-400/8 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-cyan-400/8 rounded-full blur-xl animate-pulse delay-2000" />
        <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-indigo-400/10 rounded-full blur-lg animate-pulse delay-3000" />
      </div>{" "}
      <div className="relative z-10">
        <div className="container mx-auto px-4 lg:px-6 py-6 space-y-6">
          {/* Modern Header Container - Same style as overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-lg shadow-black/5 overflow-hidden"
          >
            {/* Gradient Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 via-green-50/30 to-teal-50/40" />

            <div className="relative p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left side - Title and description */}
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg"
                  >
                    <PiggyBank className="w-6 h-6 text-white" />
                  </motion.div>

                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                      Savings Goals
                    </h1>
                    <p className="text-slate-600 mt-1">
                      Track your progress and achieve your financial dreams
                    </p>
                  </div>
                </div>

                {/* Right side - Search and action */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600 w-5 h-5" />
                    <Input
                      placeholder="Search savings goals..."
                      className="pl-10 bg-white/60 backdrop-blur-sm border-white/40 focus:bg-white/80 transition-all duration-200 w-64"
                    />
                  </div>

                  <Button
                    onClick={handleNewGoal}
                    variant="outline"
                    className="bg-white/60 backdrop-blur-sm border-white/40 hover:bg-white/80 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Goal
                  </Button>
                </div>
              </div>
            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute top-2 right-2 w-12 h-12 bg-gradient-to-br from-emerald-400/10 to-green-400/10 rounded-full blur-xl animate-pulse" />
          </motion.div>

          {/* Savings Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SavingsDashboard ref={dashboardRef} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

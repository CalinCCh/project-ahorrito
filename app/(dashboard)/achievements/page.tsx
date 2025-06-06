"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AchievementsDashboard } from "@/components/achievements/AchievementsDashboard";

export default function AchievementsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  return (
    <div className="relative min-h-screen">
      {/* Enhanced Background */}
      <div className="fixed inset-0 -z-10">
        {" "}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-amber-50/50 to-orange-100/30" />
        <div className="absolute inset-0 bg-gradient-to-tl from-orange-50/40 via-transparent to-yellow-50/30" />
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-amber-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-orange-400/8 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-yellow-400/8 rounded-full blur-xl animate-pulse delay-2000" />
        <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-amber-400/10 rounded-full blur-lg animate-pulse delay-3000" />
        {/* Achievement sparkles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-500" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-amber-400 rounded-full animate-ping delay-1500" />
        <div className="absolute top-1/2 left-1/5 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping delay-2500" />
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
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 via-orange-50/30 to-red-50/40" />

            <div className="relative p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left side - Title and description */}
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg"
                  >
                    <Trophy className="w-6 h-6 text-white" />
                  </motion.div>

                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                      Achievements
                    </h1>
                    <p className="text-slate-600 mt-1">
                      Track your progress and unlock new milestones
                    </p>
                  </div>
                </div>

                {/* Right side - filters and action */}
                <div className="flex items-center gap-3">
                  {/* Filter buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={activeFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter("all")}
                      className={activeFilter === "all"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-white/60 backdrop-blur-sm border-white/40 hover:bg-white/80 transition-all duration-200"
                      }
                    >
                      All
                    </Button>
                    <Button
                      variant={activeFilter === "completed" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter("completed")}
                      className={activeFilter === "completed"
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-white/60 backdrop-blur-sm border-white/40 hover:bg-white/80 transition-all duration-200"
                      }
                    >
                      Completed
                    </Button>
                    <Button
                      variant={activeFilter === "in-progress" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter("in-progress")}
                      className={activeFilter === "in-progress"
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-white/60 backdrop-blur-sm border-white/40 hover:bg-white/80 transition-all duration-200"
                      }
                    >
                      In Progress
                    </Button>
                    <Button
                      variant={activeFilter === "locked" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter("locked")}
                      className={activeFilter === "locked"
                        ? "bg-slate-600 text-white hover:bg-slate-700"
                        : "bg-white/60 backdrop-blur-sm border-white/40 hover:bg-white/80 transition-all duration-200"
                      }
                    >
                      Locked
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute top-2 right-2 w-12 h-12 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-xl animate-pulse" />
          </motion.div>

          {/* Achievements Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AchievementsDashboard filter={activeFilter} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

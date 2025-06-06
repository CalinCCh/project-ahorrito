"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  Award,
  Crown,
  Zap,
  Target,
} from "lucide-react";
import { AchievementCard } from "./AchievementCard";
import {
  useGetAchievements,
  useGetUserLevel,
  useGetAchievementStats,
  useCheckAchievements,
} from "@/features/api/use-achievements";
// Type definitions
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  xpReward: number;
  badgeIcon: string;
  badgeColor: string;
  requirements: string;
  isSecret: string;
  createdAt: string;
  progress: number;
  currentValue: number;
  targetValue: number;
  completedAt: string | null;
  unlockedAt: string | null;
  isCompleted: boolean;
  isUnlocked: boolean;
  progressPercentage: number;
}

interface UserLevel {
  level: number;
  totalXp: number;
  xpForNextLevel: number;
  xpProgress: number;
  xpNeeded: number;
  progressPercentage: number;
}

interface AchievementStats {
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
  recentAchievements: {
    name: string;
    badgeIcon: string;
    badgeColor: string;
    xpReward: number;
    completedAt: Date;
  }[];
}

export function AchievementsDashboard({ filter = "all" }: { filter?: string }) {
  const { data: achievements = [], isLoading: achievementsLoading } =
    useGetAchievements();
  const { data: userLevel, isLoading: levelLoading } = useGetUserLevel();
  const { data: stats, isLoading: statsLoading } = useGetAchievementStats();
  const checkAchievements = useCheckAchievements();

  // Filter achievements based on the filter prop
  const filteredAchievements = useMemo(() => {
    let filtered = achievements as Achievement[];

    // Status filter
    if (filter === "completed") {
      filtered = filtered.filter((a: Achievement) => a.isCompleted);
    } else if (filter === "in-progress") {
      filtered = filtered.filter((a: Achievement) => {
        return a.isUnlocked && !a.isCompleted && a.progress > 0;
      });
    } else if (filter === "locked") {
      filtered = filtered.filter(
        (a: Achievement) =>
          !a.isUnlocked || (a.isUnlocked && !a.isCompleted && a.progress === 0)
      );
    }

    return filtered;
  }, [achievements, filter]);
  const completedAchievements = (achievements as Achievement[]).filter(
    (a: Achievement) => a.isCompleted
  );

  if (achievementsLoading || levelLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <motion.div
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-slate-600 font-medium">Loading achievements...</p>
        </div>
      </div>
    );
  }

  const totalAchievements = achievements.length;
  const completionPercentage =
    totalAchievements > 0
      ? (completedAchievements.length / totalAchievements) * 100
      : 0;
  return (
    <div className="space-y-8">
      {/* Stats Cards Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {" "}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Level Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Level</h3>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold">
                {(userLevel as UserLevel)?.level || 1}
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm opacity-90">
                  <span>{(userLevel as UserLevel)?.xpProgress || 0} XP</span>
                  <span>
                    {(userLevel as UserLevel)?.xpForNextLevel || 100} XP
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <motion.div
                    className="bg-white rounded-full h-2"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (userLevel as UserLevel)?.progressPercentage || 0
                      }%`,
                    }}
                    transition={{ delay: 0.5, duration: 1 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Total XP Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Total XP</h3>
            </div>
            <p className="text-3xl font-bold">
              {(userLevel as UserLevel)?.totalXp?.toLocaleString() || 0}
            </p>
            <p className="text-sm opacity-90 mt-1">Experience Points</p>
          </motion.div>

          {/* Completion Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Completed</h3>
            </div>
            <p className="text-3xl font-bold">
              {completedAchievements.length}/{totalAchievements}
            </p>
            <p className="text-sm opacity-90 mt-1">
              {Math.round(completionPercentage)}% Complete
            </p>
          </motion.div>

          {/* Recent Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Recent</h3>
            </div>
            <p className="text-3xl font-bold">
              {(stats as AchievementStats)?.recentAchievements?.length || 0}
            </p>
            <p className="text-sm opacity-90 mt-1">This Week</p>
          </motion.div>
        </div>
      </motion.div>


      {/* Achievements Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <AnimatePresence mode="wait">
          {filteredAchievements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                No achievements available
              </h3>
              <p className="text-slate-500">
                Check back later for new achievements to unlock
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredAchievements.map(
                (achievement: Achievement, index: number) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    index={index}
                  />
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

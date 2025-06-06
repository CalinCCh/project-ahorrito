"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Crown,
  Flame,
  Shield,
  Receipt,
  Clock,
  TrendingUp,
  Calendar,
  Star,
  Target,
  Award,
  Lock,
  Sparkles,
} from "lucide-react";

// Icon mapping for achievement badges
const iconMap = {
  Trophy,
  Crown,
  Flame,
  Shield,
  Receipt,
  Clock,
  TrendingUp,
  Calendar,
  Star,
  Target,
  Award,
  Lock,
  Sparkles,
};

// Color mapping for badge colors
const colorMap = {
  blue: "from-blue-500 to-cyan-500",
  gold: "from-yellow-500 to-amber-500",
  orange: "from-orange-500 to-red-500",
  green: "from-emerald-500 to-teal-500",
  purple: "from-purple-500 to-violet-500",
  pink: "from-pink-500 to-rose-500",
  gray: "from-gray-400 to-slate-500",
};

// Category color mapping for distinct category badges
const categoryColorMap = {
  savings: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  budget: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  transactions: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  consistency: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  default: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  },
};

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  xpReward: number;
  badgeIcon: string;
  badgeColor: string;
  progress: number;
  currentValue: number;
  targetValue: number;
  completedAt: string | null;
  unlockedAt: string | null;
  isCompleted: boolean;
  isUnlocked: boolean;
  progressPercentage: number;
  isSecret: string; // stored as "true"/"false" string in DB
  requirements: string;
  createdAt: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  index: number;
}

export function AchievementCard({ achievement, index }: AchievementCardProps) {
  const Icon = iconMap[achievement.badgeIcon as keyof typeof iconMap] || Trophy;
  const gradientColor =
    colorMap[achievement.badgeColor as keyof typeof colorMap] || colorMap.blue;
  const isLocked = !achievement.isUnlocked;
  const isCompleted = achievement.isCompleted;
  const isSecret = achievement.isSecret === "true" && !achievement.isUnlocked;

  // Get category colors
  const categoryColors =
    categoryColorMap[achievement.category as keyof typeof categoryColorMap] ||
    categoryColorMap.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        "relative group overflow-hidden rounded-2xl transition-all duration-300",
        "border-2 bg-gradient-to-br from-white/80 to-slate-50/50 backdrop-blur-sm",
        isCompleted
          ? "border-yellow-300/60 shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-500/30"
          : isLocked
          ? "border-slate-200/60 shadow-sm hover:shadow-md"
          : "border-blue-200/60 shadow-md hover:shadow-lg hover:shadow-blue-500/20",
        "hover:scale-[1.02] cursor-pointer"
      )}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-transparent to-slate-900" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Completed glow effect */}
      {isCompleted && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 opacity-50"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      <div className="relative p-6 space-y-4">
        {/* Header with badge and category */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Achievement Badge */}
            <motion.div
              className={cn(
                "relative p-3 rounded-xl shadow-lg",
                isCompleted
                  ? `bg-gradient-to-br ${gradientColor} shadow-yellow-500/30`
                  : isLocked
                  ? "bg-gradient-to-br from-gray-400 to-slate-500"
                  : `bg-gradient-to-br ${gradientColor} opacity-70`
              )}
              whileHover={{
                scale: 1.1,
                rotate: isCompleted ? [0, -5, 5, 0] : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              {isSecret ? (
                <Lock className="size-6 text-white drop-shadow-lg" />
              ) : (
                <Icon className="size-6 text-white drop-shadow-lg" />
              )}

              {/* Sparkle effect for completed achievements */}
              {isCompleted && (
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="size-4 text-yellow-300 drop-shadow-lg" />
                </motion.div>
              )}
            </motion.div>{" "}
            <div className="space-y-1">
              <span
                className={cn(
                  "inline-block px-2 py-1 text-xs font-medium rounded-full",
                  categoryColors.bg,
                  categoryColors.text,
                  categoryColors.border,
                  "border"
                )}
              >
                {achievement.category}
              </span>
            </div>
          </div>

          {/* XP Reward */}
          <div
            className={cn(
              "px-3 py-1 rounded-full text-sm font-bold",
              isCompleted
                ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            )}
          >
            +{achievement.xpReward} XP
          </div>
        </div>

        {/* Achievement Info */}
        <div className="space-y-2">
          <h3
            className={cn(
              "text-lg font-bold transition-colors",
              isCompleted
                ? "text-yellow-700"
                : isLocked
                ? "text-slate-500"
                : "text-slate-800"
            )}
          >
            {isSecret ? "Secret Achievement" : achievement.name}
          </h3>

          <p
            className={cn(
              "text-sm leading-relaxed",
              isCompleted
                ? "text-slate-600"
                : isLocked
                ? "text-slate-400"
                : "text-slate-600"
            )}
          >
            {isSecret
              ? "Complete specific actions to unlock this mystery achievement!"
              : achievement.description}
          </p>
        </div>

        {/* Progress Section */}
        {!isSecret && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">
                Progress: {achievement.currentValue}/{achievement.targetValue}
              </span>
              <span
                className={cn(
                  "font-bold",
                  isCompleted ? "text-yellow-600" : "text-blue-600"
                )}
              >
                {Math.round(achievement.progressPercentage)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                  isCompleted
                    ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${achievement.progressPercentage}%` }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.8,
                  ease: "easeOut",
                }}
              />

              {/* Shimmer effect */}
              {!isCompleted && achievement.progressPercentage > 0 && (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: [-100, 200] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ width: "100px" }}
                />
              )}
            </div>
          </div>
        )}

        {/* Completion Date */}
        {isCompleted && achievement.completedAt && (
          <div className="pt-2 border-t border-yellow-200">
            <p className="text-xs text-yellow-600 font-medium">
              Completed on{" "}
              {new Date(achievement.completedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

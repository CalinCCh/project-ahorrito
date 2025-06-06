"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Crown, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementUnlockedProps {
  achievement: {
    id: number;
    name: string;
    description: string;
    xp_reward: number;
    badge_icon: string;
    badge_color: string;
  } | null;
  isVisible: boolean;
  onClose: () => void;
}

const iconMap = {
  Trophy,
  Crown,
  Star,
  Sparkles,
};

const colorMap = {
  blue: "from-blue-500 to-cyan-500",
  gold: "from-yellow-500 to-amber-500",
  orange: "from-orange-500 to-red-500",
  green: "from-emerald-500 to-teal-500",
  purple: "from-purple-500 to-violet-500",
  pink: "from-pink-500 to-rose-500",
};

export function AchievementUnlocked({
  achievement,
  isVisible,
  onClose,
}: AchievementUnlockedProps) {
  useEffect(() => {
    if (isVisible && achievement) {
      // Confetti celebration
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 1000,
      };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Golden confetti from the left
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#FFD700", "#FFA500", "#FF6347", "#87CEEB"],
        });

        // Golden confetti from the right
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#FFD700", "#FFA500", "#FF6347", "#87CEEB"],
        });
      }, 250);

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isVisible, achievement, onClose]);

  if (!achievement) return null;

  const Icon =
    iconMap[achievement.badge_icon as keyof typeof iconMap] || Trophy;
  const gradientColor =
    colorMap[achievement.badge_color as keyof typeof colorMap] || colorMap.blue;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
            onClick={onClose}
          />

          {/* Achievement Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl pointer-events-auto">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>

              {/* Content */}
              <div className="text-center space-y-6">
                {/* Achievement Unlocked Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 10 }}
                  className="mx-auto w-fit"
                >
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    🏆 ACHIEVEMENT UNLOCKED!
                  </div>
                </motion.div>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: "spring", damping: 8 }}
                  className="mx-auto relative"
                >
                  <div
                    className={cn(
                      "w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl",
                      `bg-gradient-to-br ${gradientColor}`
                    )}
                  >
                    <Icon className="w-12 h-12 text-white drop-shadow-lg" />
                  </div>

                  {/* Sparkle effects */}
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </motion.div>

                  <motion.div
                    animate={{
                      rotate: [360, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                    className="absolute -bottom-1 -left-2"
                  >
                    <Star className="w-5 h-5 text-blue-400" />
                  </motion.div>
                </motion.div>

                {/* Achievement Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <h2 className="text-2xl font-bold text-slate-800">
                    {achievement.name}
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    {achievement.description}
                  </p>
                </motion.div>

                {/* XP Reward */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-slate-800">
                      +{achievement.xp_reward} XP
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Experience Points Earned!
                  </p>
                </motion.div>

                {/* Continue Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Continue
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

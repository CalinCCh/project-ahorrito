"use client";

import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface VipBadgeProps {
  size?: "sm" | "md" | "lg";
  showDays?: boolean;
  daysRemaining?: number;
  className?: string;
  variant?: "compact" | "standalone";
}

const sizeClasses = {
  sm: {
    container: "px-2 py-0.5 gap-1",
    icon: "size-3",
    text: "text-xs",
  },
  md: {
    container: "px-3 py-1 gap-1.5",
    icon: "size-4",
    text: "text-sm",
  },
  lg: {
    container: "px-4 py-2 gap-2",
    icon: "size-5",
    text: "text-base",
  },
};

export function VipBadge({
  size = "md",
  showDays = false,
  daysRemaining = 0,
  className,
  variant = "compact"
}: VipBadgeProps) {
  const classes = sizeClasses[size];

  if (variant === "standalone") {
    return (
      <motion.div
        className={cn(
          "inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-full font-bold text-white shadow-lg shadow-amber-500/25 ring-2 ring-white/50",
          classes.container,
          className
        )}
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
        whileHover={{ scale: 1.05, rotate: 2 }}
      >
        <div className="relative">
          <Crown className={cn("text-white drop-shadow-sm", classes.icon)} />
          <motion.div
            className="absolute inset-0"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className={cn("text-white/80", classes.icon)} />
          </motion.div>
        </div>
        <span className={cn("text-white drop-shadow-sm font-extrabold tracking-wide", classes.text)}>
          VIP{showDays && daysRemaining > 0 ? ` (${daysRemaining}d)` : ""}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        "inline-flex items-center bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-full font-bold text-white shadow-md shadow-amber-500/20",
        classes.container,
        className
      )}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
    >
      <Crown className={cn("text-white", classes.icon)} />
      <span className={cn("text-white font-extrabold", classes.text)}>
        VIP{showDays && daysRemaining > 0 ? ` (${daysRemaining}d)` : ""}
      </span>
    </motion.div>
  );
}
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ModernToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "from-emerald-500/10 to-green-500/5",
    borderColor: "border-emerald-200/50",
    iconColor: "text-emerald-600",
    textColor: "text-emerald-800",
  },
  error: {
    icon: AlertCircle,
    bgColor: "from-red-500/10 to-rose-500/5",
    borderColor: "border-red-200/50",
    iconColor: "text-red-600",
    textColor: "text-red-800",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "from-amber-500/10 to-yellow-500/5",
    borderColor: "border-amber-200/50",
    iconColor: "text-amber-600",
    textColor: "text-amber-800",
  },
  info: {
    icon: Info,
    bgColor: "from-blue-500/10 to-cyan-500/5",
    borderColor: "border-blue-200/50",
    iconColor: "text-blue-600",
    textColor: "text-blue-800",
  },
};

export const ModernToast = ({ toast, onClose }: ModernToastProps) => {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative overflow-hidden rounded-xl border backdrop-blur-xl shadow-lg max-w-sm",
        "bg-gradient-to-br",
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className={cn("mt-0.5", config.iconColor)}
          >
            <Icon className="size-5" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <motion.h4
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={cn("font-semibold text-sm", config.textColor)}
            >
              {toast.title}
            </motion.h4>
            {toast.description && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={cn("text-xs mt-1 opacity-80", config.textColor)}
              >
                {toast.description}
              </motion.p>
            )}
          </div>

          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onClose(toast.id)}
            className={cn(
              "rounded-lg p-1 transition-colors hover:bg-black/5",
              config.textColor,
              "opacity-60 hover:opacity-100"
            )}
          >
            <X className="size-4" />
          </motion.button>
        </div>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: toast.duration || 4, ease: "linear" }}
        className={cn(
          "absolute bottom-0 left-0 h-1 bg-gradient-to-r origin-left",
          config.iconColor.replace("text-", "from-"),
          config.iconColor.replace("text-", "to-").replace("600", "400")
        )}
        style={{ width: "100%" }}
        onAnimationComplete={() => onClose(toast.id)}
      />

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

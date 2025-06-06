"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8", 
  lg: "w-12 h-12"
};

export function LoadingSpinner({ 
  size = "md", 
  className,
  text 
}: LoadingSpinnerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("flex flex-col items-center justify-center", className)}
    >
      <motion.div
        className={cn(
          "border-3 border-blue-200 border-t-blue-500 rounded-full",
          sizeClasses[size]
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-sm text-slate-600 font-medium"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
}

export function PageLoadingSpinner({ text }: { text?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center w-full h-full min-h-[200px]"
    >
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-lg">
        <LoadingSpinner size="md" text={text} />
      </div>
    </motion.div>
  );
}
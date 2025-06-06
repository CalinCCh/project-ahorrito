"use client";

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  filterArea?: ReactNode;
  actions?: ReactNode;
  className?: string;
  gradient?: boolean;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  filterArea,
  actions,
  className = "",
  gradient = true,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative ${className}`}
    >
      {/* Modern Glass Container */}
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-lg shadow-black/5 overflow-hidden">
        {/* Gradient Background Overlay */}
        {gradient && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 via-blue-50/40 to-indigo-50/60" />
        )}

        {/* Animated Border Glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-sm -z-10" />

        <div className="relative p-2 lg:p-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
            {/* Title Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 min-w-0"
            >
              <div className="flex items-center gap-3 mb-0">
                {Icon && (
                  <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-500/20">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                )}
                <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                  {title}
                </h1>
              </div>
              {description && (
                <p className="text-slate-600 text-sm font-medium">
                  {description}
                </p>
              )}
            </motion.div>

            {/* Filter Area */}
            {filterArea && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center w-full lg:w-auto"
              >
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 border border-white/40">
                  {filterArea}
                </div>
              </motion.div>
            )}

            {/* Actions Section */}
            {actions && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 w-full lg:w-auto"
              >
                {actions}
              </motion.div>
            )}
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl animate-pulse delay-1000" />
      </div>
    </motion.div>
  );
}

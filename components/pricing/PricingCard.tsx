"use client";

import React, { memo, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Check,
  Crown,
  Zap,
  Calendar,
  Star,
  Sparkles,
  TrendingUp,
  Shield,
  BarChart3,
  Brain,
  Bell,
  Download,
  Users,
  type LucideIcon,
} from "lucide-react";

interface PricingCardProps {
  name: string;
  description: string;
  price: string;
  priceId: string;
  onSubscribe: (priceId: string) => void;
  isLoading?: boolean;
  variant?: "standard" | "featured" | "premium";
  popularityBadge?: string;
  icon?: LucideIcon;
}

const getPlanType = (planName: string): "weekly" | "monthly" | "annual" => {
  const name = planName.toLowerCase();
  if (name.includes("weekly")) return "weekly";
  if (name.includes("monthly")) return "monthly";
  if (name.includes("annual")) return "annual";
  return "monthly"; // fallback
};

const getFeaturesByPlan = (planName: string) => {
  const baseFeatures = [
    { icon: BarChart3, text: "Basic Analytics", included: true },
    { icon: TrendingUp, text: "Transaction Tracking", included: true },
    { icon: Shield, text: "Bank-Level Security", included: true },
  ];

  const proFeatures = [
    { icon: Brain, text: "AI Categorization", included: true },
    { icon: Sparkles, text: "Smart Insights", included: true },
    { icon: Bell, text: "Custom Alerts", included: true },
    { icon: Download, text: "Export Data", included: true },
    { icon: Users, text: "Multi-User Access", included: true },
  ];

  const planType = getPlanType(planName);

  switch (planType) {
    case "weekly":
      return [...baseFeatures, ...proFeatures.slice(0, 2)];
    case "monthly":
      return [...baseFeatures, ...proFeatures];
    case "annual":
      return [
        ...baseFeatures,
        ...proFeatures,
        { icon: Crown, text: "Priority Support", included: true },
        { icon: Star, text: "Advanced Reports", included: true },
      ];
    default:
      return baseFeatures;
  }
};

const variantStyles = {
  standard: {
    container: "bg-white/70 border-slate-200/60 hover:border-blue-300/60",
    header: "bg-slate-50/50",
    price: "from-slate-700 to-slate-800",
    button: "bg-slate-800 hover:bg-slate-700 text-white",
    glow: "",
  },
  featured: {
    container:
      "bg-gradient-to-br from-blue-50/80 to-purple-50/80 border-blue-300/60 hover:border-purple-400/60 ring-2 ring-blue-200/50",
    header: "bg-gradient-to-r from-blue-500/10 to-purple-500/10",
    price: "from-blue-600 to-purple-600",
    button:
      "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg",
    glow: "shadow-blue-500/25",
  },
  premium: {
    container:
      "bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border-emerald-300/60 hover:border-teal-400/60 ring-2 ring-emerald-200/50",
    header: "bg-gradient-to-r from-emerald-500/10 to-teal-500/10",
    price: "from-emerald-600 to-teal-600",
    button:
      "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg",
    glow: "shadow-emerald-500/25",
  },
};

export const PricingCard = memo(function PricingCard({
  name,
  description,
  price,
  priceId,
  onSubscribe,
  isLoading,
  variant = "standard",
  popularityBadge,
  icon: IconComponent = Crown,
}: PricingCardProps) {
  const styles = useMemo(() => variantStyles[variant], [variant]);
  const features = useMemo(() => getFeaturesByPlan(name), [name]);
  const isFeatured = variant === "featured";
  const isPremium = variant === "premium";

  const handleSubscribe = useCallback(() => {
    onSubscribe(priceId);
  }, [onSubscribe, priceId]);

  const cardVariants = useMemo(
    () => ({
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      whileHover: { scale: 1.02 },
    }),
    []
  );

  const buttonVariants = useMemo(
    () => ({
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.98 },
    }),
    []
  );
  return (
    <motion.div
      className="relative h-full"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="whileHover"
      transition={{ duration: 0.2 }}
    >
      {/* Popularity Badge */}
      {popularityBadge && (
        <motion.div
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
          initial={{ opacity: 0, y: -10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div
            className={`px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg ${
              isFeatured
                ? "bg-gradient-to-r from-blue-500 to-purple-500"
                : isPremium
                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                : "bg-gradient-to-r from-orange-500 to-red-500"
            }`}
          >
            {popularityBadge}
          </div>
        </motion.div>
      )}

      {/* Main Card */}
      <motion.div
        className={`relative flex flex-col h-full backdrop-blur-sm border rounded-3xl shadow-xl transition-all duration-300 overflow-hidden ${styles.container} ${styles.glow}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Effects */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: isFeatured
              ? [
                  "radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                ]
              : isPremium
              ? [
                  "radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)",
                ]
              : undefined,
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        {/* Header */}
        <div
          className={`p-8 pb-6 ${styles.header} border-b border-slate-200/40`}
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              className={`p-3 rounded-2xl ${
                isFeatured
                  ? "bg-gradient-to-r from-blue-500 to-purple-500"
                  : isPremium
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : "bg-gradient-to-r from-slate-500 to-slate-600"
              } shadow-lg`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <IconComponent className="size-6 text-white" />
            </motion.div>
          </div>

          <h3 className="text-sm font-bold text-slate-800 text-center mb-2">
            {name}
          </h3>

          <div className="text-center mb-4">
            <motion.div
              className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${styles.price} bg-clip-text text-transparent`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {price}
            </motion.div>
          </div>

          <p className="text-slate-600 text-sm text-center leading-relaxed">
            {description}
          </p>
        </div>{" "}
        {/* Features */}
        <div className="flex-1 p-8">
          <ul
            className="space-y-4"
            role="list"
            aria-label={`${name} plan features`}
          >
            {features.map((feature, index) => (
              <motion.li
                key={feature.text}
                className="flex items-center gap-3 group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                whileHover={{ x: 4 }}
                role="listitem"
                aria-label={`${
                  feature.included ? "Included" : "Not included"
                }: ${feature.text}`}
              >
                <motion.div
                  className={`flex-shrink-0 p-1.5 rounded-lg ${
                    feature.included
                      ? isFeatured
                        ? "bg-gradient-to-r from-blue-100 to-purple-100"
                        : isPremium
                        ? "bg-gradient-to-r from-emerald-100 to-teal-100"
                        : "bg-green-100"
                      : "bg-slate-100"
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {feature.included ? (
                    <Check
                      className={`size-4 ${
                        isFeatured
                          ? "text-blue-600"
                          : isPremium
                          ? "text-emerald-600"
                          : "text-green-600"
                      }`}
                    />
                  ) : (
                    <feature.icon className="size-4 text-slate-400" />
                  )}
                </motion.div>
                <span
                  className={`font-medium ${
                    feature.included ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {feature.text}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>{" "}
        {/* CTA Button */}
        <div className="p-8 pt-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className={`w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 ${styles.button}`}
              onClick={handleSubscribe}
              disabled={isLoading}
              aria-label={`Subscribe to ${name} plan for ${price}`}
              role="button"
            >
              {isLoading ? (
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  Redirecting...
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center gap-2"
                  whileHover={{ gap: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <span>Get Started</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </motion.div>
              )}
            </Button>
          </motion.div>

          {/* Money back guarantee */}
          <motion.p
            className="text-xs text-slate-500 text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            30-day money back guarantee
          </motion.p>
        </div>
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.8 }}
        />
      </motion.div>
    </motion.div>
  );
});

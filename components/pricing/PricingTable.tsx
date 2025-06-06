"use client";

import React, { memo, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { plans } from "@/lib/stripe-plans";
import { PricingCard } from "./PricingCard";
import { Crown, Zap, Calendar, AlertCircle, X } from "lucide-react";

export const PricingTable = memo(function PricingTable() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [error, setError] = useState<string | null>(null);

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const handleSubscribe = useCallback(async (priceId: string) => {
    setLoadingId(priceId);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Error starting payment. Please try again.");
      }
    } catch (e) {
      setError(
        "Network or server error. Please check your connection and try again."
      );
    } finally {
      setLoadingId(null);
    }
  }, []);

  const getPlanType = useCallback((planName: string): "monthly" | "annual" => {
    // More robust plan identification using multiple indicators
    const name = planName.toLowerCase();
    if (
      name.includes("annual") ||
      name.includes("yearly") ||
      name.includes("year")
    ) {
      return "annual";
    }
    return "monthly"; // default fallback
  }, []);
  const getPopularityIcon = useCallback(
    (planName: string) => {
      const planType = getPlanType(planName);
      switch (planType) {
        case "monthly":
          return Crown;
        case "annual":
          return Calendar;
        default:
          return Crown;
      }
    },
    [getPlanType]
  );

  const getPopularityBadge = useCallback(
    (planName: string) => {
      const planType = getPlanType(planName);
      switch (planType) {
        case "monthly":
          return "Most Popular";
        case "annual":
          return "Best Value";
        default:
          return "";
      }
    },
    [getPlanType]
  );

  const getCardVariant = useCallback(
    (planName: string) => {
      const planType = getPlanType(planName);
      switch (planType) {
        case "monthly":
          return "featured";
        case "annual":
          return "premium";
        default:
          return "standard";
      }
    },
    [getPlanType]
  );

  const filteredPlans = useMemo(
    () => plans.filter((plan) => getPlanType(plan.name) === billingCycle),
    [billingCycle, getPlanType]
  );
  const toggleBillingCycle = useCallback(() => {
    setBillingCycle((prev) => (prev === "monthly" ? "annual" : "monthly"));
  }, []);

  const setMonthlyBilling = useCallback(() => {
    setBillingCycle("monthly");
  }, []);

  const setAnnualBilling = useCallback(() => {
    setBillingCycle("annual");
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 to-emerald-800 bg-clip-text text-transparent">
              Simple, Transparent
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-6">
            Start your financial journey today. Choose the plan that fits your
            needs and upgrade or downgrade anytime.
          </p>
        </motion.div>
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto mb-8"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="size-5 text-red-600 flex-shrink-0" />
              <span className="text-red-800 text-sm flex-1">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {" "}
          {plans.map((plan, index) => {
              const IconComponent = getPopularityIcon(plan.name);
              const popularityBadge = getPopularityBadge(plan.name);
              const variant = getCardVariant(plan.name);

              return (
                <motion.div
                  key={plan.priceId}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{
                    delay: 0.7 + index * 0.1,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100,
                  }}
                  whileHover={{ y: -8 }}
                >
                  <PricingCard
                    name={plan.name}
                    description={plan.description}
                    price={plan.price}
                    priceId={plan.priceId}
                    onSubscribe={handleSubscribe}
                    isLoading={loadingId === plan.priceId}
                    variant={variant}
                    popularityBadge={popularityBadge}
                    icon={IconComponent}
                  />
                </motion.div>
              );
            })}
        </motion.div>
        {/* Trust indicators */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <Crown className="size-4 text-white" />
              </div>
              <span className="text-slate-600 font-semibold">
                30-day money back
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Zap className="size-4 text-white" />
              </div>
              <span className="text-slate-600 font-semibold">
                Cancel anytime
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Calendar className="size-4 text-white" />
              </div>
              <span className="text-slate-600 font-semibold">
                No hidden fees
              </span>
            </div>
          </div>
        </motion.div>{" "}
      </div>
    </section>
  );
});

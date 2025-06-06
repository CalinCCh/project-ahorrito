"use client";

import { motion } from "framer-motion";
import { PricingTable } from "@/components/pricing/PricingTable";

export default function PricingPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/5 rounded-full blur-2xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-br from-emerald-400/10 to-cyan-400/5 rounded-full blur-2xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Reduced header spacing */}
      <div className="relative z-10 pt-12 pb-4">
      </div>

      {/* Main content - only pricing table */}
      <div className="relative z-10">
        <PricingTable />
      </div>
    </main>
  );
}

"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Brain,
  BarChart3,
  Shield,
  Zap,
  Target,
  Users,
  Clock,
  Download,
  CreditCard,
  PieChart,
  TrendingUp,
  Bell,
} from "lucide-react";

const features = [
  {
    category: "AI & Intelligence",
    icon: Brain,
    color: "from-purple-500 to-pink-500",
    items: [
      {
        icon: Brain,
        title: "Smart Categorization",
        description:
          "AI automatically categorizes transactions with 99% accuracy",
      },
      {
        icon: Target,
        title: "Predictive Analytics",
        description: "Forecast your spending patterns and budget needs",
      },
      {
        icon: Zap,
        title: "Smart Recommendations",
        description: "Get personalized savings tips and financial advice",
      },
    ],
  },
  {
    category: "Analytics & Insights",
    icon: BarChart3,
    color: "from-blue-500 to-cyan-500",
    items: [
      {
        icon: PieChart,
        title: "Advanced Charts",
        description: "Beautiful visualizations of your financial data",
      },
      {
        icon: TrendingUp,
        title: "Trend Analysis",
        description: "Track spending trends and identify patterns",
      },
      {
        icon: BarChart3,
        title: "Custom Reports",
        description: "Generate detailed financial reports on demand",
      },
    ],
  },
  {
    category: "Security & Trust",
    icon: Shield,
    color: "from-emerald-500 to-teal-500",
    items: [
      {
        icon: Shield,
        title: "Bank-Level Security",
        description: "256-bit encryption and SOC 2 compliance",
      },
      {
        icon: Users,
        title: "Multi-User Access",
        description: "Secure sharing with family members and advisors",
      },
      {
        icon: Clock,
        title: "Real-Time Sync",
        description: "Instant updates across all your devices",
      },
    ],
  },
  {
    category: "Premium Tools",
    icon: CreditCard,
    color: "from-orange-500 to-red-500",
    items: [
      {
        icon: Download,
        title: "Export Capabilities",
        description: "Export data to Excel, PDF, and CSV formats",
      },
      {
        icon: Bell,
        title: "Smart Alerts",
        description: "Custom notifications for budgets and goals",
      },
      {
        icon: CreditCard,
        title: "Multiple Accounts",
        description: "Connect unlimited bank accounts and cards",
      },
    ],
  },
];

export function PricingFeatures() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 backdrop-blur-sm mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="size-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">
              Premium Features
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
              Everything You Need for
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Financial Success
            </span>
          </h2>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Unlock the full potential of your financial management with our
            comprehensive suite of premium tools and features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {features.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              className="relative group"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: categoryIndex * 0.2, duration: 0.8 }}
            >
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-xl group-hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Background gradient */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  whileHover={{ scale: 1.02 }}
                />

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <motion.div
                    className={`p-3 rounded-2xl bg-gradient-to-r ${category.color} shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <category.icon className="size-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      {category.category}
                    </h3>
                  </div>
                </div>

                {/* Features list */}
                <div className="space-y-6">
                  {category.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.title}
                      className="flex items-start gap-4 group/item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{
                        delay: categoryIndex * 0.2 + itemIndex * 0.1 + 0.3,
                        duration: 0.5,
                      }}
                      whileHover={{ x: 4 }}
                    >
                      <motion.div
                        className="flex-shrink-0 p-2 rounded-xl bg-slate-100 group-hover/item:bg-slate-200 transition-colors duration-200"
                        whileHover={{ scale: 1.1 }}
                      >
                        <item.icon className="size-5 text-slate-600" />
                      </motion.div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-1 group-hover/item:text-blue-700 transition-colors duration-200">
                          {item.title}
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Decorative elements */}
                <motion.div
                  className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="inline-block bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200/50">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Ready to unlock these features?
            </h3>
            <p className="text-slate-600 mb-6">
              Choose your plan below and start your journey to financial freedom
              today.
            </p>
            <motion.div
              className="flex items-center justify-center gap-2 text-blue-600"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="font-semibold">Scroll down to see plans</span>
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ↓
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Crown, Sparkles, TrendingUp, Shield } from "lucide-react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

export function PricingHero() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const stats = [
    { number: 10000, suffix: "+", label: "Happy Users" },
    { number: 99.9, suffix: "%", label: "Uptime" },
    { number: 4.9, suffix: "/5", label: "Rating" },
    { number: 24, suffix: "/7", label: "Support" },
  ];

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 backdrop-blur-sm mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <Crown className="size-4 text-blue-600" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Premium Financial Management
            </span>
            <Sparkles className="size-4 text-purple-600" />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Choose Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent relative">
              Financial Future
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl rounded-lg"
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.02, 1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Unlock premium features and take control of your finances with our
            <span className="font-semibold text-blue-700">
              {" "}
              AI-powered insights
            </span>
            ,
            <span className="font-semibold text-purple-700">
              {" "}
              advanced analytics
            </span>
            , and
            <span className="font-semibold text-emerald-700">
              {" "}
              intelligent automation
            </span>
            .
          </motion.p>

          {/* Key Benefits */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {[
              {
                icon: TrendingUp,
                text: "Advanced Analytics",
                color: "from-emerald-500 to-teal-500",
              },
              {
                icon: Shield,
                text: "Bank-Level Security",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Sparkles,
                text: "AI-Powered Insights",
                color: "from-purple-500 to-pink-500",
              },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.text}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                style={{ transitionDelay: `${0.8 + index * 0.1}s` }}
              >
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${benefit.color}`}
                >
                  <benefit.icon className="size-4 text-white" />
                </div>
                <span className="font-semibold text-slate-700">
                  {benefit.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  <div className="text-3xl sm:text-4xl font-bold mb-2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {inView ? <CountUp end={stat.number} /> : "0"}
                      {stat.suffix}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-600">
                    {stat.label}
                  </div>
                </div>

                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

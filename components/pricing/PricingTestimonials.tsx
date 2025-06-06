"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star, Quote, TrendingUp, Shield, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Financial Advisor",
    company: "Goldman Sachs",
    avatar: "/avatars/sarah.jpg",
    content:
      "Project Ahorrito transformed how I manage my clients' portfolios. The AI insights are incredibly accurate and have helped me increase returns by 23%.",
    rating: 5,
    metric: "+23% Returns",
    icon: TrendingUp,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Investment Manager",
    company: "JPMorgan Chase",
    avatar: "/avatars/marcus.jpg",
    content:
      "The risk analysis features are phenomenal. I can now make informed decisions faster than ever before. It's like having a team of analysts at my fingertips.",
    rating: 5,
    metric: "50% Faster Decisions",
    icon: Shield,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: 3,
    name: "Emily Watson",
    role: "Portfolio Director",
    company: "Morgan Stanley",
    avatar: "/avatars/emily.jpg",
    content:
      "Project Ahorrito's automation features saved me 15 hours per week. The interface is intuitive and the data visualization is simply outstanding.",
    rating: 5,
    metric: "15h/week Saved",
    icon: Zap,
    gradient: "from-purple-500 to-pink-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export function PricingTestimonials() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-white to-purple-50/50" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-6 shadow-lg"
          >
            <Quote className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Financial Leaders
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of financial professionals who've transformed their
            workflow with Project Ahorrito
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => {
            const IconComponent = testimonial.icon;

            return (
              <motion.div
                key={testimonial.id}
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  y: -5,
                  transition: { type: "spring", stiffness: 300 },
                }}
                className="group relative"
              >
                {/* Testimonial Card */}
                <div className="relative h-full bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 overflow-hidden">
                  {/* Animated background gradient */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    initial={false}
                  />

                  {/* Floating decoration */}
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${testimonial.gradient} rounded-full opacity-10 blur-xl`}
                  />

                  {/* Rating Stars */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Content */}
                  <blockquote className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Metric Badge */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${testimonial.gradient} rounded-full mb-6 shadow-lg`}
                  >
                    <IconComponent className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">
                      {testimonial.metric}
                    </span>
                  </motion.div>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative"
                    >
                      <Avatar className="w-12 h-12 ring-2 ring-white shadow-lg">
                        <AvatarImage
                          src={testimonial.avatar}
                          alt={testimonial.name}
                        />
                        <AvatarFallback
                          className={`bg-gradient-to-br ${testimonial.gradient} text-white font-semibold`}
                        >
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      {/* Online indicator */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg"
                      />
                    </motion.div>

                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {testimonial.role}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                SOC 2 Compliant
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                4.9/5 Rating
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                99.9% Uptime
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

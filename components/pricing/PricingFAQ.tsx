"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState } from "react";
import {
  Plus,
  Minus,
  HelpCircle,
  Shield,
  CreditCard,
  Smartphone,
  Lock,
  RefreshCw,
  Users,
  BarChart3,
} from "lucide-react";

const faqs = [
  {
    id: 1,
    question: "How does Project Ahorrito's AI-powered analysis work?",
    answer:
      "Our advanced AI algorithms analyze market trends, historical data, and real-time financial indicators to provide personalized investment recommendations. The system continuously learns from market patterns and user preferences to improve accuracy over time.",
    icon: BarChart3,
    category: "Technology",
  },
  {
    id: 2,
    question: "Is my financial data secure with Project Ahorrito?",
    answer:
      "Absolutely. We use bank-grade encryption (AES-256), multi-factor authentication, and are SOC 2 Type II compliant. Your data is stored in secure, geographically distributed servers with 24/7 monitoring and regular security audits.",
    icon: Shield,
    category: "Security",
  },
  {
    id: 3,
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes, you can cancel your subscription at any time without any cancellation fees. Your access will continue until the end of your current billing period, and you can export all your data before cancellation.",
    icon: RefreshCw,
    category: "Billing",
  },
  {
    id: 4,
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, bank transfers, and cryptocurrency payments (Bitcoin, Ethereum). All payments are processed securely through Stripe.",
    icon: CreditCard,
    category: "Payment",
  },
  {
    id: 5,
    question: "Is there a mobile app available?",
    answer:
      "Yes! Our mobile app is available for both iOS and Android devices. It includes all the features of the web platform with additional mobile-specific tools like push notifications for market alerts and portfolio updates.",
    icon: Smartphone,
    category: "Platform",
  },
  {
    id: 6,
    question: "How many team members can access my account?",
    answer:
      "The number of team members depends on your plan. Starter allows 1 user, Professional allows up to 5 users, and Enterprise offers unlimited users with advanced role management and permissions.",
    icon: Users,
    category: "Plans",
  },
  {
    id: 7,
    question: "Do you offer customer support?",
    answer:
      "Yes! We provide 24/7 email support for all plans, live chat for Professional and Enterprise plans, and dedicated account managers for Enterprise customers. We also have an extensive knowledge base and video tutorials.",
    icon: HelpCircle,
    category: "Support",
  },
  {
    id: 8,
    question: "How do you ensure data privacy?",
    answer:
      "We are GDPR and CCPA compliant, never sell your data to third parties, and allow you to delete your account and all associated data at any time. We also provide detailed privacy controls and data export options.",
    icon: Lock,
    category: "Privacy",
  },
];

const categories = [
  "All",
  "Technology",
  "Security",
  "Billing",
  "Payment",
  "Platform",
  "Plans",
  "Support",
  "Privacy",
];

export function PricingFAQ() {
  const [openItem, setOpenItem] = useState<number | null>(1);
  const [activeCategory, setActiveCategory] = useState("All");
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const filteredFaqs = faqs.filter(
    (faq) => activeCategory === "All" || faq.category === activeCategory
  );

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/50" />

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/5 rounded-full blur-2xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-emerald-400/10 to-cyan-400/5 rounded-full blur-2xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={inView ? { scale: 1, rotate: 0 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg"
          >
            <HelpCircle className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about Project Ahorrito. Can't find the
            answer you're looking for?
            <span className="text-indigo-600 font-semibold">
              {" "}
              Contact our support team
            </span>
            .
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.4 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                  : "bg-white/60 backdrop-blur-sm text-gray-600 hover:bg-white/80 border border-gray-200/50"
              }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {filteredFaqs.map((faq, index) => {
              const IconComponent = faq.icon;
              const isOpen = openItem === faq.id;

              return (
                <motion.div
                  key={`${activeCategory}-${faq.id}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="group"
                >
                  <div
                    className={`relative bg-white/80 backdrop-blur-xl rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? "border-indigo-200 shadow-xl shadow-indigo-100/50"
                        : "border-gray-200/50 shadow-lg hover:shadow-xl hover:border-indigo-100"
                    }`}
                  >
                    {/* Animated background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      initial={false}
                    />

                    {/* Question Button */}
                    <motion.button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full p-6 flex items-center gap-4 text-left relative z-10"
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* Icon */}
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isOpen
                            ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"
                            : "bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-purple-600"
                        }`}
                      >
                        <IconComponent
                          className={`w-6 h-6 transition-colors duration-300 ${
                            isOpen
                              ? "text-white"
                              : "text-gray-600 group-hover:text-white"
                          }`}
                        />
                      </motion.div>

                      {/* Question Text */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {faq.question}
                        </h3>
                        <span className="text-sm text-indigo-600 font-medium">
                          {faq.category}
                        </span>
                      </div>

                      {/* Toggle Icon */}
                      <motion.div
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          isOpen
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                        }`}
                      >
                        {isOpen ? (
                          <Minus className="w-5 h-5" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </motion.div>
                    </motion.button>

                    {/* Answer */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="relative z-10"
                        >
                          <div className="px-6 pb-6 pt-0">
                            <motion.div
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -10, opacity: 0 }}
                              transition={{ delay: 0.1, duration: 0.3 }}
                              className="pl-16"
                            >
                              <p className="text-gray-600 leading-relaxed">
                                {faq.answer}
                              </p>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="relative bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl overflow-hidden">
            {/* Background decoration */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-20 -left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"
            />

            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2">
                Still have questions?
              </h3>
              <p className="text-indigo-100 mb-6">
                Our team is here to help you 24/7
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <HelpCircle className="w-5 h-5" />
                Contact Support
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

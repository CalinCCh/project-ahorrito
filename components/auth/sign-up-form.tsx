"use client";

import React, { useState } from "react";
import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Zap, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function SignUpForm() {
  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6 sm:p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="relative">
              <Image
                src="/logo2.svg"
                alt="Ahorrito Logo"
                width={48}
                height={48}
                className="drop-shadow-lg"
              />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="w-4 h-4 text-blue-500" />
              </motion.div>
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ahorrito
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Personal Finance Hub
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
              Start your financial journey
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Join thousands managing their finances smarter
            </p>
          </motion.div>
        </div>

        {/* Benefits Preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 bg-blue-50/50 rounded-lg p-2">
            <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>Bank-level Security</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 bg-green-50/50 rounded-lg p-2">
            <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>Smart Analytics</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 bg-purple-50/50 rounded-lg p-2">
            <Zap className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span>AI Assistant</span>
          </div>
        </motion.div>

        {/* Clerk SignUp Component */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mb-6"
        >
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-0 p-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: cn(
                  "w-full h-11 text-sm font-medium rounded-lg border border-slate-200 hover:border-slate-300",
                  "transition-all duration-200 hover:shadow-md",
                  "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                ),
                socialButtonsBlockButtonText: "text-slate-700",
                dividerLine: "bg-slate-200",
                dividerText: "text-slate-500 text-xs font-medium",
                formFieldInput: cn(
                  "w-full h-11 px-4 text-sm rounded-lg border border-slate-200",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  "transition-all duration-200 bg-white/50 backdrop-blur-sm"
                ),
                formFieldLabel: "text-sm font-medium text-slate-700 mb-2",
                formButtonPrimary: cn(
                  "w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600",
                  "hover:from-blue-700 hover:to-purple-700 text-white font-medium text-sm rounded-lg",
                  "transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                ),
                footerActionLink: "text-blue-600 hover:text-blue-700 font-medium text-sm",
                identityPreviewText: "text-sm text-slate-600",
                identityPreviewEditButton: "text-blue-600 hover:text-blue-700 text-sm",
                formResendCodeLink: "text-blue-600 hover:text-blue-700 text-sm font-medium",
                otpCodeFieldInput: cn(
                  "w-12 h-12 text-center text-lg font-semibold rounded-lg border border-slate-200",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                ),
              },
              layout: {
                socialButtonsPlacement: "top",
                showOptionalFields: false,
              },
            }}
            redirectUrl="/dashboard"
            signInUrl="/sign-in"
          />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs sm:text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 inline-flex items-center gap-1 group"
            >
              <ArrowLeft className="w-3 h-3 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-xs text-slate-400 mb-4">Trusted by 10,000+ users worldwide</p>
        <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span>SOC 2 Certified</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

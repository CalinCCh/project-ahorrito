"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, TrendingUp, Zap, Sparkles, CheckCircle, Users, Star, BarChart3, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser, useClerk } from "@clerk/nextjs";

export default function LandingPage() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <Image
                src="/logo2.svg"
                alt="Ahorrito Logo"
                width={40}
                height={40}
                className="drop-shadow-lg"
              />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="w-4 h-4 text-blue-500" />
              </motion.div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ahorrito
            </span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            {user ? (
              // Usuario autenticado - mostrar dashboard y logout
              <>
                <Link
                  href="/"
                  className="text-slate-600 hover:text-slate-800 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              // Usuario no autenticado - mostrar sign in y get started
              <>
                <Link 
                  href="/sign-in"
                  className="text-slate-600 hover:text-slate-800 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </motion.div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left side - Hero Content */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                {/* Hero headline */}
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold"
                  >
                    <Star className="w-4 h-4" />
                    Trusted by 10,000+ users
                  </motion.div>
                  
                  <h1 className="text-4xl lg:text-6xl font-bold text-slate-800 leading-tight">
                    Smart money
                    <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      management
                    </span>
                    made simple
                  </h1>
                  
                  <p className="text-xl text-slate-600 leading-relaxed">
                    Take control of your finances with AI-powered insights, automated tracking, and personalized recommendations.
                  </p>
                </div>

                {/* CTA Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  {user ? (
                    // Usuario autenticado - mostrar ir a dashboard
                    <>
                      <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Go to Dashboard
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 hover:bg-slate-50"
                      >
                        <LogOut className="w-5 h-5" />
                        Sign out
                      </button>
                    </>
                  ) : (
                    // Usuario no autenticado - mostrar sign up y sign in
                    <>
                      <Link 
                        href="/sign-up"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Start for free
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                      <Link 
                        href="/sign-in"
                        className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 hover:bg-slate-50"
                      >
                        <Users className="w-5 h-5" />
                        Sign in
                      </Link>
                    </>
                  )}
                </motion.div>

                {/* Key features */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-8 pt-4"
                >
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Free forever</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">No credit card</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Setup in 2 min</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right side - Feature Cards */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative"
              >
                <div className="grid grid-cols-2 gap-6">
                  {/* Security Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Bank-level Security</h3>
                    <p className="text-sm text-slate-600">Your data protected with enterprise-grade encryption</p>
                  </motion.div>

                  {/* Analytics Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Smart Analytics</h3>
                    <p className="text-sm text-slate-600">AI-powered insights into your spending patterns</p>
                  </motion.div>

                  {/* Growth Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Goal Tracking</h3>
                    <p className="text-sm text-slate-600">Set and achieve your financial goals with smart planning</p>
                  </motion.div>

                  {/* AI Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">AI Assistant</h3>
                    <p className="text-sm text-slate-600">Personalized financial advice powered by AI</p>
                  </motion.div>
                </div>

                {/* Floating geometric element */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-lg"></div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
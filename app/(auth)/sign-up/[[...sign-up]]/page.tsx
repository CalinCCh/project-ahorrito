"use client";

import Image from "next/image";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50">
      {/* Mobile Background Pattern */}
      <div className="lg:hidden absolute inset-0 opacity-30">
        <div className="absolute top-10 right-10 w-20 h-20 bg-green-200 rounded-full blur-xl"></div>
        <div className="absolute top-32 left-8 w-16 h-16 bg-blue-200 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 right-8 w-24 h-24 bg-purple-200 rounded-full blur-xl"></div>
        <div className="absolute bottom-16 left-16 w-12 h-12 bg-cyan-200 rounded-full blur-lg"></div>
      </div>

      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-10">
        {/* Desktop Side Panel */}
        <div className="hidden lg:block lg:col-span-3 bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <Image
              src="/large-triangles.svg"
              alt="Decorative pattern"
              fill
              style={{ objectFit: "cover" }}
              priority
              className="opacity-30"
            />
          </div>
          
          {/* Overlay Content */}
          <div className="relative z-10 h-full flex flex-col justify-center p-8 text-white">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">
                Your financial future starts here
              </h3>
              <p className="text-green-100 text-lg leading-relaxed">
                Experience the next generation of personal finance management. Smart, secure, and designed for your success.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-green-100">Automated expense categorization</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                  <span className="text-green-100">Personalized saving goals</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-700"></div>
                  <span className="text-green-100">Advanced analytics dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-1000"></div>
                  <span className="text-green-100">24/7 AI financial assistant</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <p className="text-sm text-green-100 italic">
                  "Ahorrito transformed how I manage my finances. I've saved 30% more since I started!"
                </p>
                <p className="text-xs text-green-200 mt-2">- Sarah K., Premium User</p>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-16 left-8 w-16 h-16 bg-white/10 rounded-full blur-sm animate-bounce"></div>
          <div className="absolute bottom-24 left-12 w-12 h-12 bg-white/10 rounded-full blur-sm animate-bounce delay-500"></div>
        </div>

        {/* Main Content - Mobile First */}
        <div className="lg:col-span-7 flex items-center justify-center min-h-screen p-4 lg:p-8 relative z-10">
          <div className="w-full max-w-md">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
}

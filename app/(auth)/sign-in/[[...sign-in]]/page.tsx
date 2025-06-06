"use client";

import Image from "next/image";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Mobile Background Pattern */}
      <div className="lg:hidden absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-8 w-16 h-16 bg-purple-200 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-8 w-24 h-24 bg-indigo-200 rounded-full blur-xl"></div>
        <div className="absolute bottom-16 right-16 w-12 h-12 bg-cyan-200 rounded-full blur-lg"></div>
      </div>

      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-10">
        {/* Main Content - Mobile First */}
        <div className="lg:col-span-7 flex items-center justify-center min-h-screen p-4 lg:p-8 relative z-10">
          <div className="w-full max-w-md">
            <SignInForm />
          </div>
        </div>

        {/* Desktop Side Panel */}
        <div className="hidden lg:block lg:col-span-3 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
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
                Take control of your finances
              </h3>
              <p className="text-blue-100 text-lg leading-relaxed">
                Join thousands of users who are already managing their money smarter with Ahorrito's powerful tools and insights.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-100">Real-time expense tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-blue-100">AI-powered financial insights</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-blue-100">Secure bank integrations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 right-8 w-16 h-16 bg-white/10 rounded-full blur-sm animate-pulse"></div>
          <div className="absolute bottom-32 right-12 w-12 h-12 bg-white/10 rounded-full blur-sm animate-pulse delay-1000"></div>
        </div>
      </div>
    </div>
  );
}

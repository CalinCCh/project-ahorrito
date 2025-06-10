"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Sign In Form (2/3) */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-white to-slate-50 p-8",
                headerTitle: "text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center mb-2",
                headerSubtitle: "text-slate-600 text-center mt-3 text-base",
                
                // Social buttons
                socialButtonsBlockButton: "w-full h-14 border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg rounded-2xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5",
                socialButtonsBlockButtonText: "text-slate-700 text-base",
                socialButtonsIconButton: "mr-3",
                
                // Form fields
                formFieldInput: "w-full h-14 px-5 border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/80 backdrop-blur-sm text-base placeholder:text-slate-400",
                formFieldLabel: "text-base font-bold text-slate-700 mb-3",
                
                // Primary button
                formButtonPrimary: "w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
                
                // Links
                footerActionLink: "text-blue-600 hover:text-blue-700 font-bold text-base transition-colors underline decoration-2 underline-offset-4",
                formResendCodeLink: "text-blue-600 hover:text-blue-700 font-semibold text-base transition-colors",
                
                // Divider
                dividerLine: "bg-slate-300 h-px",
                dividerText: "text-slate-500 text-base font-medium px-6 bg-gradient-to-br from-white to-slate-50",
                
                // OTP
                otpCodeFieldInput: "w-14 h-14 text-center text-xl font-bold border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white/80",
                
                // Error messages
                formFieldErrorText: "text-red-500 text-sm mt-2 font-medium",
                alertText: "text-red-500 text-sm font-medium",
                
                // Loading states
                formFieldInputShowPasswordButton: "text-slate-500 hover:text-slate-700 transition-colors",
                
                // Additional styling
                formFieldSuccessText: "text-green-600 text-sm mt-2 font-medium",
                formFieldWarningText: "text-amber-600 text-sm mt-2 font-medium",
                
                // Identity preview
                identityPreviewText: "text-slate-600 text-base",
                identityPreviewEditButton: "text-blue-600 hover:text-blue-700 font-semibold text-base",
              },
              layout: {
                socialButtonsPlacement: "top",
                showOptionalFields: false,
              },
            }}
            redirectUrl="/"
            signUpUrl="/sign-up"
          />
        </div>
      </div>

      {/* Right side - Geometric Design (1/3) */}
      <div className="w-1/3 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Geometric shapes */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-80 h-80">
            {/* Large triangle */}
            <div className="absolute inset-0 transform rotate-12">
              <div className="w-full h-full bg-white/10 backdrop-blur-sm"
                   style={{
                     clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)"
                   }}>
              </div>
            </div>
            
            {/* Circle */}
            <div className="absolute top-8 right-8 w-32 h-32 bg-white/20 rounded-full backdrop-blur-sm"></div>
            
            {/* Small triangles */}
            <div className="absolute bottom-12 left-12 w-16 h-16 bg-white/15 backdrop-blur-sm transform rotate-45"></div>
            <div className="absolute top-20 left-20 w-12 h-12 bg-white/25 backdrop-blur-sm transform -rotate-12"
                 style={{
                   clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)"
                 }}>
            </div>
            
            {/* Hexagon */}
            <div className="absolute bottom-20 right-20 w-20 h-20 bg-white/15 backdrop-blur-sm"
                 style={{
                   clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                 }}>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-16 w-6 h-6 bg-white/20 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-16 left-16 w-3 h-3 bg-white/40 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
  );
}

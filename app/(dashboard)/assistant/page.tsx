"use client";

import { UnifiedChat } from "@/components/assistant/UnifiedChat";
import { useSearchParams } from "next/navigation";

export default function AssistantPage() {
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get('message');

  return (
    <div className="relative h-full">
      {/* Enhanced Background - Mobile Optimized */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/30" />
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-50/40 via-transparent to-cyan-50/30" />

        {/* Floating orbs - Responsive */}
        <div className="absolute top-10 sm:top-20 left-2 sm:left-10 w-16 sm:w-32 h-16 sm:h-32 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 sm:bottom-40 right-2 sm:right-20 w-14 sm:w-28 h-14 sm:h-28 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      {/* Contenedor IGUAL QUE SAVINGS */}
      <div className="relative z-10 h-full">
        <div className="container mx-auto px-4 lg:px-6 py-6 pt-20 lg:pt-6 h-full">
          <UnifiedChat variant="fullpage" initialMessage={initialMessage} />
        </div>
      </div>
    </div>
  );
}
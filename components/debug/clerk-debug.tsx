"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function DebugClerk() {
  const clerk = useClerk();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    console.log("🔍 DEBUG Clerk Status:");
    console.log("• Clerk loaded:", !!clerk);
    console.log("• User loaded:", isLoaded);
    console.log("• User exists:", !!user);
    console.log("• Publishable Key:", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + "...");
    console.log("• Current URL:", typeof window !== 'undefined' ? window.location.href : 'SSR');
    
    if (clerk) {
      console.log("• Clerk instance:", clerk);
    }
    
    if (!clerk) {
      console.error("❌ Clerk not initialized!");
    }
  }, [clerk, isLoaded, user]);

  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded">
      <h3 className="font-bold text-red-800">🔍 Debug Clerk</h3>
      <pre className="text-sm mt-2">
        {JSON.stringify({
          clerkLoaded: !!clerk,
          userLoaded: isLoaded,
          userExists: !!user,
          publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + "...",
          currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR'
        }, null, 2)}
      </pre>
    </div>
  );
}

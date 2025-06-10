"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export function ClerkDebugger() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();

  useEffect(() => {
    console.log("=== CLERK DEBUG INFO ===");
    console.log("Auth loaded:", authLoaded);
    console.log("User loaded:", userLoaded);
    console.log("Is signed in:", isSignedIn);
    console.log("User:", user ? "Present" : "None");
    console.log(
      "Clerk Publishable Key:",
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        ? `${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 20)}...`
        : "MISSING"
    );
    console.log("Current URL:", window.location.href);
    console.log("========================");
  }, [authLoaded, userLoaded, isSignedIn, user]);

  if (!authLoaded || !userLoaded) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50">
        🔄 Loading Clerk...
      </div>
    );
  }

  return null;
}

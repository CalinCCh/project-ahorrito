import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

import { QueryProvider } from "@/providers/query-provider";
import { SheetProvider } from "@/providers/sheet-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkDebugger } from "@/components/debug/ClerkDebugger";
import { getClerkConfig } from "@/lib/clerk-config";

export const metadata: Metadata = {
  title: "Ahorrito - Personal Finance Hub",
  description: "Manage your finances efficiently with smart insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (typeof window !== "undefined") {
    console.log(
      "Clerk Publishable Key:",
      publishableKey ? `${publishableKey.substring(0, 20)}...` : "MISSING"
    );
    console.log("Environment:", process.env.NODE_ENV);
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey!}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#0EA5E9",
        },
      }}
    >
      {" "}
      <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <body className="antialiased font-sans">
          <ClerkDebugger />
          <QueryProvider>
            <SheetProvider />
            <Toaster />
            {children}
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

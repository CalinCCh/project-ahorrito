"use client";

import React, { memo, useMemo, Suspense, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  MobileSidebar,
  MobileMenuButton,
} from "@/components/layout/MobileSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { AppWrapper } from "@/components/layout/AppWrapper";
import { useAhorrito } from "@/hooks/use-ahorrito";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface DashboardLayoutProps {
  children: React.ReactNode;
  mainClassName?: string;
  paddingTopClass?: string;
  paddingBottomClass?: string;
  pageName?: string;
}

// Loading skeleton for sidebar
const SidebarSkeleton = memo(function SidebarSkeleton() {
  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r">
      <div className="flex flex-col flex-1 min-h-0 pt-5 pb-4">
        <div className="flex items-center flex-shrink-0 px-4">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex flex-col flex-1 mt-5">
          <nav className="flex-1 px-2 space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
});

export const DashboardLayout = memo<DashboardLayoutProps>(
  function DashboardLayout({
    children,
    mainClassName,
    paddingTopClass = "pt-6",
    paddingBottomClass = "pb-0",
    pageName = "Dashboard",
  }) {
    // Mobile sidebar state
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Initialize Ahorrito for the dashboard
    const ahorrito = useAhorrito({
      componentName: "DashboardLayout",
      enablePerformanceMonitoring: true,
      enableAccessibilityFeatures: true,
    });

    // Memoize main content className with mobile responsiveness
    const mainContentClassName = useMemo(() => {
      // Páginas sin scroll
      const noScrollPages = ["Transactions", "Accounts"];
      const needsNoScroll = noScrollPages.includes(pageName);
      return cn(
        "flex-1 lg:pl-64 flex flex-col",
        needsNoScroll ? "overflow-hidden" : "",
        mainClassName
      );
    }, [mainClassName, pageName]);

    // Memoize container className
    const containerClassName = useMemo(() => {
      // Páginas sin scroll
      const noScrollPages = ["Transactions", "Accounts"];
      const needsNoScroll = noScrollPages.includes(pageName);
      return cn(
        "bg-gray-50 flex flex-col",
        needsNoScroll ? "h-full overflow-hidden" : "min-h-screen"
      );
    }, [pageName]);

    // Memoize inner content className - SIN max-width para todas las páginas
    const innerContentClassName = useMemo(() => {
      // Páginas sin scroll
      const noScrollPages = ["Transactions", "Accounts"];
      const needsNoScroll = noScrollPages.includes(pageName);
      return cn(
        "w-full flex-grow flex flex-col min-h-0",
        needsNoScroll ? "overflow-hidden" : ""
      );
    }, [pageName]);

    return (
      <AppWrapper pageName={pageName} enableAnimations={false}>
        <div className={containerClassName}>
          {/* Mobile Header - Estilo nativo iOS/Android - ELIMINADO porque ahora existe un footer */}
          {/* Ya no es necesario este header en móvil */}

          {/* Mobile Sidebar */}
          <MobileSidebar
            isOpen={isMobileSidebarOpen}
            setIsOpen={setIsMobileSidebarOpen}
          />

          <div
            className="flex relative flex-grow h-full"
            role="main"
            aria-label="Dashboard layout"
          >
            {/* Desktop Sidebar with lazy loading */}
            <Suspense fallback={<SidebarSkeleton />}>
              <Sidebar />
            </Suspense>

            {/* Main content area */}
            <main
              className={mainContentClassName}
              role="main"
              aria-label="Main content area"
              id="main-content"
            >
              <div className={innerContentClassName}>
                {/* Skip to main content link for accessibility */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
                >
                  Skip to main content
                </a>

                {/* Mobile spacing wrapper - Reducido para menor espacio */}
                <div className="lg:hidden"></div>

                {/* Page content */}
                <div
                  className={cn(
                    "flex-1 flex flex-col",
                    // Desktop: SIN padding lateral limitante
                    "lg:px-0",
                    // Mobile: no hay header, por lo que no necesitamos margen especial
                    "mt-0",
                    paddingTopClass,
                    paddingBottomClass,
                    ["Transactions", "Accounts"].includes(pageName) &&
                      "overflow-hidden"
                  )}
                  role="region"
                  aria-label={`${pageName} content`}
                >
                  {children}
                </div>
              </div>
            </main>

            {/* Right sidebar with lazy loading - Hidden on mobile */}
            <Suspense fallback={<div className="hidden xl:block xl:w-80" />}>
              <div className="hidden xl:block">
                <RightSidebar />
              </div>
            </Suspense>
          </div>
        </div>
      </AppWrapper>
    );
  }
);

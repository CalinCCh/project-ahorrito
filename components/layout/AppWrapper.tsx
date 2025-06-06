"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  Suspense,
  Component,
  ReactNode,
} from "react";
import { useAhorritoPage } from "@/hooks/use-ahorrito";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Production-ready application wrapper with all optimizations
 * Includes error boundaries, loading states, accessibility features, and performance monitoring
 */

interface AppWrapperProps {
  children: React.ReactNode;
  pageName?: string;
  className?: string;
  enableAnimations?: boolean;
  fallback?: React.ComponentType;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// Custom Error Boundary component
class CustomErrorBoundary extends Component<
  {
    children: ReactNode;
    onError?: (error: Error, errorInfo: any) => void;
    onReset?: () => void;
  },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error || new Error("Unknown error")}
          resetErrorBoundary={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// Error fallback component with accessibility
const ErrorFallback = memo(function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      role="alert"
      aria-live="assertive"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle
              className="h-12 w-12 text-red-500"
              aria-hidden="true"
            />
          </div>
          <CardTitle className="text-xl font-semibold text-red-600">
            Something went wrong
          </CardTitle>
          <CardDescription>
            We encountered an unexpected error. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
              Error details
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {error.message}
            </pre>
          </details>
          <Button
            onClick={resetErrorBoundary}
            className="w-full"
            aria-label="Try again - refresh the application"
          >
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});

// Loading fallback component
const LoadingFallback = memo(function LoadingFallback() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading application"
    >
      <div className="text-center space-y-4">
        <Loader2
          className="h-8 w-8 animate-spin mx-auto text-blue-600"
          aria-hidden="true"
        />
        <p className="text-lg font-medium text-gray-600">Loading Ahorrito...</p>
        <p className="text-sm text-gray-500">
          Setting up your financial dashboard
        </p>
      </div>
    </div>
  );
});

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const AppWrapper = memo<AppWrapperProps>(function AppWrapper({
  children,
  pageName = "Unknown",
  className = "",
  enableAnimations = true,
  fallback: CustomFallback,
}) {
  // Initialize Ahorrito with page-specific features
  const ahorrito = useAhorritoPage(pageName);

  // Memoize wrapper class names
  const wrapperClassName = useMemo(
    () => {
      // Páginas sin scroll
      const noScrollPages = ["Transactions", "Accounts"];
      const needsNoScroll = noScrollPages.includes(pageName);
      const heightClass = needsNoScroll ? "h-screen overflow-hidden" : "min-h-screen";
      return `${heightClass} bg-gradient-to-br from-slate-50 to-slate-100 ${className}`.trim();
    },
    [className, pageName]
  );

  // Memoize content wrapper props
  const contentProps = useMemo(
    () => {
      // Páginas sin scroll
      const noScrollPages = ["Transactions", "Accounts"];
      const needsNoScroll = noScrollPages.includes(pageName);
      const heightClass = needsNoScroll ? "h-full overflow-hidden" : "min-h-full";
      return {
        className: `w-full ${heightClass}`,
        "data-page": pageName,
        "aria-label": `${pageName} page content`,
      };
    },
    [pageName]
  );

  // Log page initialization
  useEffect(() => {
    if (ahorrito.isInitialized) {
      console.log(`📄 Page "${pageName}" initialized with Ahorrito features`);
      ahorrito.logComponentRender();
    }
  }, [ahorrito.isInitialized, pageName, ahorrito.logComponentRender]);
  // Error boundary configuration
  const errorBoundaryConfig = useMemo(
    () => ({
      onError: (error: Error, errorInfo: any) => {
        console.error("🚨 Application error:", error, errorInfo);

        // Log to external service in production
        if (process.env.NODE_ENV === "production") {
          // Replace with your error tracking service
          // errorTracker.captureException(error, { extra: errorInfo });
        }

        // Announce error to screen reader
        if (ahorrito.isInitialized) {
          ahorrito.announceToScreenReader(
            "An error occurred. Please try refreshing the page.",
            "assertive"
          );
        }
      },
      onReset: () => {
        console.log("🔄 Error boundary reset");
        if (ahorrito.isInitialized) {
          ahorrito.announceToScreenReader("Application reset successfully");
        }
      },
    }),
    [ahorrito]
  );

  // Render loading state while app initializes
  if (!ahorrito.isInitialized) {
    return CustomFallback ? <CustomFallback /> : <LoadingFallback />;
  }
  // Render with animations if enabled
  if (enableAnimations) {
    return (
      <CustomErrorBoundary {...errorBoundaryConfig}>
        <div className={wrapperClassName}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pageName}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              {...contentProps}
            >
              <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </CustomErrorBoundary>
    );
  }

  // Render without animations
  return (
    <CustomErrorBoundary {...errorBoundaryConfig}>
      <div className={wrapperClassName}>
        <div {...contentProps}>
          <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
        </div>
      </div>
    </CustomErrorBoundary>
  );
});

/**
 * Higher-order component for wrapping pages with Ahorrito features
 */
export function withAhorritoOptimizations<P extends object>(
  Component: React.ComponentType<P>,
  pageName?: string
) {
  const WrappedComponent = memo<P>(function WrappedComponent(props) {
    return (
      <AppWrapper
        pageName={pageName || Component.displayName || Component.name}
      >
        <Component {...props} />
      </AppWrapper>
    );
  });

  WrappedComponent.displayName = `withAhorritoOptimizations(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

/**
 * Modal wrapper with accessibility features
 */
export const ModalWrapper = memo<{
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
}>(function ModalWrapper({ children, isOpen, onClose, title, description }) {
  const ahorrito = useAhorritoPage(`Modal-${title}`);

  const modalProps = useMemo(
    () => ({
      role: "dialog" as const,
      "aria-modal": true,
      "aria-labelledby": `modal-${title}-title`,
      "aria-describedby": description
        ? `modal-${title}-description`
        : undefined,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      },
    }),
    [title, description, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div
        {...modalProps}
        className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sr-only" id={`modal-${title}-title`}>
          {title}
        </div>
        {description && (
          <div className="sr-only" id={`modal-${title}-description`}>
            {description}
          </div>
        )}
        {children}
      </div>
    </div>
  );
});

export default {
  AppWrapper,
  withAhorritoOptimizations,
  ModalWrapper,
  ErrorFallback,
  LoadingFallback,
};

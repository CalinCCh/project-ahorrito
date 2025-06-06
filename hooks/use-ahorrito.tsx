"use client";

import { useEffect, useCallback, useMemo, useRef, useState } from "react";
import { AhorritoApp } from "../lib/app-initialization";
import {
  useFocusTrap,
  useScreenReaderAnnouncement,
} from "../lib/accessibility-utils";
import { usePerformanceMonitor } from "../lib/performance-utils";

/**
 * Comprehensive hook for Ahorrito application features
 * Combines performance monitoring, accessibility features, and app state management
 */

export interface UseAhorritoOptions {
  componentName?: string;
  enablePerformanceMonitoring?: boolean;
  enableAccessibilityFeatures?: boolean;
  enableFocusTrap?: boolean;
  autoInitialize?: boolean;
}

export interface AhorritoHookReturn {
  // App state
  app: AhorritoApp | null;
  isInitialized: boolean;

  // Performance
  performanceMetrics: Record<string, any>;
  logComponentRender: () => void;

  // Accessibility
  announceToScreenReader: (
    message: string,
    priority?: "polite" | "assertive"
  ) => void;
  focusTrapRef: React.RefObject<HTMLElement | null>;

  // Utilities
  initializeApp: () => Promise<void>;
  getAppConfig: () => any;
  updateAppConfig: (config: any) => void;
}

export const useAhorrito = (
  options: UseAhorritoOptions = {}
): AhorritoHookReturn => {
  const {
    componentName = "UnknownComponent",
    enablePerformanceMonitoring = true,
    enableAccessibilityFeatures = true,
    enableFocusTrap = false,
    autoInitialize = true,
  } = options;
  const appRef = useRef<AhorritoApp | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Performance monitoring
  usePerformanceMonitor(enablePerformanceMonitoring ? componentName : "");

  // Accessibility features
  const announceToScreenReader = useScreenReaderAnnouncement();
  const focusTrapRef = useFocusTrap(enableFocusTrap);
  // Initialize app on mount
  useEffect(() => {
    if (autoInitialize && !isInitialized) {
      const initApp = async () => {
        try {
          const app = AhorritoApp.getInstance();
          if (!app.isInitialized()) {
            await app.initialize();
          }
          appRef.current = app;
          setIsInitialized(true);
        } catch (error) {
          console.error("Failed to initialize Ahorrito app:", error);
        }
      };

      initApp();
    }
  }, [autoInitialize, isInitialized]);
  // Manual app initialization
  const initializeApp = useCallback(async () => {
    try {
      const app = AhorritoApp.getInstance();
      await app.initialize();
      appRef.current = app;
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize Ahorrito app:", error);
      throw error;
    }
  }, []);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    return appRef.current?.getPerformanceMetrics() || {};
  }, [appRef.current]);

  // Component render logging
  const logComponentRender = useCallback(() => {
    if (enablePerformanceMonitoring && appRef.current) {
      console.log(`🔄 ${componentName} rendered`);
    }
  }, [componentName, enablePerformanceMonitoring]);

  // Get app configuration
  const getAppConfig = useCallback(() => {
    return appRef.current?.getConfig() || null;
  }, []);

  // Update app configuration
  const updateAppConfig = useCallback((config: any) => {
    appRef.current?.updateConfig(config);
  }, []);
  return {
    app: appRef.current,
    isInitialized: isInitialized,
    performanceMetrics,
    logComponentRender,
    announceToScreenReader,
    focusTrapRef,
    initializeApp,
    getAppConfig,
    updateAppConfig,
  };
};

/**
 * Hook specifically for page components
 */
export const useAhorritoPage = (pageName: string) => {
  const ahorrito = useAhorrito({
    componentName: `Page-${pageName}`,
    enablePerformanceMonitoring: true,
    enableAccessibilityFeatures: true,
    autoInitialize: true,
  });

  // Announce page changes to screen readers
  useEffect(() => {
    if (ahorrito.isInitialized) {
      ahorrito.announceToScreenReader(`Navigated to ${pageName} page`);
    }
  }, [pageName, ahorrito.isInitialized, ahorrito.announceToScreenReader]);

  return ahorrito;
};

/**
 * Hook for modal/dialog components
 */
export const useAhorritoModal = (modalName: string, isOpen: boolean) => {
  const ahorrito = useAhorrito({
    componentName: `Modal-${modalName}`,
    enableFocusTrap: isOpen,
    enableAccessibilityFeatures: true,
  });

  // Announce modal state changes
  useEffect(() => {
    if (ahorrito.isInitialized) {
      if (isOpen) {
        ahorrito.announceToScreenReader(
          `${modalName} dialog opened`,
          "assertive"
        );
      } else {
        ahorrito.announceToScreenReader(`${modalName} dialog closed`);
      }
    }
  }, [
    isOpen,
    modalName,
    ahorrito.isInitialized,
    ahorrito.announceToScreenReader,
  ]);

  return {
    ...ahorrito,
    modalProps: {
      ref: ahorrito.focusTrapRef,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": `${modalName}-title`,
      "aria-describedby": `${modalName}-description`,
    },
  };
};

/**
 * Hook for form components with enhanced accessibility
 */
export const useAhorritoForm = (
  formName: string,
  hasErrors: boolean = false
) => {
  const ahorrito = useAhorrito({
    componentName: `Form-${formName}`,
    enableAccessibilityFeatures: true,
    enablePerformanceMonitoring: true,
  });

  // Announce form errors
  useEffect(() => {
    if (hasErrors && ahorrito.isInitialized) {
      ahorrito.announceToScreenReader(
        `${formName} form has validation errors`,
        "assertive"
      );
    }
  }, [
    hasErrors,
    formName,
    ahorrito.isInitialized,
    ahorrito.announceToScreenReader,
  ]);

  return {
    ...ahorrito,
    formProps: {
      "aria-label": `${formName} form`,
      "aria-invalid": hasErrors,
      "aria-describedby": hasErrors ? `${formName}-errors` : undefined,
    },
  };
};

/**
 * Hook for chart/data visualization components
 */
export const useAhorritoChart = (chartName: string, data: any[]) => {
  const ahorrito = useAhorrito({
    componentName: `Chart-${chartName}`,
    enablePerformanceMonitoring: true,
    enableAccessibilityFeatures: true,
  });

  // Announce data updates
  useEffect(() => {
    if (ahorrito.isInitialized && data.length > 0) {
      ahorrito.announceToScreenReader(
        `${chartName} chart updated with ${data.length} data points`
      );
    }
  }, [
    data.length,
    chartName,
    ahorrito.isInitialized,
    ahorrito.announceToScreenReader,
  ]);

  return {
    ...ahorrito,
    chartProps: {
      role: "img",
      "aria-label": `${chartName} chart`,
      "aria-describedby": `${chartName}-description`,
    },
  };
};

export default {
  useAhorrito,
  useAhorritoPage,
  useAhorritoModal,
  useAhorritoForm,
  useAhorritoChart,
};

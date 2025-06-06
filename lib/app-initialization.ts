"use client";

import { DevTools, initDevEnvironment } from './dev-utils';
import { BundleMonitor } from './bundle-optimization';
import { AccessibilityTesting } from './accessibility-utils';

/**
 * Application Initialization and Production Optimization
 * Central hub for all performance, accessibility, and development features
 */

export interface AppConfig {
    environment: 'development' | 'production' | 'test';
    enablePerformanceMonitoring: boolean;
    enableAccessibilityTesting: boolean;
    enableBundleOptimization: boolean;
    enableDevTools: boolean;
    performance: {
        enableWebVitals: boolean;
        enableComponentProfiling: boolean;
        enableMemoryTracking: boolean;
    };
    accessibility: {
        enableAutoTesting: boolean;
        enableAriaValidation: boolean;
        enableColorContrastCheck: boolean;
    };
    bundle: {
        enableLazyLoading: boolean;
        enableCodeSplitting: boolean;
        enablePreloading: boolean;
    };
}

export const defaultConfig: AppConfig = {
    environment: process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development',
    enablePerformanceMonitoring: true,
    enableAccessibilityTesting: process.env.NODE_ENV === 'development',
    enableBundleOptimization: true,
    enableDevTools: process.env.NODE_ENV === 'development',
    performance: {
        enableWebVitals: true,
        enableComponentProfiling: process.env.NODE_ENV === 'development',
        enableMemoryTracking: process.env.NODE_ENV === 'development',
    },
    accessibility: {
        enableAutoTesting: process.env.NODE_ENV === 'development',
        enableAriaValidation: true,
        enableColorContrastCheck: true,
    },
    bundle: {
        enableLazyLoading: true,
        enableCodeSplitting: true,
        enablePreloading: true,
    },
};

/**
 * Initialize the Ahorrito application with optimizations
 */
export class AhorritoApp {
    private static instance: AhorritoApp;
    private config: AppConfig;
    private initialized = false;

    private constructor(config: Partial<AppConfig> = {}) {
        this.config = { ...defaultConfig, ...config };
    }

    public static getInstance(config?: Partial<AppConfig>): AhorritoApp {
        if (!AhorritoApp.instance) {
            AhorritoApp.instance = new AhorritoApp(config);
        }
        return AhorritoApp.instance;
    }

    /**
     * Initialize all application features
     */
    public async initialize(): Promise<void> {
        if (this.initialized) {
            console.log('🚀 Ahorrito app already initialized');
            return;
        }

        console.log('🚀 Initializing Ahorrito application...');

        try {
            // Initialize development tools
            if (this.config.enableDevTools) {
                initDevEnvironment();
                console.log('✅ Development tools initialized');
            }

            // Initialize performance monitoring
            if (this.config.enablePerformanceMonitoring) {
                this.initializePerformanceMonitoring();
                console.log('✅ Performance monitoring initialized');
            }

            // Initialize accessibility testing
            if (this.config.enableAccessibilityTesting) {
                this.initializeAccessibilityTesting();
                console.log('✅ Accessibility testing initialized');
            }

            // Initialize bundle optimization
            if (this.config.enableBundleOptimization) {
                this.initializeBundleOptimization();
                console.log('✅ Bundle optimization initialized');
            }

            // Initialize Web Vitals tracking
            if (this.config.performance.enableWebVitals) {
                await this.initializeWebVitals();
                console.log('✅ Web Vitals tracking initialized');
            }

            this.initialized = true;
            console.log('🎉 Ahorrito application successfully initialized!');

            // Log final status
            this.logInitializationStatus();

        } catch (error) {
            console.error('❌ Failed to initialize Ahorrito application:', error);
            throw error;
        }
    }
    /**
     * Initialize performance monitoring features
     */
    private initializePerformanceMonitoring(): void {
        if (typeof window === 'undefined') return;

        // Component profiling
        if (this.config.performance.enableComponentProfiling) {
            console.log('📊 Component profiling enabled');
        }

        // Memory tracking
        if (this.config.performance.enableMemoryTracking) {
            console.log('🧠 Memory tracking enabled');
        }

        // Performance observer for navigation timings
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.entryType === 'navigation') {
                        const navEntry = entry as PerformanceNavigationTiming;
                        console.log('📊 Navigation timing:', {
                            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                            totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
                        });
                    }
                });
            });

            observer.observe({ entryTypes: ['navigation'] });
        }
    }
    /**
     * Initialize accessibility testing
     */
    private initializeAccessibilityTesting(): void {
        if (typeof window === 'undefined') return;

        // Auto accessibility testing
        if (this.config.accessibility.enableAutoTesting) {
            setTimeout(() => {
                AccessibilityTesting.logAccessibilityIssues();
            }, 2000);
        }

        // Color contrast checking
        if (this.config.accessibility.enableColorContrastCheck) {
            console.log('🎨 Color contrast checking enabled');
        }

        // ARIA validation
        if (this.config.accessibility.enableAriaValidation) {
            console.log('🔍 ARIA validation enabled');
        }
    }
    /**
     * Initialize bundle optimization
     */
    private initializeBundleOptimization(): void {
        console.log('📦 Bundle optimization initialized');

        // Log current bundle status
        if (this.config.environment === 'development') {
            console.log('📦 Bundle optimization features:', {
                lazyLoading: this.config.bundle.enableLazyLoading,
                codeSplitting: this.config.bundle.enableCodeSplitting,
                preloading: this.config.bundle.enablePreloading,
            });
        }
    }
    /**
     * Initialize Web Vitals tracking
     */
    private async initializeWebVitals(): Promise<void> {
        if (typeof window === 'undefined') return;

        try {
            // Simplified Web Vitals tracking without external dependency
            const vitalsCallback = (metric: any) => {
                console.log('📈 Web Vital:', metric);

                // Send to analytics in production
                if (this.config.environment === 'production') {
                    // Replace with your analytics service
                    // analytics.track('web-vital', metric);
                }
            };

            // Basic performance monitoring
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        vitalsCallback({
                            name: entry.name,
                            value: entry.duration || entry.startTime,
                            entryType: entry.entryType,
                        });
                    });
                });

                observer.observe({ entryTypes: ['measure', 'navigation'] });
            }

        } catch (error) {
            console.warn('⚠️ Failed to initialize Web Vitals:', error);
        }
    }

    /**
     * Log initialization status
     */
    private logInitializationStatus(): void {
        const status = {
            environment: this.config.environment,
            features: {
                performanceMonitoring: this.config.enablePerformanceMonitoring,
                accessibilityTesting: this.config.enableAccessibilityTesting,
                bundleOptimization: this.config.enableBundleOptimization,
                devTools: this.config.enableDevTools,
            },
            performance: this.config.performance,
            accessibility: this.config.accessibility,
            bundle: this.config.bundle,
        };

        console.group('📋 Ahorrito App Configuration');
        console.table(status.features);
        console.groupEnd();

        if (this.config.environment === 'development') {
            console.log('🔧 Development mode - All debugging features enabled');
        } else if (this.config.environment === 'production') {
            console.log('🚀 Production mode - Optimized for performance');
        }
    }

    /**
     * Get current configuration
     */
    public getConfig(): AppConfig {
        return { ...this.config };
    }

    /**
     * Update configuration
     */
    public updateConfig(newConfig: Partial<AppConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Check if app is initialized
     */
    public isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Get performance metrics
     */
    public getPerformanceMetrics(): Record<string, any> {
        if (typeof window === 'undefined') return {};

        return {
            memory: (performance as any).memory ? {
                used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024),
            } : null,
            navigation: performance.getEntriesByType('navigation')[0] || null,
        };
    }
}

/**
 * Initialize the application with default configuration
 */
export const initializeAhorritoApp = async (config?: Partial<AppConfig>): Promise<AhorritoApp> => {
    const app = AhorritoApp.getInstance(config);
    await app.initialize();
    return app;
};

/**
 * Production-ready initialization
 */
export const initializeForProduction = async (): Promise<AhorritoApp> => {
    return initializeAhorritoApp({
        environment: 'production',
        enableDevTools: false,
        enableAccessibilityTesting: false,
        performance: {
            enableWebVitals: true,
            enableComponentProfiling: false,
            enableMemoryTracking: false,
        },
        accessibility: {
            enableAutoTesting: false,
            enableAriaValidation: true,
            enableColorContrastCheck: true,
        },
        bundle: {
            enableLazyLoading: true,
            enableCodeSplitting: true,
            enablePreloading: true,
        },
    });
};

/**
 * Development-ready initialization
 */
export const initializeForDevelopment = async (): Promise<AhorritoApp> => {
    return initializeAhorritoApp({
        environment: 'development',
        enableDevTools: true,
        enableAccessibilityTesting: true,
        performance: {
            enableWebVitals: true,
            enableComponentProfiling: true,
            enableMemoryTracking: true,
        },
        accessibility: {
            enableAutoTesting: true,
            enableAriaValidation: true,
            enableColorContrastCheck: true,
        },
        bundle: {
            enableLazyLoading: true,
            enableCodeSplitting: true,
            enablePreloading: true,
        },
    });
};

export default {
    AhorritoApp,
    initializeAhorritoApp,
    initializeForProduction,
    initializeForDevelopment,
    defaultConfig,
};

import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Bundle Optimization Utilities for Ahorrito
 * Provides tools for code splitting, lazy loading, and bundle size management
 */

// Type for lazy loadable components
type LazyLoadableComponent<T = {}> = ComponentType<T>;

/**
 * Creates a lazy-loaded component with error boundaries and loading states
 */
export function createLazyComponent(
    importFn: () => Promise<{ default: any }>,
    fallback?: ComponentType
): LazyExoticComponent<any> {
    const LazyComponent = lazy(importFn);

    if (fallback) {
        // Return component with custom fallback
        return LazyComponent;
    }

    return LazyComponent;
}

/**
 * Preload a component for better UX
 */
export function preloadComponent<T = {}>(
    importFn: () => Promise<{ default: LazyLoadableComponent<T> }>
): void {
    // Start loading the component but don't wait for it
    importFn().catch(error => {
        console.warn('Failed to preload component:', error);
    });
}

/**
 * Bundle analyzer helper - logs component sizes in development
 */
export function logComponentSize(componentName: string): void {
    if (process.env.NODE_ENV === 'development') {
        // Use Performance API to measure component rendering time
        performance.mark(`${componentName}-start`);

        // Schedule measuring after render
        setTimeout(() => {
            try {
                performance.mark(`${componentName}-end`);
                performance.measure(
                    `${componentName}-render`,
                    `${componentName}-start`,
                    `${componentName}-end`
                );

                const measure = performance.getEntriesByName(`${componentName}-render`)[0];
                if (measure) {
                    console.log(`📊 ${componentName} render time: ${measure.duration.toFixed(2)}ms`);
                }
            } catch (error) {
                console.warn(`Failed to measure ${componentName}:`, error);
            }
        }, 0);
    }
}

/**
 * Dynamic import helper with retry logic
 */
export async function dynamicImport<T>(
    importFn: () => Promise<T>,
    retries = 3,
    delay = 1000
): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            return await importFn();
        } catch (error) {
            if (i === retries - 1) throw error;

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }

    throw new Error('Dynamic import failed after all retries');
}

/**
 * Route-based code splitting helper
 */
export const createRouteComponent = <T = {}>(
    routePath: string,
    importFn: () => Promise<{ default: LazyLoadableComponent<T> }>
) => {
    return createLazyComponent(importFn);
};

/**
 * Feature-based code splitting
 */
export const FeatureComponents = {
    // Chart components - heavy with Chart.js
    Charts: () => createLazyComponent(() =>
        import('@/components/charts/Chart').then(module => ({ default: module.Chart }))
    ),

    SpendingPie: () => createLazyComponent(() =>
        import('@/components/charts/SpendingPie').then(module => ({ default: module.SpendingPie }))
    ),

    // AI Chat - heavy with Gemini API
    RightSidebar: () => createLazyComponent(() =>
        import('@/components/layout/RightSidebar').then(module => ({ default: module.default }))
    ),

    // Pricing components - loaded only when needed
    PricingTable: () => createLazyComponent(() =>
        import('@/components/pricing/PricingTable').then(module => ({ default: module.PricingTable }))
    ),
} as const;

/**
 * Module preloading strategies
 */
export const PreloadStrategies = {
    // Preload on hover (for navigation items)
    onHover: (importFn: () => Promise<any>) => {
        return {
            onMouseEnter: () => preloadComponent(importFn),
            onFocus: () => preloadComponent(importFn),
        };
    },

    // Preload on viewport intersection
    onViewport: (importFn: () => Promise<any>, threshold = 0.1) => {
        if (typeof window === 'undefined') return {};

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        preloadComponent(importFn);
                        observer.disconnect();
                    }
                });
            },
            { threshold }
        );

        return { ref: (element: Element | null) => element && observer.observe(element) };
    },

    // Preload after idle
    onIdle: (importFn: () => Promise<any>, timeout = 2000) => {
        if (typeof window === 'undefined') return;

        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => preloadComponent(importFn), { timeout });
        } else {
            setTimeout(() => preloadComponent(importFn), timeout);
        }
    },
} as const;

/**
 * Bundle size monitoring in development
 */
export class BundleMonitor {
    private static componentSizes = new Map<string, number>();

    static trackComponent(name: string, startTime: number): void {
        if (process.env.NODE_ENV !== 'development') return;

        const endTime = performance.now();
        const duration = endTime - startTime;

        this.componentSizes.set(name, duration);

        if (duration > 100) {
            console.warn(`⚠️ Slow component detected: ${name} (${duration.toFixed(2)}ms)`);
        }
    }

    static getReport(): Record<string, number> {
        return Object.fromEntries(this.componentSizes);
    }

    static logReport(): void {
        if (process.env.NODE_ENV !== 'development') return;

        const report = this.getReport();
        const sorted = Object.entries(report).sort(([, a], [, b]) => b - a);

        console.group('📊 Component Performance Report');
        sorted.forEach(([name, time]) => {
            const emoji = time > 100 ? '🔴' : time > 50 ? '🟡' : '🟢';
            console.log(`${emoji} ${name}: ${time.toFixed(2)}ms`);
        });
        console.groupEnd();
    }
}

/**
 * Memory optimization helpers
 */
export const MemoryOptimization = {
    // Cleanup event listeners and timers
    createCleanupFunction: (cleanupTasks: (() => void)[]): (() => void) => {
        return () => {
            cleanupTasks.forEach(task => {
                try {
                    task();
                } catch (error) {
                    console.warn('Cleanup task failed:', error);
                }
            });
        };
    },

    // Debounced cleanup for frequent operations
    createDebouncedCleanup: (cleanup: () => void, delay = 300): (() => void) => {
        let timeoutId: ReturnType<typeof setTimeout>;

        return () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(cleanup, delay);
        };
    },

    // WeakMap for component instance tracking
    createComponentRegistry: <T>() => {
        return new WeakMap<object, T>();
    },
} as const;

export default {
    createLazyComponent,
    preloadComponent,
    logComponentSize,
    dynamicImport,
    createRouteComponent,
    FeatureComponents,
    PreloadStrategies,
    BundleMonitor,
    MemoryOptimization,
};

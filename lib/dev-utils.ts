import React from 'react';
import { BundleMonitor } from './bundle-optimization';
import { AccessibilityTesting } from './accessibility-utils';

/**
 * Development Utilities for Ahorrito
 * Combines performance monitoring, accessibility testing, and debugging tools
 */

export class DevTools {
    private static isEnabled = process.env.NODE_ENV === 'development';
    private static initialized = false;

    /**
     * Initialize development tools
     */
    static init(): void {
        if (!this.isEnabled || this.initialized) return;

        console.log('🚀 Ahorrito Dev Tools initialized');

        // Performance monitoring
        this.initPerformanceMonitoring();

        // Accessibility testing
        this.initAccessibilityTesting();

        // Memory leak detection
        this.initMemoryMonitoring();

        // React DevTools integration
        this.initReactDevTools();

        this.initialized = true;
    }

    /**
     * Performance monitoring setup
     */
    private static initPerformanceMonitoring(): void {
        // Monitor React renders
        if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.name.includes('React')) {
                        console.log(`⚡ ${entry.name}: ${entry.duration.toFixed(2)}ms`);
                    }
                });
            });

            observer.observe({ entryTypes: ['measure', 'navigation'] });
        }

        // Log bundle report every 30 seconds
        setInterval(() => {
            BundleMonitor.logReport();
        }, 30000);
    }

    /**
     * Accessibility testing setup
     */
    private static initAccessibilityTesting(): void {
        // Run accessibility checks after DOM changes
        let timeoutId: ReturnType<typeof setTimeout>;

        const checkAccessibility = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                AccessibilityTesting.logAccessibilityIssues();
            }, 1000);
        };

        // Observer for DOM changes
        if (typeof window !== 'undefined') {
            const observer = new MutationObserver(checkAccessibility);
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['aria-label', 'aria-describedby', 'alt'],
            });

            // Initial check
            setTimeout(checkAccessibility, 2000);
        }
    }

    /**
     * Memory monitoring setup
     */
    private static initMemoryMonitoring(): void {
        if (typeof window === 'undefined' || !('performance' in window)) return;

        const checkMemoryUsage = () => {
            if ('memory' in performance) {
                const memory = (performance as any).memory;
                const used = Math.round(memory.usedJSHeapSize / 1048576);
                const total = Math.round(memory.totalJSHeapSize / 1048576);
                const limit = Math.round(memory.jsHeapSizeLimit / 1048576);

                if (used > limit * 0.8) {
                    console.warn(`🚨 High memory usage: ${used}MB / ${limit}MB`);
                } else {
                    console.log(`💾 Memory usage: ${used}MB / ${total}MB (limit: ${limit}MB)`);
                }
            }
        };

        // Check memory every 60 seconds
        setInterval(checkMemoryUsage, 60000);

        // Initial check
        setTimeout(checkMemoryUsage, 5000);
    }    /**
     * React DevTools integration
     */
    private static initReactDevTools(): void {
        // Enhanced component names for better debugging
        if (typeof window !== 'undefined') {
            const devtools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
            if (devtools) {
                devtools.onCommitFiberRoot = new Proxy(devtools.onCommitFiberRoot || (() => { }), {
                    apply(target, thisArg, argArray) {
                        const [id, root] = argArray;
                        console.log('🔄 React commit:', { id, root });
                        return target.apply(thisArg, argArray);
                    }
                });
            }
        }
    }

    /**
     * Component performance profiler
     */
    static profileComponent<T extends (...args: any[]) => any>(
        name: string,
        component: T
    ): T {
        if (!this.isEnabled) return component;

        return ((...args: Parameters<T>) => {
            const startTime = performance.now();
            const result = component(...args);
            BundleMonitor.trackComponent(name, startTime);
            return result;
        }) as T;
    }

    /**
     * Network request monitoring
     */
    static monitorNetworkRequests(): void {
        if (!this.isEnabled || typeof window === 'undefined') return;

        // Monitor fetch requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const [url] = args;
            const startTime = performance.now();

            console.log(`🌐 Fetch request started: ${url}`);

            try {
                const response = await originalFetch(...args);
                const duration = performance.now() - startTime;

                console.log(`✅ Fetch completed: ${url} (${duration.toFixed(2)}ms)`);

                if (duration > 3000) {
                    console.warn(`🐌 Slow request detected: ${url} took ${duration.toFixed(2)}ms`);
                }

                return response;
            } catch (error) {
                const duration = performance.now() - startTime;
                console.error(`❌ Fetch failed: ${url} (${duration.toFixed(2)}ms)`, error);
                throw error;
            }
        };
    }

    /**
     * Local storage monitoring
     */
    static monitorLocalStorage(): void {
        if (!this.isEnabled || typeof window === 'undefined') return;

        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function (key: string, value: string) {
            const size = new Blob([value]).size;
            console.log(`💾 LocalStorage set: ${key} (${size} bytes)`);

            if (size > 1024 * 1024) { // 1MB
                console.warn(`📦 Large localStorage item: ${key} (${(size / 1024 / 1024).toFixed(2)}MB)`);
            }

            return originalSetItem.call(this, key, value);
        };
    }

    /**
     * Error boundary monitoring
     */
    static captureError(error: Error, errorInfo?: any): void {
        if (!this.isEnabled) return;

        console.group('🚨 React Error Captured');
        console.error('Error:', error);
        if (errorInfo) {
            console.error('Error Info:', errorInfo);
        }
        console.trace('Stack trace:');
        console.groupEnd();

        // In production, you might want to send this to an error reporting service
        if (process.env.NODE_ENV === 'production') {
            // Example: Sentry.captureException(error, { extra: errorInfo });
        }
    }

    /**
     * Component state debugging
     */
    static debugState(componentName: string, state: any): void {
        if (!this.isEnabled) return;

        console.group(`🔍 ${componentName} State Debug`);
        console.log('Current state:', state);
        console.log('State keys:', Object.keys(state));
        console.log('State size:', JSON.stringify(state).length, 'characters');
        console.groupEnd();
    }

    /**
     * Render count tracking
     */
    private static renderCounts = new Map<string, number>();

    static trackRender(componentName: string): void {
        if (!this.isEnabled) return;

        const currentCount = this.renderCounts.get(componentName) || 0;
        const newCount = currentCount + 1;
        this.renderCounts.set(componentName, newCount);

        if (newCount > 10 && newCount % 5 === 0) {
            console.warn(`🔄 ${componentName} has rendered ${newCount} times - check for unnecessary re-renders`);
        }
    }

    /**
     * Performance warnings
     */
    static warnSlowOperation(operationName: string, duration: number, threshold = 16): void {
        if (!this.isEnabled) return;

        if (duration > threshold) {
            console.warn(`⚠️ Slow operation: ${operationName} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
        }
    }

    /**
     * Bundle analysis helpers
     */
    static analyzeBundles(): void {
        if (!this.isEnabled || typeof window === 'undefined') return;

        console.group('📦 Bundle Analysis');

        // Analyze loaded scripts
        const scripts = Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[];
        const totalScripts = scripts.length;

        console.log(`Total scripts loaded: ${totalScripts}`);

        scripts.forEach((script, index) => {
            const src = script.src;
            const isChunk = src.includes('chunk') || src.includes('_app') || src.includes('_document');
            const emoji = isChunk ? '📦' : '📄';
            console.log(`${emoji} ${index + 1}. ${src.split('/').pop()}`);
        });

        console.groupEnd();
    }

    /**
     * Cleanup function
     */
    static cleanup(): void {
        if (!this.isEnabled) return;

        console.log('🧹 Cleaning up dev tools');
        this.renderCounts.clear();
        BundleMonitor.getReport(); // Final report
    }
}

/**
 * Development-only component wrapper for debugging
 */
export function withDevTools<T extends object>(
    Component: React.ComponentType<T>,
    name?: string
): React.ComponentType<T> {
    if (process.env.NODE_ENV !== 'development') {
        return Component;
    }

    const componentName = name || Component.displayName || Component.name || 'Unknown'; return (props: T) => {
        DevTools.trackRender(componentName);

        const startTime = performance.now();
        const result = React.createElement(Component as any, props);
        const endTime = performance.now();

        DevTools.warnSlowOperation(`${componentName} render`, endTime - startTime);

        return result;
    };
}

/**
 * Performance measurement decorator
 */
export function measurePerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    if (process.env.NODE_ENV !== 'development') return descriptor;

    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
        const startTime = performance.now();
        const result = method.apply(this, args);
        const endTime = performance.now();

        DevTools.warnSlowOperation(`${target.constructor.name}.${propertyName}`, endTime - startTime);

        return result;
    };

    return descriptor;
}

/**
 * Initialize all development tools
 */
export function initDevEnvironment(): void {
    if (process.env.NODE_ENV !== 'development') return;

    DevTools.init();
    DevTools.monitorNetworkRequests();
    DevTools.monitorLocalStorage();

    // Cleanup on page unload
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
            DevTools.cleanup();
        });

        // Global error handler
        window.addEventListener('error', (event) => {
            DevTools.captureError(new Error(event.message), {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            });
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            DevTools.captureError(new Error('Unhandled Promise Rejection'), {
                reason: event.reason,
            });
        });

        // Expose dev tools globally for console access
        (window as any).ahorritorDevTools = DevTools;
    }

    console.log('🎯 Ahorrito development environment initialized');
}

export default {
    DevTools,
    withDevTools,
    measurePerformance,
    initDevEnvironment,
};

"use client";

// Performance optimization utilities for the Ahorrito application
// This file contains utilities to help monitor and optimize component performance

import React, { memo, useCallback, useMemo } from 'react';

/**
 * Performance monitoring hook for components
 * Logs render times and helps identify performance bottlenecks
 */
export const usePerformanceMonitor = (componentName: string) => {
    useMemo(() => {
        if (process.env.NODE_ENV === 'development') {
            const startTime = performance.now();

            return () => {
                const endTime = performance.now();
                const renderTime = endTime - startTime;

                if (renderTime > 16) { // Flag renders slower than 60fps
                    console.warn(`⚠️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
                }
            };
        }
        return () => { };
    }, [componentName]);
};

/**
 * Utility to optimize object dependencies for useMemo and useCallback
 */
export const createStableObject = <T extends Record<string, any>>(obj: T): T => {
    return useMemo(() => obj, [JSON.stringify(obj)]);
};

/**
 * Enhanced memo wrapper with debugging capabilities
 */
export const memoWithDebug = <T extends React.ComponentType<any>>(
    Component: T,
    areEqual?: (prevProps: any, nextProps: any) => boolean
) => {
    const MemoizedComponent = memo(Component, areEqual);

    if (process.env.NODE_ENV === 'development') {
        MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name})`;
    }

    return MemoizedComponent;
};

/**
 * Performance-optimized array comparison for useMemo dependencies
 */
export const useStableArray = <T>(array: T[]): T[] => {
    return useMemo(() => array, [JSON.stringify(array)]);
};

/**
 * Hook to prevent unnecessary re-renders when functions change
 */
export const useStableCallback = <T extends (...args: any[]) => any>(
    callback: T,
    deps: React.DependencyList
): T => {
    return useCallback(callback, deps);
};

/**
 * Bundle size optimization - lazy import utility
 */
export const createLazyComponent = <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
) => {
    const LazyComponent = React.lazy(importFn);

    return (props: React.ComponentProps<T>) => {
        const FallbackComponent = fallback || (() => React.createElement('div', {}, 'Loading...'));
        return React.createElement(
            React.Suspense,
            { fallback: React.createElement(FallbackComponent) },
            React.createElement(LazyComponent, props)
        );
    };
};

/**
 * Memory leak prevention for event listeners
 */
export const useEventListener = (
    eventName: string,
    handler: (event: Event) => void,
    element: EventTarget = window,
    options?: AddEventListenerOptions
) => {
    const savedHandler = useCallback(handler, [handler]);

    React.useEffect(() => {
        element.addEventListener(eventName, savedHandler, options);

        return () => {
            element.removeEventListener(eventName, savedHandler, options);
        };
    }, [eventName, element, savedHandler, options]);
};

export default {
    usePerformanceMonitor,
    createStableObject,
    memoWithDebug,
    useStableArray,
    useStableCallback,
    createLazyComponent,
    useEventListener,
};

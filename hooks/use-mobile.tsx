"use client";

import { useState, useEffect } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkMobile();

    // Listen for resize events
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    // Check on mount
    checkBreakpoint();

    // Listen for resize events
    window.addEventListener("resize", checkBreakpoint);
    
    return () => window.removeEventListener("resize", checkBreakpoint);
  }, []);

  return breakpoint;
}

export function useViewportSize() {
  const [viewportSize, setViewportSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    updateSize();

    // Listen for resize events
    window.addEventListener("resize", updateSize);
    
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return viewportSize;
}

export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouchDevice;
}

// Combined hook for comprehensive mobile detection
export function useMobileDetection() {
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();
  const viewportSize = useViewportSize();
  const isTouchDevice = useTouchDevice();

  return {
    isMobile,
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    breakpoint,
    viewportSize,
    isTouchDevice,
    isSmallScreen: viewportSize.width < 640,
    isMediumScreen: viewportSize.width >= 640 && viewportSize.width < 1024,
    isLargeScreen: viewportSize.width >= 1024,
  };
}
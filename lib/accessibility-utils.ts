"use client";

import { useEffect, useRef, useCallback } from 'react';

/**
 * Accessibility Utilities for Ahorrito
 * Provides comprehensive accessibility features and ARIA helpers
 */

// ARIA role types for better type safety
export type AriaRole =
    | 'alert' | 'alertdialog' | 'application' | 'article' | 'banner'
    | 'button' | 'cell' | 'checkbox' | 'columnheader' | 'combobox'
    | 'complementary' | 'contentinfo' | 'definition' | 'dialog'
    | 'directory' | 'document' | 'feed' | 'figure' | 'form'
    | 'grid' | 'gridcell' | 'group' | 'heading' | 'img'
    | 'link' | 'list' | 'listbox' | 'listitem' | 'log'
    | 'main' | 'marquee' | 'math' | 'menu' | 'menubar'
    | 'menuitem' | 'menuitemcheckbox' | 'menuitemradio' | 'navigation'
    | 'none' | 'note' | 'option' | 'presentation' | 'progressbar'
    | 'radio' | 'radiogroup' | 'region' | 'row' | 'rowgroup'
    | 'rowheader' | 'scrollbar' | 'search' | 'searchbox'
    | 'separator' | 'slider' | 'spinbutton' | 'status'
    | 'switch' | 'tab' | 'table' | 'tablist' | 'tabpanel'
    | 'term' | 'textbox' | 'timer' | 'toolbar' | 'tooltip'
    | 'tree' | 'treegrid' | 'treeitem';

// Live region politeness levels
export type AriaLive = 'off' | 'polite' | 'assertive';

// ARIA attributes interface
export interface AriaAttributes {
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-expanded'?: boolean;
    'aria-hidden'?: boolean;
    'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
    'aria-live'?: AriaLive;
    'aria-atomic'?: boolean;
    'aria-busy'?: boolean;
    'aria-controls'?: string;
    'aria-owns'?: string;
    'aria-pressed'?: boolean;
    'aria-selected'?: boolean;
    'aria-checked'?: boolean | 'mixed';
    'aria-disabled'?: boolean;
    'aria-invalid'?: boolean | 'grammar' | 'spelling';
    'aria-required'?: boolean;
    'aria-valuemin'?: number;
    'aria-valuemax'?: number;
    'aria-valuenow'?: number;
    'aria-valuetext'?: string;
    role?: AriaRole;
}

/**
 * Enhanced ARIA attributes for different component types
 */
export const AriaHelpers = {
    // Navigation components
    navigation: (label?: string): AriaAttributes => ({
        role: 'navigation',
        'aria-label': label || 'Main navigation',
    }),

    menuItem: (isCurrent = false): AriaAttributes => ({
        role: 'menuitem',
        'aria-current': isCurrent ? 'page' : undefined,
    }),

    // Interactive components
    button: (label: string, pressed?: boolean, expanded?: boolean): AriaAttributes => ({
        role: 'button',
        'aria-label': label,
        'aria-pressed': pressed,
        'aria-expanded': expanded,
    }),

    toggle: (label: string, isPressed: boolean): AriaAttributes => ({
        role: 'button',
        'aria-label': label,
        'aria-pressed': isPressed,
    }),

    // Data display components
    status: (label?: string): AriaAttributes => ({
        role: 'status',
        'aria-label': label,
        'aria-live': 'polite',
    }),

    alert: (label?: string): AriaAttributes => ({
        role: 'alert',
        'aria-label': label,
        'aria-live': 'assertive',
    }),

    // Charts and data visualization
    chart: (title: string, description?: string): AriaAttributes => ({
        role: 'img',
        'aria-label': title,
        'aria-describedby': description ? `chart-desc-${Date.now()}` : undefined,
    }),

    // Forms
    textbox: (label: string, required = false, invalid = false): AriaAttributes => ({
        role: 'textbox',
        'aria-label': label,
        'aria-required': required,
        'aria-invalid': invalid,
    }),    // Dialogs and modals
    dialog: (title: string): any => ({
        role: 'dialog',
        'aria-modal': true,
        'aria-label': title,
    }),

    // Loading states
    loading: (label = 'Loading'): AriaAttributes => ({
        role: 'status',
        'aria-label': label,
        'aria-live': 'polite',
        'aria-busy': true,
    }),

    // Tooltips
    tooltip: (content: string): AriaAttributes => ({
        role: 'tooltip',
        'aria-label': content,
    }),
} as const;

/**
 * Focus management utilities
 */
export class FocusManager {
    private static focusStack: HTMLElement[] = [];

    // Store current focus before modal/dialog opens
    static storeFocus(): void {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement !== document.body) {
            this.focusStack.push(activeElement);
        }
    }

    // Restore focus when modal/dialog closes
    static restoreFocus(): void {
        const previousFocus = this.focusStack.pop();
        if (previousFocus && typeof previousFocus.focus === 'function') {
            try {
                previousFocus.focus();
            } catch (error) {
                console.warn('Failed to restore focus:', error);
            }
        }
    }

    // Trap focus within an element
    static trapFocus(element: HTMLElement): () => void {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;

            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        };

        element.addEventListener('keydown', handleTabKey);

        // Focus first element
        if (firstElement) {
            firstElement.focus();
        }

        // Return cleanup function
        return () => {
            element.removeEventListener('keydown', handleTabKey);
        };
    }
}

/**
 * Screen reader utilities
 */
export const ScreenReaderUtils = {
    // Announce dynamic content changes
    announceToScreenReader: (message: string, priority: AriaLive = 'polite'): void => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';

        document.body.appendChild(announcement);
        announcement.textContent = message;

        // Remove after announcement
        setTimeout(() => {
            if (announcement.parentNode) {
                announcement.parentNode.removeChild(announcement);
            }
        }, 1000);
    },

    // Create visually hidden text for screen readers
    createScreenReaderOnly: (text: string): HTMLSpanElement => {
        const span = document.createElement('span');
        span.textContent = text;
        span.style.position = 'absolute';
        span.style.left = '-10000px';
        span.style.width = '1px';
        span.style.height = '1px';
        span.style.overflow = 'hidden';
        span.setAttribute('aria-hidden', 'false');
        return span;
    },
} as const;

/**
 * Keyboard navigation utilities
 */
export const KeyboardUtils = {
    // Arrow key navigation for lists
    handleArrowNavigation: (
        event: KeyboardEvent,
        items: HTMLElement[],
        currentIndex: number,
        onIndexChange: (index: number) => void
    ): void => {
        let newIndex = currentIndex;

        switch (event.key) {
            case 'ArrowUp':
                newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                event.preventDefault();
                break;
            case 'ArrowDown':
                newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                event.preventDefault();
                break;
            case 'Home':
                newIndex = 0;
                event.preventDefault();
                break;
            case 'End':
                newIndex = items.length - 1;
                event.preventDefault();
                break;
        }

        if (newIndex !== currentIndex) {
            onIndexChange(newIndex);
            items[newIndex]?.focus();
        }
    },

    // Escape key handler
    handleEscape: (callback: () => void) => (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            callback();
        }
    },
} as const;

/**
 * Color contrast and visual accessibility
 */
export const VisualAccessibility = {
    // Check if user prefers reduced motion
    prefersReducedMotion: (): boolean => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // Check if user prefers high contrast
    prefersHighContrast: (): boolean => {
        return window.matchMedia('(prefers-contrast: high)').matches;
    },

    // Check if user prefers dark theme
    prefersDarkTheme: (): boolean => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    },

    // Calculate color contrast ratio (simplified)
    getContrastRatio: (color1: string, color2: string): number => {
        // This is a simplified version - in production, use a proper color library
        return 4.5; // Placeholder
    },
} as const;

/**
 * React hooks for accessibility
 */

// Hook for managing focus trap
export const useFocusTrap = (isActive: boolean) => {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!isActive || !elementRef.current) return;

        FocusManager.storeFocus();
        const cleanup = FocusManager.trapFocus(elementRef.current);

        return () => {
            cleanup();
            FocusManager.restoreFocus();
        };
    }, [isActive]);

    return elementRef;
};

// Hook for screen reader announcements
export const useScreenReaderAnnouncement = () => {
    return useCallback((message: string, priority: AriaLive = 'polite') => {
        ScreenReaderUtils.announceToScreenReader(message, priority);
    }, []);
};

// Hook for keyboard navigation
export const useKeyboardNavigation = (
    items: HTMLElement[],
    onSelectionChange?: (index: number) => void
) => {
    const currentIndexRef = useRef(0);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        KeyboardUtils.handleArrowNavigation(
            event,
            items,
            currentIndexRef.current,
            (newIndex) => {
                currentIndexRef.current = newIndex;
                onSelectionChange?.(newIndex);
            }
        );
    }, [items, onSelectionChange]);

    return { handleKeyDown, currentIndex: currentIndexRef.current };
};

// Hook for escape key handling
export const useEscapeKey = (callback: () => void) => {
    useEffect(() => {
        const handleEscape = KeyboardUtils.handleEscape(callback);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [callback]);
};

/**
 * Accessibility testing helpers (development only)
 */
export const AccessibilityTesting = {
    // Check for missing alt text
    checkMissingAltText: (): HTMLImageElement[] => {
        if (process.env.NODE_ENV !== 'development') return [];

        const images = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
        return images.filter(img => !img.alt && !img.getAttribute('aria-label'));
    },

    // Check for missing form labels
    checkMissingFormLabels: (): HTMLInputElement[] => {
        if (process.env.NODE_ENV !== 'development') return [];

        const inputs = Array.from(document.querySelectorAll('input, textarea, select')) as HTMLInputElement[];
        return inputs.filter(input => {
            const hasLabel = document.querySelector(`label[for="${input.id}"]`);
            const hasAriaLabel = input.getAttribute('aria-label');
            const hasAriaLabelledBy = input.getAttribute('aria-labelledby');

            return !hasLabel && !hasAriaLabel && !hasAriaLabelledBy;
        });
    },

    // Log accessibility issues
    logAccessibilityIssues: (): void => {
        if (process.env.NODE_ENV !== 'development') return;

        const missingAlt = AccessibilityTesting.checkMissingAltText();
        const missingLabels = AccessibilityTesting.checkMissingFormLabels();

        if (missingAlt.length > 0) {
            console.warn('🔍 Images missing alt text:', missingAlt);
        }

        if (missingLabels.length > 0) {
            console.warn('🔍 Form elements missing labels:', missingLabels);
        }

        if (missingAlt.length === 0 && missingLabels.length === 0) {
            console.log('✅ No accessibility issues detected');
        }
    },
} as const;

export default {
    AriaHelpers,
    FocusManager,
    ScreenReaderUtils,
    KeyboardUtils,
    VisualAccessibility,
    useFocusTrap,
    useScreenReaderAnnouncement,
    useKeyboardNavigation,
    useEscapeKey,
    AccessibilityTesting,
};

// Pricing Page Configuration and Utilities
export const pricingConfig = {
    // Animation settings
    animations: {
        staggerDelay: 0.1,
        springConfig: { type: "spring", stiffness: 100, damping: 15 },
        hoverScale: 1.02,
        tapScale: 0.98,
    },

    // Theme colors
    gradients: {
        primary: "from-blue-600 via-purple-600 to-pink-600",
        secondary: "from-emerald-500 to-teal-600",
        accent: "from-indigo-500 to-purple-600",
        background: "from-slate-50 via-blue-50/30 to-indigo-50/50",
    },

    // Component variants
    variants: {
        standard: {
            theme: "slate",
            highlight: false,
        },
        featured: {
            theme: "blue-purple",
            highlight: true,
            badge: "Most Popular",
        },
        premium: {
            theme: "emerald-teal",
            highlight: true,
            badge: "Best Value",
        },
    },

    // Testimonial data
    testimonials: {
        trustIndicators: [
            { icon: "Shield", text: "SOC 2 Compliant" },
            { icon: "Star", text: "4.9/5 Rating" },
            { icon: "TrendingUp", text: "99.9% Uptime" },
        ],
        companies: ["Goldman Sachs", "JPMorgan Chase", "Morgan Stanley"],
    },

    // FAQ categories
    faqCategories: [
        "All", "Technology", "Security", "Billing",
        "Payment", "Platform", "Plans", "Support", "Privacy"
    ],

    // Feature icons mapping
    featureIcons: {
        analytics: "BarChart3",
        security: "Shield",
        ai: "Brain",
        automation: "Zap",
        support: "Users",
        insights: "Sparkles",
        export: "Download",
        alerts: "Bell",
    },
};

// Utility functions for pricing calculations
export const pricingUtils = {
    calculateAnnualSavings: (monthlyPrice: number) => {
        // Guard against invalid input
        if (monthlyPrice <= 0) return 0;

        const annualPrice = monthlyPrice * 10; // 2 months free
        const regularAnnualPrice = monthlyPrice * 12;

        // Guard against divide-by-zero
        if (regularAnnualPrice === 0) return 0;

        return Math.round(((regularAnnualPrice - annualPrice) / regularAnnualPrice) * 100);
    },

    formatPrice: (price: number, currency = "EUR", locale = "en-IE") => {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
        }).format(price);
    },

    formatDiscount: (discount: number) => {
        return `Save ${discount}%`;
    },
};

// Animation presets for consistent motion
export const motionPresets = {
    fadeInUp: {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
    },

    fadeInLeft: {
        initial: { opacity: 0, x: -30 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.6 },
    },

    scaleIn: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5 },
    },

    slideInStagger: {
        container: {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.2,
                },
            },
        },
        item: {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
        },
    },
};

// Responsive breakpoints
export const breakpoints = {
    mobile: "320px",
    tablet: "768px",
    desktop: "1024px",
    xl: "1280px",
};

// Performance optimization settings
export const performanceConfig = {
    // Intersection observer options
    intersectionOptions: {
        threshold: 0.1,
        triggerOnce: true,
        rootMargin: "50px",
    },

    // Animation optimization
    reducedMotion: {
        duration: 0.2,
        scale: 1,
        y: 0,
    },

    // Image optimization
    imageConfig: {
        quality: 85,
        format: "webp",
        placeholder: "blur",
    },
};

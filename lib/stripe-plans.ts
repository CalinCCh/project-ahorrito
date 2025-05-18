export const plans = [
    {
        name: "Pro Weekly",
        description: "Try all premium features for a week, no commitment.",
        price: "$1.99/week",
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_WEEKLY || "price_weekly_placeholder",
    },
    {
        name: "Pro Monthly",
        description: "Enjoy the full experience with unlimited access, billed monthly.",
        price: "$5.99/month",
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || "price_monthly_placeholder",
    },
    {
        name: "Pro Annual",
        description: "Save over two months with the yearly plan and manage your finances all year long.",
        price: "$49.99/year",
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL || "price_annual_placeholder",
    },
]; 
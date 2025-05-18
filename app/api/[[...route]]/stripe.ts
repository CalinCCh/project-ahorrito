import { Hono } from 'hono';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

let stripe: Stripe | null = null;
if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-04-30.basil', // Use latest API version or specify the one you need
    });
}   

const stripeRoutes = new Hono();

stripeRoutes.post('/checkout', async (c) => {
    if (!stripe) {
        return c.json({ error: 'Stripe not configured' }, 500);
    }
    try {
        const { plan: priceId } = await c.req.json();
        if (!priceId || typeof priceId !== 'string') {
            return c.json({ error: 'Invalid priceId' }, 400);
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pro?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
        });
        return c.json({ url: session.url });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

stripeRoutes.post('/webhook', async (c) => {
    // TODO: Implement Stripe webhook logic
    return c.text('Webhook received');
});

export default stripeRoutes; 
import { Hono } from 'hono';
import Stripe from 'stripe';
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { db } from "@/db/drizzle";
import { userSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

let stripe: Stripe | null = null;
if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-04-30.basil', 
    });
}   

const stripeRoutes = new Hono()
  .use("*", clerkMiddleware());

stripeRoutes.post('/checkout', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
    }
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
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
            metadata: {
                userId: auth.userId,
                priceId: priceId,
            },
        });
        return c.json({ url: session.url });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

stripeRoutes.post('/webhook', async (c) => {
    if (!stripe) {
        return c.json({ error: 'Stripe not configured' }, 500);
    }

    try {
        const body = await c.req.text();
        const sig = c.req.header('stripe-signature');
        
        if (!sig) {
            return c.json({ error: 'Missing signature' }, 400);
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            return c.json({ error: 'Webhook secret not configured' }, 500);
        }

        const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                
                if (session.mode === 'subscription' && session.metadata?.userId) {
                    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                    const priceId = session.metadata.priceId;
                    let planType = 'monthly';
                    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_WEEKLY) {
                        planType = 'weekly';
                    } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL) {
                        planType = 'annual';
                    } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY) {
                        planType = 'monthly';
                    } else {
                        // Fallback to keyword detection
                        if (priceId?.includes('weekly')) planType = 'weekly';
                        else if (priceId?.includes('annual')) planType = 'annual';
                        else planType = 'monthly';
                    }
                    
                    console.log('🎯 Creating VIP subscription:', {
                        userId: session.metadata.userId,
                        planType,
                        priceId,
                        subscriptionId: subscription.id,
                        periodStart: new Date((subscription as any).current_period_start * 1000),
                        periodEnd: new Date((subscription as any).current_period_end * 1000)
                    });
                    
                    // Create or update subscription in database
                    await db.insert(userSubscriptions).values({
                        id: createId(),
                        userId: session.metadata.userId,
                        stripeCustomerId: session.customer as string,
                        stripeSubscriptionId: subscription.id,
                        stripePriceId: priceId,
                        plan: planType,
                        status: 'active',
                        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
                        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                        cancelAtPeriodEnd: 'false',
                    }).onConflictDoUpdate({
                        target: userSubscriptions.userId,
                        set: {
                            stripeCustomerId: session.customer as string,
                            stripeSubscriptionId: subscription.id,
                            stripePriceId: priceId,
                            plan: planType,
                            status: 'active',
                            currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
                            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                            cancelAtPeriodEnd: 'false',
                            updatedAt: new Date(),
                        }
                    });
                    
                    console.log('✅ VIP subscription created/updated successfully');
                }
                break;
            }
            
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('🔄 Subscription updated:', {
                    subscriptionId: subscription.id,
                    status: subscription.status,
                    cancelAtPeriodEnd: subscription.cancel_at_period_end
                });
                
                await db.update(userSubscriptions)
                    .set({
                        status: subscription.status === 'active' ? 'active' : 'inactive',
                        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
                        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                        cancelAtPeriodEnd: subscription.cancel_at_period_end ? 'true' : 'false',
                        updatedAt: new Date(),
                    })
                    .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
                break;
            }
            
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('❌ Subscription deleted:', {
                    subscriptionId: subscription.id
                });
                
                await db.update(userSubscriptions)
                    .set({
                        status: 'canceled',
                        updatedAt: new Date(),
                    })
                    .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
                break;
            }
        }

        return c.json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return c.json({ error: error.message }, 400);
    }
});

export default stripeRoutes; 
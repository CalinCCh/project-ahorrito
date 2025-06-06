import { Hono } from "hono";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { db } from "@/db/drizzle";
import { userSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";

const app = new Hono()
  .use("*", clerkMiddleware())
  .get("/current", async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const [subscription] = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, auth.userId))
        .limit(1);

      if (!subscription) {
        return c.json({ error: "No subscription found" }, 404);
      }

      return c.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .post("/create-or-update", 
    zValidator("json", z.object({
      userId: z.string(),
      stripeCustomerId: z.string().optional(),
      stripeSubscriptionId: z.string().optional(),
      stripePriceId: z.string().optional(),
      plan: z.string(),
      status: z.enum(["active", "inactive", "canceled", "past_due"]),
      currentPeriodStart: z.string().datetime().optional(),
      currentPeriodEnd: z.string().datetime().optional(),
      cancelAtPeriodEnd: z.boolean().optional(),
    })),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = c.req.valid("json");

      try {
        // Check if subscription exists
        const [existingSubscription] = await db
          .select()
          .from(userSubscriptions)
          .where(eq(userSubscriptions.userId, data.userId))
          .limit(1);

        if (existingSubscription) {
          // Update existing subscription
          const [updated] = await db
            .update(userSubscriptions)
            .set({
              stripeCustomerId: data.stripeCustomerId,
              stripeSubscriptionId: data.stripeSubscriptionId,
              stripePriceId: data.stripePriceId,
              plan: data.plan,
              status: data.status,
              currentPeriodStart: data.currentPeriodStart ? new Date(data.currentPeriodStart) : undefined,
              currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : undefined,
              cancelAtPeriodEnd: data.cancelAtPeriodEnd ? "true" : "false",
              updatedAt: new Date(),
            })
            .where(eq(userSubscriptions.userId, data.userId))
            .returning();

          return c.json(updated);
        } else {
          // Create new subscription
          const [created] = await db
            .insert(userSubscriptions)
            .values({
              id: createId(),
              userId: data.userId,
              stripeCustomerId: data.stripeCustomerId,
              stripeSubscriptionId: data.stripeSubscriptionId,
              stripePriceId: data.stripePriceId,
              plan: data.plan,
              status: data.status,
              currentPeriodStart: data.currentPeriodStart ? new Date(data.currentPeriodStart) : undefined,
              currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : undefined,
              cancelAtPeriodEnd: data.cancelAtPeriodEnd ? "true" : "false",
            })
            .returning();

          return c.json(created);
        }
      } catch (error) {
        console.error("Error creating/updating subscription:", error);
        return c.json({ error: "Internal server error" }, 500);
      }
    }
  );

export default app;
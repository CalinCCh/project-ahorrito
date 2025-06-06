import { Hono } from "hono";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { db } from "@/db/drizzle";
import { userSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";

const app = new Hono()
  .use("*", clerkMiddleware());

// Admin endpoint to make a user VIP
app.post("/make-vip", 
  zValidator("json", z.object({
    userId: z.string(),
    plan: z.enum(["weekly", "monthly", "annual"]).default("annual"),
    durationDays: z.number().default(365),
  })),
  async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Simple admin check - you can make this more sophisticated
    const adminUserIds = [
      "user_2r9QjHjGJ5rCjXoXSq4W8b7cG6Z", // Replace with actual admin user IDs
      // Add more admin user IDs here
    ];

    if (!adminUserIds.includes(auth.userId)) {
      return c.json({ error: "Admin access required" }, 403);
    }

    const { userId, plan, durationDays } = c.req.valid("json");

    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(now.getDate() + durationDays);

      const [vipSubscription] = await db.insert(userSubscriptions).values({
        id: createId(),
        userId,
        stripeCustomerId: `cus_admin_${userId}`,
        stripeSubscriptionId: `sub_admin_${userId}`,
        stripePriceId: `price_${plan}_admin`,
        plan,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: endDate,
        cancelAtPeriodEnd: "false",
      }).onConflictDoUpdate({
        target: userSubscriptions.userId,
        set: {
          stripeCustomerId: `cus_admin_${userId}`,
          stripeSubscriptionId: `sub_admin_${userId}`,
          stripePriceId: `price_${plan}_admin`,
          plan,
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: endDate,
          cancelAtPeriodEnd: "false",
          updatedAt: new Date(),
        }
      }).returning();

      return c.json({
        success: true,
        message: `User ${userId} is now VIP!`,
        subscription: vipSubscription,
        daysRemaining: durationDays,
      });

    } catch (error) {
      console.error("Error making user VIP:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// Admin endpoint to remove VIP status
app.post("/remove-vip", 
  zValidator("json", z.object({
    userId: z.string(),
  })),
  async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Simple admin check
    const adminUserIds = [
      "user_2r9QjHjGJ5rCjXoXSq4W8b7cG6Z", // Replace with actual admin user IDs
    ];

    if (!adminUserIds.includes(auth.userId)) {
      return c.json({ error: "Admin access required" }, 403);
    }

    const { userId } = c.req.valid("json");

    try {
      await db.update(userSubscriptions)
        .set({
          status: "canceled",
          updatedAt: new Date(),
        })
        .where(eq(userSubscriptions.userId, userId));

      return c.json({
        success: true,
        message: `VIP status removed for user ${userId}`,
      });

    } catch (error) {
      console.error("Error removing VIP:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// Admin endpoint to list all VIP users
app.get("/list-vips", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Simple admin check
  const adminUserIds = [
    "user_2r9QjHjGJ5rCjXoXSq4W8b7cG6Z", // Replace with actual admin user IDs
  ];

  if (!adminUserIds.includes(auth.userId)) {
    return c.json({ error: "Admin access required" }, 403);
  }

  try {
    const vipUsers = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.status, "active"));

    const now = new Date();
    const vipList = vipUsers.map(user => ({
      ...user,
      daysRemaining: user.currentPeriodEnd 
        ? Math.max(0, Math.ceil((user.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0,
      isActive: user.currentPeriodEnd ? now < user.currentPeriodEnd : false,
    }));

    return c.json({
      success: true,
      vipUsers: vipList,
      totalVips: vipList.length,
    });

  } catch (error) {
    console.error("Error listing VIPs:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
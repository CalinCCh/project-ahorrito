import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";

import { db } from "@/db/drizzle";
import { predefinedCategories } from "@/db/schema";
import { asc } from 'drizzle-orm';

const app = new Hono()
  .get(
    "/",
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      } const data = await db
        .select({
          id: predefinedCategories.id,
          name: predefinedCategories.name,
          emoji: predefinedCategories.emoji,
          icon: predefinedCategories.icon,
        })
        .from(predefinedCategories)
        .orderBy(asc(predefinedCategories.name));

      return c.json({ data });
    }
  );

export default app;
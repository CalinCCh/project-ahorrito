import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { cors } from 'hono/cors';
import { db } from "@/db/drizzle";
import { userLevels } from "@/db/schema";

const app = new Hono()
    .use('*', cors({
        origin: ['http://localhost:3000', 'https://your-domain.com'],
        credentials: true,
    }))
    .get(
        "/",
        clerkMiddleware(),
        async (c) => {
            try {
                const auth = getAuth(c);

                if (!auth?.userId) {
                    return c.json({ error: "Unauthorized" }, 401);
                }

                // Get user level data
                const userLevel = await db.query.userLevels.findFirst({
                    where: eq(userLevels.userId, auth.userId),
                });

                // If no level data exists, create default level
                if (!userLevel) {
                    const [newUserLevel] = await db.insert(userLevels).values({
                        id: `level_${auth.userId}`,
                        userId: auth.userId,
                        currentLevel: 1,
                        totalXp: 0,
                        levelProgress: 0,
                        updatedAt: new Date(),
                    }).returning();

                    return c.json({
                        success: true,
                        data: newUserLevel
                    });
                }

                return c.json({
                    success: true,
                    data: userLevel
                });

            } catch (error: any) {
                console.error('[API][GET /user-levels] Error:', error);
                return c.json({
                    success: false,
                    error: "Error al obtener niveles de usuario",
                    details: error?.message || "Error desconocido"
                }, { status: 500 });
            }
        }
    );

export default app;
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import {
    achievementDefinitions,
    userAchievements,
    userLevels,
    savingsGoals
} from "@/db/schema";
import {
    eq,
    and,
    sql,
    desc,
    count,
    sum
} from "drizzle-orm";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";

const app = new Hono()
    .use("*", clerkMiddleware());

app.get("/", async (c) => {
    try {
        const auth = getAuth(c);

        if (!auth?.userId) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        // Get all achievement definitions
        const definitions = await db
            .select()
            .from(achievementDefinitions)
            .orderBy(achievementDefinitions.category, achievementDefinitions.xpReward);

        // Get user progress for each achievement
        const userProgress = await db
            .select()
            .from(userAchievements)
            .where(eq(userAchievements.userId, auth.userId));

        // Combine definitions with user progress
        const achievements = definitions.map(def => {
            const progress = userProgress.find(p => p.achievementId === def.id);
            // Parse requirements safely if it's a string; else assume it's already an object
            const requirements =
                typeof def.requirements === 'string'
                    ? JSON.parse(def.requirements)
                    : def.requirements;
            return {
                ...def,
                progress: progress?.progress || 0,
                currentValue: progress?.currentValue || 0,
                targetValue: progress?.targetValue || requirements.target || 1,
                completedAt: progress?.completedAt,
                unlockedAt: progress?.unlockedAt,
                isCompleted: !!progress?.completedAt,
                isUnlocked: !!progress,
                progressPercentage: progress ? Math.min((progress.currentValue || 0) / (progress.targetValue || 1) * 100, 100) : 0
            };
        });

        return c.json({ achievements });
    } catch (error) {
        console.error("Error fetching achievements:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

// Get user level and XP
app.get("/level", async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {
        let userLevel = await db
            .select()
            .from(userLevels)
            .where(eq(userLevels.userId, auth.userId))
            .limit(1);

        if (userLevel.length === 0) {
            // Create initial level record
            const newLevelId = `ulvl_${createId()}`; // Using createId for robust unique ID
            await db
                .insert(userLevels)
                .values({
                    id: newLevelId,
                    userId: auth.userId,
                    currentLevel: 1,
                    totalXp: 0,
                    levelProgress: 0,
                    updatedAt: new Date()
                });

            userLevel = [{
                id: newLevelId,
                userId: auth.userId,
                currentLevel: 1,
                totalXp: 0,
                levelProgress: 0,
                updatedAt: new Date()
            }];
        }

        const levelData = userLevel[0];

        const currentLevelVal = levelData.currentLevel || 1;
        const totalXpVal = levelData.totalXp || 0;

        // Calculate XP thresholds
        const calculateXpForLevel = (lvl: number): number => {
            if (lvl <= 0) return 0;
            // Simpler formula: Base XP + (Level * Increment) ^ Exponent
            // Example: 100 * level or 50 * level^1.2 etc.
            // Using the existing formula structure for now:
            return (lvl * 100 + Math.pow(lvl, 1.5) * 50);
        };

        const xpForNextLevelTarget = calculateXpForLevel(currentLevelVal); // XP needed to *reach* this level's end / next level's start
        const xpAtCurrentLevelStart = calculateXpForLevel(currentLevelVal - 1); // XP needed to *start* this current level

        const progressWithinCurrentLevel = Math.max(0, totalXpVal - xpAtCurrentLevelStart);
        const xpRequiredForThisLevel = Math.max(1, xpForNextLevelTarget - xpAtCurrentLevelStart); // Denominator, ensure > 0

        let calculatedProgressPercentage = 0;
        if (xpRequiredForThisLevel > 0) {
            calculatedProgressPercentage = (progressWithinCurrentLevel / xpRequiredForThisLevel) * 100;
        } else if (totalXpVal >= xpForNextLevelTarget) {
            calculatedProgressPercentage = 100;
        }

        // Clamp and ensure finite
        calculatedProgressPercentage = Math.min(Math.max(calculatedProgressPercentage, 0), 100);
        if (!Number.isFinite(calculatedProgressPercentage)) {
            calculatedProgressPercentage = 0;
        }

        const xpNeededToReachNextLevel = Math.max(0, xpForNextLevelTarget - totalXpVal);

        return c.json({
            level: currentLevelVal,
            totalXp: totalXpVal,
            xpForNextLevel: Math.ceil(xpForNextLevelTarget), // Total XP target for next level
            xpProgress: Math.ceil(progressWithinCurrentLevel), // XP accumulated within the current level
            xpNeeded: Math.ceil(xpNeededToReachNextLevel), // XP still needed to hit next level target
            progressPercentage: calculatedProgressPercentage
        });
    } catch (error) {
        console.error("Error fetching user level:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

// Get achievement statistics
app.get("/stats", async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {        // Count completed achievements
        const completedCount = await db
            .select({ count: count() })
            .from(userAchievements)
            .where(
                and(
                    eq(userAchievements.userId, auth.userId),
                    sql`${userAchievements.completedAt} IS NOT NULL`
                )
            );        // Count total achievements
        const totalCount = await db
            .select({ count: count() })
            .from(achievementDefinitions);

        // Get recent achievements (last 5)
        const recentAchievements = await db
            .select({
                name: achievementDefinitions.name,
                badgeIcon: achievementDefinitions.badgeIcon,
                badgeColor: achievementDefinitions.badgeColor,
                xpReward: achievementDefinitions.xpReward,
                completedAt: userAchievements.completedAt
            })
            .from(userAchievements)
            .innerJoin(achievementDefinitions, eq(userAchievements.achievementId, achievementDefinitions.id))
            .where(
                and(
                    eq(userAchievements.userId, auth.userId),
                    sql`${userAchievements.completedAt} IS NOT NULL`
                )
            ).orderBy(desc(userAchievements.completedAt))
            .limit(5);

        return c.json({
            completedCount: completedCount[0].count,
            totalCount: totalCount[0].count,
            completionPercentage: (completedCount[0].count / totalCount[0].count) * 100,
            recentAchievements: recentAchievements.map(achievement => ({
                name: achievement.name,
                badgeIcon: achievement.badgeIcon,
                badgeColor: achievement.badgeColor,
                xpReward: achievement.xpReward,
                completedAt: achievement.completedAt
            }))
        });
    } catch (error) {
        console.error("Error fetching achievement stats:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

// Check and update achievements progress
app.post("/check", async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {
        const newlyUnlocked = [];
        const newlyCompleted = [];

        // Get all achievement definitions
        const definitions = await db
            .select()
            .from(achievementDefinitions);

        for (const definition of definitions) {
            const requirements = definition.requirements as any;
            let currentValue = 0;
            let shouldUnlock = false;            // Calculate current value based on achievement type
            switch (requirements.type) {
                case 'savings_goals_created':
                    const goalsCreated = await db
                        .select({ count: count() })
                        .from(savingsGoals)
                        .where(eq(savingsGoals.userId, auth.userId));
                    currentValue = goalsCreated[0].count;
                    shouldUnlock = currentValue > 0;
                    break;

                case 'savings_goals_completed':
                    const goalsCompleted = await db
                        .select({ count: count() })
                        .from(savingsGoals)
                        .where(
                            and(
                                eq(savingsGoals.userId, auth.userId),
                                sql`${savingsGoals.currentAmount} >= ${savingsGoals.targetAmount}`
                            )
                        );
                    currentValue = goalsCompleted[0].count;
                    shouldUnlock = currentValue > 0;
                    break;

                case 'total_amount_saved':
                    const totalSaved = await db
                        .select({
                            total: sql`COALESCE(SUM(${savingsGoals.currentAmount}), 0)`
                        })
                        .from(savingsGoals)
                        .where(eq(savingsGoals.userId, auth.userId));
                    currentValue = parseInt(totalSaved[0].total as string) || 0;
                    shouldUnlock = currentValue > 0;
                    break; default:
                    shouldUnlock = false;
                    break;
            }

            // Check if user already has this achievement
            const existingProgress = await db
                .select()
                .from(userAchievements)
                .where(
                    and(
                        eq(userAchievements.userId, auth.userId),
                        eq(userAchievements.achievementId, definition.id)
                    )
                )
                .limit(1); if (shouldUnlock && existingProgress.length === 0) {
                    // Unlock the achievement
                    await db
                        .insert(userAchievements)
                        .values({
                            id: `achievement_${auth.userId}_${definition.id}`,
                            userId: auth.userId,
                            achievementId: definition.id,
                            currentValue: currentValue,
                            targetValue: requirements.target,
                            progress: Math.min((currentValue / requirements.target) * 100, 100),
                            unlockedAt: new Date()
                        });

                    newlyUnlocked.push({
                        id: definition.id,
                        name: definition.name,
                        description: definition.description,
                        badgeIcon: definition.badgeIcon,
                        badgeColor: definition.badgeColor,
                        xpReward: definition.xpReward
                    });
                } else if (existingProgress.length > 0) {
                    // Update existing progress
                    const isCompleted = currentValue >= requirements.target;
                    const wasCompleted = !!existingProgress[0].completedAt;

                    await db
                        .update(userAchievements)
                        .set({
                            currentValue: currentValue,
                            progress: Math.min((currentValue / requirements.target) * 100, 100),
                            completedAt: isCompleted && !wasCompleted ? new Date() : existingProgress[0].completedAt
                        }).where(
                            and(
                                eq(userAchievements.userId, auth.userId),
                                eq(userAchievements.achievementId, definition.id)
                            )
                        );

                    if (isCompleted && !wasCompleted) {
                        newlyCompleted.push({
                            id: definition.id,
                            name: definition.name,
                            description: definition.description,
                            badgeIcon: definition.badgeIcon, badgeColor: definition.badgeColor,
                            xpReward: definition.xpReward
                        });                        // Award XP
                        await db
                            .insert(userLevels)
                            .values({
                                id: `level_${auth.userId}`,
                                userId: auth.userId,
                                totalXp: Number(definition.xpReward) || 0,
                                currentLevel: 1,
                                levelProgress: 0
                            })
                            .onConflictDoUpdate({
                                target: userLevels.userId,
                                set: {
                                    totalXp: sql`${userLevels.totalXp} + ${Number(definition.xpReward) || 0}`,
                                    updatedAt: new Date()
                                }
                            });

                        // Check for level up
                        const updatedUserLevel = await db
                            .select()
                            .from(userLevels)
                            .where(eq(userLevels.userId, auth.userId))
                            .limit(1);

                        if (updatedUserLevel.length > 0) {
                            const level = updatedUserLevel[0];
                            const xpForNextLevel = (level.currentLevel || 1) * 100 + Math.pow((level.currentLevel || 1), 1.5) * 50;

                            if ((level.totalXp || 0) >= xpForNextLevel) {
                                await db
                                    .update(userLevels)
                                    .set({
                                        currentLevel: (level.currentLevel || 1) + 1,
                                        updatedAt: new Date()
                                    })
                                    .where(eq(userLevels.userId, auth.userId));
                            }
                        }
                    }
                }
        }

        return c.json({
            newlyUnlocked: newlyUnlocked,
            newlyCompleted: newlyCompleted,
            success: true
        });
    } catch (error) {
        console.error("Error checking achievements:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

// Get detailed level information
app.get("/level/details", async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {
        let userLevel = await db
            .select()
            .from(userLevels)
            .where(eq(userLevels.userId, auth.userId))
            .limit(1);

        if (userLevel.length === 0) {
            // Create initial level record
            const newLevelId = `ulvl_${createId()}`;
            await db
                .insert(userLevels)
                .values({
                    id: newLevelId,
                    userId: auth.userId,
                    currentLevel: 1,
                    totalXp: 0,
                    levelProgress: 0,
                    updatedAt: new Date()
                });

            userLevel = [{
                id: newLevelId,
                userId: auth.userId,
                currentLevel: 1,
                totalXp: 0,
                levelProgress: 0,
                updatedAt: new Date()
            }];
        }

        const levelData = userLevel[0];
        const currentLevel = levelData.currentLevel || 1;
        const totalXp = levelData.totalXp || 0;

        // Calculate XP for multiple levels
        const calculateXpForLevel = (lvl: number): number => {
            if (lvl <= 0) return 0;
            return (lvl * 100 + Math.pow(lvl, 1.5) * 50);
        };

        // Get level progression info
        const levelInfo = {
            currentLevel,
            totalXp,
            xpForCurrentLevel: calculateXpForLevel(currentLevel - 1),
            xpForNextLevel: calculateXpForLevel(currentLevel),
            nextLevels: Array.from({ length: 5 }, (_, i) => ({
                level: currentLevel + i + 1,
                xpRequired: calculateXpForLevel(currentLevel + i + 1),
                xpNeeded: Math.max(0, calculateXpForLevel(currentLevel + i + 1) - totalXp)
            }))
        };

        // Get recent XP gains (from completed achievements)
        const recentXpGains = await db
            .select({
                achievementName: achievementDefinitions.name,
                xpReward: achievementDefinitions.xpReward,
                completedAt: userAchievements.completedAt
            })
            .from(userAchievements)
            .innerJoin(achievementDefinitions, eq(userAchievements.achievementId, achievementDefinitions.id))
            .where(
                and(
                    eq(userAchievements.userId, auth.userId),
                    sql`${userAchievements.completedAt} IS NOT NULL`
                )
            )
            .orderBy(desc(userAchievements.completedAt))
            .limit(10);

        return c.json({
            ...levelInfo,
            recentXpGains
        });
    } catch (error) {
        console.error("Error fetching detailed level info:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

// Get user level ranking
app.get("/level/ranking", async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {
        // Get user's current level and XP
        const userLevel = await db
            .select()
            .from(userLevels)
            .where(eq(userLevels.userId, auth.userId))
            .limit(1);

        if (userLevel.length === 0) {
            return c.json({
                userRank: null,
                userLevel: 1,
                userXp: 0,
                totalUsers: 0,
                topUsers: []
            });
        }

        const userData = userLevel[0];

        // Get ranking - users with higher XP
        const [{ usersAhead = 0 } = {}] = await db
            .select({ usersAhead: count() })
            .from(userLevels)
            .where(sql`${userLevels.totalXp} > ${userData.totalXp}`);

        // Get total number of users
        const [{ totalUsers = 0 } = {}] = await db
            .select({ totalUsers: count() })
            .from(userLevels);

        // Get top 10 users (without exposing user IDs for privacy)
        const topUsers = await db
            .select({
                level: userLevels.currentLevel,
                totalXp: userLevels.totalXp,
                isCurrentUser: sql`CASE WHEN ${userLevels.userId} = ${auth.userId} THEN true ELSE false END`
            })
            .from(userLevels)
            .orderBy(desc(userLevels.totalXp), desc(userLevels.currentLevel))
            .limit(10);

        return c.json({
            userRank: usersAhead + 1,
            userLevel: userData.currentLevel,
            userXp: userData.totalXp,
            totalUsers,
            topUsers
        });
    } catch (error) {
        console.error("Error fetching level ranking:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

// Export Hono app directly for sub-routing
export default app;

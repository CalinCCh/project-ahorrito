import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { savingsGoals, savingsContributions, savingsMilestones } from "@/db/schema";
import { eq, and, desc, sum, count, sql } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";

const app = new Hono()
  .use("*", clerkMiddleware())
  .get("/", async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const goals = await db
        .select({
          id: savingsGoals.id,
          name: savingsGoals.name,
          description: savingsGoals.description,
          targetAmount: savingsGoals.targetAmount,
          currentAmount: savingsGoals.currentAmount,
          currency: savingsGoals.currency,
          category: savingsGoals.category,
          emoji: savingsGoals.emoji,
          color: savingsGoals.color,
          priority: savingsGoals.priority,
          targetDate: savingsGoals.targetDate,
          monthlyContribution: savingsGoals.monthlyContribution,
          autoSave: savingsGoals.autoSave,
          status: savingsGoals.status,
          createdAt: savingsGoals.createdAt,
          updatedAt: savingsGoals.updatedAt,
          completedAt: savingsGoals.completedAt,
        })
        .from(savingsGoals)
        .where(eq(savingsGoals.userId, auth.userId))
        .orderBy(desc(savingsGoals.createdAt));

      return c.json({ data: goals });
    } catch (error) {
      console.error("Error fetching savings goals:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        targetAmount: z.number().min(1),
        category: z.string().min(1),
        emoji: z.string().optional(),
        color: z.string().optional(),
        priority: z.enum(["high", "medium", "low"]).optional(),
        targetDate: z.string().optional(),
        monthlyContribution: z.number().min(0).optional(),
        autoSave: z.enum(["manual", "daily", "weekly", "monthly"]).optional(),
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const values = c.req.valid("json");

      try {
        const goalId = createId();

        const [goal] = await db
          .insert(savingsGoals)
          .values({
            id: goalId,
            userId: auth.userId,
            name: values.name,
            description: values.description,
            targetAmount: Math.round(values.targetAmount * 100), // convertir a centavos
            category: values.category,
            emoji: values.emoji || "🎯",
            color: values.color || "blue",
            priority: values.priority || "medium",
            targetDate: values.targetDate ? new Date(values.targetDate) : null,
            monthlyContribution: values.monthlyContribution ? Math.round(values.monthlyContribution * 100) : 0,
            autoSave: values.autoSave || "manual",
          })
          .returning();

        // Crear hitos automáticos (25%, 50%, 75%, 100%)
        const milestones = [
          { percentage: 25, name: "¡Primer cuarto!", emoji: "🌟" },
          { percentage: 50, name: "¡A la mitad!", emoji: "🎉" },
          { percentage: 75, name: "¡Casi listo!", emoji: "🚀" },
          { percentage: 100, name: "¡Meta alcanzada!", emoji: "🏆" },
        ];

        for (const milestone of milestones) {
          await db.insert(savingsMilestones).values({
            id: createId(),
            goalId: goalId,
            name: milestone.name,
            percentage: milestone.percentage,
            targetAmount: Math.round((values.targetAmount * milestone.percentage / 100) * 100),
            emoji: milestone.emoji,
            rewardMessage: `¡Felicidades! Has alcanzado el ${milestone.percentage}% de tu meta "${values.name}". ¡Sigue así!`,
          });
        }

        return c.json({ data: goal }, 201);
      } catch (error) {
        console.error("Error creating savings goal:", error);
        return c.json({ error: "Internal server error" }, 500);
      }
    }
  )
  .get("/:id", async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");

    try {
      const [goal] = await db
        .select()
        .from(savingsGoals)
        .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, auth.userId)));

      if (!goal) {
        return c.json({ error: "Goal not found" }, 404);
      }

      // Obtener contribuciones
      const contributions = await db
        .select()
        .from(savingsContributions)
        .where(eq(savingsContributions.goalId, id))
        .orderBy(desc(savingsContributions.createdAt));

      // Obtener hitos
      const milestones = await db
        .select()
        .from(savingsMilestones)
        .where(eq(savingsMilestones.goalId, id))
        .orderBy(savingsMilestones.percentage);

      return c.json({
        data: {
          ...goal,
          contributions,
          milestones,
        },
      });
    } catch (error) {
      console.error("Error fetching savings goal:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .patch(
    "/:id",
    zValidator(
      "json",
      z.object({
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        targetAmount: z.number().min(1).optional(),
        category: z.string().min(1).optional(),
        emoji: z.string().optional(),
        color: z.string().optional(),
        priority: z.enum(["high", "medium", "low"]).optional(),
        targetDate: z.string().optional(),
        monthlyContribution: z.number().min(0).optional(),
        autoSave: z.enum(["manual", "daily", "weekly", "monthly"]).optional(),
        status: z.enum(["active", "completed", "paused", "cancelled"]).optional(),
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const id = c.req.param("id");
      const values = c.req.valid("json");

      try {
        const updateData: any = {
          updatedAt: new Date(),
        };

        if (values.name) updateData.name = values.name;
        if (values.description !== undefined) updateData.description = values.description;
        if (values.targetAmount) updateData.targetAmount = Math.round(values.targetAmount * 100);
        if (values.category) updateData.category = values.category;
        if (values.emoji) updateData.emoji = values.emoji;
        if (values.color) updateData.color = values.color;
        if (values.priority) updateData.priority = values.priority;
        if (values.targetDate) updateData.targetDate = new Date(values.targetDate);
        if (values.monthlyContribution !== undefined) {
          updateData.monthlyContribution = Math.round(values.monthlyContribution * 100);
        }
        if (values.autoSave) updateData.autoSave = values.autoSave;
        if (values.status) {
          updateData.status = values.status;
          if (values.status === "completed") {
            updateData.completedAt = new Date();
          }
        }

        const [updatedGoal] = await db
          .update(savingsGoals)
          .set(updateData)
          .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, auth.userId)))
          .returning();

        if (!updatedGoal) {
          return c.json({ error: "Goal not found" }, 404);
        }

        return c.json({ data: updatedGoal });
      } catch (error) {
        console.error("Error updating savings goal:", error);
        return c.json({ error: "Internal server error" }, 500);
      }
    }
  )
  .delete("/:id", async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");

    try {
      const [deletedGoal] = await db
        .delete(savingsGoals)
        .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, auth.userId)))
        .returning();

      if (!deletedGoal) {
        return c.json({ error: "Goal not found" }, 404);
      } return c.json({ data: deletedGoal });
    } catch (error) {
      console.error("Error deleting savings goal:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .get("/summary", async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      // Try to fetch summary from savings_summary table using raw SQL
      const summaryResult = await db.execute(
        sql`SELECT * FROM savings_summary WHERE user_id = ${auth.userId}`
      );

      const summary = summaryResult.rows && summaryResult.rows.length > 0 ? summaryResult.rows[0] : null;

      if (summary) {
        const totalSaved = Number(summary.total_saved) || 0;
        const totalTarget = Number(summary.total_target) || 0;
        const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

        return c.json({
          data: {
            totalSaved,
            totalTarget,
            overallProgress,
            activeGoalsCount: Number(summary.active_goals_count) || 0,
            completedGoalsCount: Number(summary.completed_goals_count) || 0,
            currency: summary.currency || 'EUR',
          }
        });
      } else {
        // fallback to old logic if summary not found
        return c.json({
          data: {
            totalSaved: 0,
            totalTarget: 0,
            overallProgress: 0,
            activeGoalsCount: 0,
            completedGoalsCount: 0,
            currency: 'EUR'
          }
        });
      }
    } catch (error) {
      console.error("Error fetching savings summary:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  });

export default app;

import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { savingsGoals, savingsContributions, savingsMilestones } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
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
      // Obtener todas las contribuciones del usuario con información de la meta
      const contributions = await db
        .select({
          id: savingsContributions.id,
          goalId: savingsContributions.goalId,
          amount: savingsContributions.amount,
          type: savingsContributions.type,
          source: savingsContributions.source,
          notes: savingsContributions.notes,
          createdAt: savingsContributions.createdAt,
          goalName: savingsGoals.name,
          goalCategory: savingsGoals.category,
        })
        .from(savingsContributions)
        .innerJoin(savingsGoals, eq(savingsContributions.goalId, savingsGoals.id))
        .where(eq(savingsGoals.userId, auth.userId))
        .orderBy(desc(savingsContributions.createdAt));

      return c.json({ data: contributions });
    } catch (error) {
      console.error("Error fetching contributions:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        goalId: z.string(),
        amount: z.number().min(0.01),
        type: z.enum(["manual", "auto", "transfer"]).optional(),
        source: z.string().optional(),
        notes: z.string().optional(),
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const values = c.req.valid("json");

      try {
        // Verificar que la meta pertenezca al usuario
        const [goal] = await db
          .select()
          .from(savingsGoals)
          .where(and(eq(savingsGoals.id, values.goalId), eq(savingsGoals.userId, auth.userId)));

        if (!goal) {
          return c.json({ error: "Goal not found" }, 404);
        }

        if (goal.status !== "active") {
          return c.json({ error: "Cannot contribute to inactive goal" }, 400);
        }

        // Crear contribución
        const [contribution] = await db
          .insert(savingsContributions)
          .values({
            id: createId(),
            goalId: values.goalId,
            amount: Math.round(values.amount * 100), // convertir a centavos
            type: values.type || "manual",
            source: values.source,
            notes: values.notes,
          })
          .returning();

        // Actualizar el monto actual de la meta
        const newCurrentAmount = goal.currentAmount + Math.round(values.amount * 100);

        await db
          .update(savingsGoals)
          .set({
            currentAmount: newCurrentAmount,
            updatedAt: new Date(),
          })
          .where(eq(savingsGoals.id, values.goalId));

        // Verificar si se alcanzaron hitos
        const milestones = await db
          .select()
          .from(savingsMilestones)
          .where(eq(savingsMilestones.goalId, values.goalId));

        const updatedMilestones = [];
        for (const milestone of milestones) {
          if (milestone.isCompleted === "false" && newCurrentAmount >= milestone.targetAmount) {
            const [updatedMilestone] = await db
              .update(savingsMilestones)
              .set({
                isCompleted: "true",
                completedAt: new Date(),
              })
              .where(eq(savingsMilestones.id, milestone.id))
              .returning();
            updatedMilestones.push(updatedMilestone);
          }
        }

        // Verificar si se completó la meta
        let goalCompleted = false;
        if (newCurrentAmount >= goal.targetAmount && goal.status === "active") {
          await db
            .update(savingsGoals)
            .set({
              status: "completed",
              completedAt: new Date(),
            })
            .where(eq(savingsGoals.id, values.goalId));
          goalCompleted = true;
        }

        return c.json({
          data: {
            contribution,
            newProgress: {
              currentAmount: newCurrentAmount,
              percentage: Math.min((newCurrentAmount / goal.targetAmount) * 100, 100),
              goalCompleted,
              milestonesReached: updatedMilestones,
            },
          },
        }, 201);
      } catch (error) {
        console.error("Error creating contribution:", error);
        return c.json({ error: "Internal server error" }, 500);
      }
    }
  )
  .get("/goal/:goalId", async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const goalId = c.req.param("goalId");

    try {
      // Verificar que la meta pertenezca al usuario
      const [goal] = await db
        .select()
        .from(savingsGoals)
        .where(and(eq(savingsGoals.id, goalId), eq(savingsGoals.userId, auth.userId)));

      if (!goal) {
        return c.json({ error: "Goal not found" }, 404);
      }

      // Obtener contribuciones
      const contributions = await db
        .select()
        .from(savingsContributions)
        .where(eq(savingsContributions.goalId, goalId))
        .orderBy(desc(savingsContributions.createdAt));

      return c.json({ data: contributions });
    } catch (error) {
      console.error("Error fetching contributions:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .delete("/:id", async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");

    try {
      // Obtener la contribución y verificar permisos
      const [contribution] = await db
        .select({
          contribution: savingsContributions,
          goal: savingsGoals,
        })
        .from(savingsContributions)
        .innerJoin(savingsGoals, eq(savingsContributions.goalId, savingsGoals.id))
        .where(and(
          eq(savingsContributions.id, id),
          eq(savingsGoals.userId, auth.userId)
        ));

      if (!contribution) {
        return c.json({ error: "Contribution not found" }, 404);
      }

      // Eliminar contribución
      await db
        .delete(savingsContributions)
        .where(eq(savingsContributions.id, id));

      // Actualizar el monto actual de la meta
      const newCurrentAmount = contribution.goal.currentAmount - contribution.contribution.amount;

      await db
        .update(savingsGoals)
        .set({
          currentAmount: Math.max(0, newCurrentAmount),
          updatedAt: new Date(),
          status: newCurrentAmount < contribution.goal.targetAmount ? "active" : contribution.goal.status,
        })
        .where(eq(savingsGoals.id, contribution.goal.id));

      return c.json({ message: "Contribution deleted successfully" });
    } catch (error) {
      console.error("Error deleting contribution:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  });

export default app;

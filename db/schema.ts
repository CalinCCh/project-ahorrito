import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm"
import { integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { z } from "zod";

export const accounts = pgTable("accounts", {
    id: text("id").primaryKey(),
    plaidId: text("plaid_id").unique(),
    name: text("name").notNull(),
    userId: text("user_id").notNull(),
});

export const accountsRelations = relations(accounts, ({ many, one }) => ({
    transactions: many(transactions),
    balances: many(accountBalances),
    latestBalance: one(accountBalances, {
        fields: [accounts.id],
        references: [accountBalances.accountId],
        relationName: "current_balance"
    })
}));

export const insertAccountSchema = z.object({
    name: z.string(),
});

export const accountBalances = pgTable("account_balances", {
    id: text("id").primaryKey(),
    accountId: text("account_id").references(() => accounts.id, {
        onDelete: "cascade",
    }).notNull(),
    current: integer("current").notNull(),
    available: integer("available"),
    currency: text("currency").notNull().default("EUR"),
    timestamp: timestamp("timestamp", { mode: "date" }).defaultNow().notNull(),
});

export const accountBalancesRelations = relations(accountBalances, ({ one }) => ({
    account: one(accounts, {
        fields: [accountBalances.accountId],
        references: [accounts.id],
    }),
}));

export const insertBalanceSchema = createInsertSchema(accountBalances, {
    timestamp: z.coerce.date(),
});

export const categories = pgTable("categories", {
    id: text("id").primaryKey(),
    plaidId: text("plaid_id"),
    name: text("name").notNull(),
    userId: text("user_id").notNull(),
})

export const categoriesRelations = relations(categories, ({ many }) => ({
    transactions: many(transactions),
}))

export const insertCategorySchema = z.object({
    name: z.string(),
});

export const predefinedCategories = pgTable("predefined_categories", {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    emoji: text("emoji"),
    icon: text("icon"),
    color: text("color").default("default"), // default, success, danger, warning
});

export const predefinedCategoriesRelations = relations(
    predefinedCategories,
    ({ many }) => ({
        transactions: many(transactions),
    }),
);

export const insertPredefinedCategorySchema = createInsertSchema(predefinedCategories);

export const transactions = pgTable("transactions", {
    id: text("id").primaryKey(),
    amount: integer("amount").notNull(),
    payee: text("payee").notNull(),
    notes: text("notes"),
    date: timestamp("date", { mode: "date" }).notNull(),
    accountId: text("account_id").references(() => accounts.id, {
        onDelete: "cascade",
    }).notNull(),
    userCategoryId: text("user_category_id").references(() => categories.id, {
        onDelete: "set null",
    }),
    predefinedCategoryId: text("predefined_category_id").references(() => predefinedCategories.id, {
        onDelete: "set null",
    }),
    externalId: text("external_id"),
}, (table) => {
    return {
        transactionUniqueIdx: uniqueIndex("transaction_unique_idx").on(table.accountId, table.amount, table.payee, table.date),
        externalIdIdx: uniqueIndex("external_id_idx").on(table.externalId)
    }
})

export const trasactionsRelations = relations(transactions, ({ one }) => ({
    account: one(accounts, {
        fields: [transactions.accountId],
        references: [accounts.id],
    }),
    userCategory: one(categories, {
        fields: [transactions.userCategoryId],
        references: [categories.id],
        relationName: "userCategory",
    }),
    predefinedCategory: one(predefinedCategories, {
        fields: [transactions.predefinedCategoryId],
        references: [predefinedCategories.id],
        relationName: "predefinedCategory",
    }),
}))

export const insertTransactionSchema = createInsertSchema(transactions, {
    date: z.coerce.date(),
})

export const bankConnections = pgTable("bank_connections", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    provider: text("provider").notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at", { mode: "date" }),
    institutionId: text("institution_id"),
    institutionName: text("institution_name"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
    lastSyncedAt: timestamp("last_synced_at", { mode: "date" }),
});

// Metas de ahorro
export const savingsGoals = pgTable("savings_goals", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    targetAmount: integer("target_amount").notNull(), // en centavos
    currentAmount: integer("current_amount").notNull().default(0), // en centavos
    currency: text("currency").notNull().default("MXN"),
    category: text("category").notNull(), // vacaciones, emergencia, educacion, casa, auto, etc.
    emoji: text("emoji").default("🎯"),
    color: text("color").default("blue"), // blue, green, purple, orange, red, yellow
    priority: text("priority").notNull().default("medium"), // high, medium, low
    targetDate: timestamp("target_date", { mode: "date" }),
    monthlyContribution: integer("monthly_contribution").default(0), // contribución sugerida mensual
    autoSave: text("auto_save").default("manual"), // manual, daily, weekly, monthly
    status: text("status").notNull().default("active"), // active, completed, paused, cancelled
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
    completedAt: timestamp("completed_at", { mode: "date" }),
});

export const savingsGoalsRelations = relations(savingsGoals, ({ many }) => ({
    contributions: many(savingsContributions),
    milestones: many(savingsMilestones),
}));

export const insertSavingsGoalSchema = createInsertSchema(savingsGoals, {
    targetDate: z.coerce.date().optional(),
    completedAt: z.coerce.date().optional(),
    targetAmount: z.number().min(1),
    monthlyContribution: z.number().min(0).optional(),
});

// Contribuciones a metas de ahorro
export const savingsContributions = pgTable("savings_contributions", {
    id: text("id").primaryKey(),
    goalId: text("goal_id").references(() => savingsGoals.id, {
        onDelete: "cascade",
    }).notNull(),
    amount: integer("amount").notNull(), // en centavos
    currency: text("currency").notNull().default("MXN"),
    type: text("type").notNull().default("manual"), // manual, auto, transfer
    source: text("source"), // descripción de la fuente del dinero
    notes: text("notes"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    transactionId: text("transaction_id").references(() => transactions.id, {
        onDelete: "set null",
    }), // vincular con transacción si aplica
});

export const savingsContributionsRelations = relations(savingsContributions, ({ one }) => ({
    goal: one(savingsGoals, {
        fields: [savingsContributions.goalId],
        references: [savingsGoals.id],
    }),
    transaction: one(transactions, {
        fields: [savingsContributions.transactionId],
        references: [transactions.id],
    }),
}));

export const insertSavingsContributionSchema = createInsertSchema(savingsContributions, {
    amount: z.number().min(1),
});

// Hitos y recompensas
export const savingsMilestones = pgTable("savings_milestones", {
    id: text("id").primaryKey(),
    goalId: text("goal_id").references(() => savingsGoals.id, {
        onDelete: "cascade",
    }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    percentage: integer("percentage").notNull(), // 25, 50, 75, 100
    targetAmount: integer("target_amount").notNull(), // cantidad específica para este hito
    isCompleted: text("is_completed").notNull().default("false"), // true, false
    completedAt: timestamp("completed_at", { mode: "date" }),
    rewardMessage: text("reward_message"), // mensaje de felicitación
    emoji: text("emoji").default("🏆"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const savingsMilestonesRelations = relations(savingsMilestones, ({ one }) => ({
    goal: one(savingsGoals, {
        fields: [savingsMilestones.goalId],
        references: [savingsGoals.id],
    }),
}));

export const insertSavingsMilestoneSchema = createInsertSchema(savingsMilestones, {
    percentage: z.number().min(1).max(100),
    targetAmount: z.number().min(1),
    completedAt: z.coerce.date().optional(),
});

// Achievement system tables
export const achievementDefinitions = pgTable("achievement_definitions", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    xpReward: integer("xp_reward").notNull().default(0),
    badgeIcon: text("badge_icon").notNull(),
    badgeColor: text("badge_color").notNull().default("blue"),
    requirements: text("requirements").notNull(), // JSON string
    isSecret: text("is_secret").notNull().default("false"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    achievementId: text("achievement_id").references(() => achievementDefinitions.id, {
        onDelete: "cascade",
    }).notNull(),
    progress: integer("progress").default(0),
    targetValue: integer("target_value").notNull(),
    currentValue: integer("current_value").default(0),
    completedAt: timestamp("completed_at", { mode: "date" }),
    unlockedAt: timestamp("unlocked_at", { mode: "date" }).defaultNow(),
}, (table) => ({
    userAchievementUnique: uniqueIndex("user_achievement_unique").on(table.userId, table.achievementId),
}));

export const userLevels = pgTable("user_levels", {
    id: text("id").primaryKey(),
    userId: text("user_id").unique().notNull(),
    currentLevel: integer("current_level").default(1),
    totalXp: integer("total_xp").default(0),
    levelProgress: integer("level_progress").default(0),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// Relations for achievements
export const achievementDefinitionsRelations = relations(achievementDefinitions, ({ many }) => ({
    userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
    achievement: one(achievementDefinitions, {
        fields: [userAchievements.achievementId],
        references: [achievementDefinitions.id],
    }),
}));
// Insert schemas for achievements
export const insertAchievementDefinitionSchema = createInsertSchema(achievementDefinitions);
export const insertUserAchievementSchema = createInsertSchema(userAchievements);
export const insertUserLevelSchema = createInsertSchema(userLevels);

// Subscription system tables
export const userSubscriptions = pgTable("user_subscriptions", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    stripePriceId: text("stripe_price_id"),
    plan: text("plan").notNull(), // weekly, monthly, annual
    status: text("status").notNull().default("inactive"), // active, inactive, canceled, past_due
    currentPeriodStart: timestamp("current_period_start", { mode: "date" }),
    currentPeriodEnd: timestamp("current_period_end", { mode: "date" }),
    cancelAtPeriodEnd: text("cancel_at_period_end").notNull().default("false"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions, {
    currentPeriodStart: z.coerce.date().optional(),
    currentPeriodEnd: z.coerce.date().optional(),
});


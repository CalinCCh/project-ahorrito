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




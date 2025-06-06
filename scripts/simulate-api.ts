import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from "@/db/drizzle";
import { accounts, accountBalances, transactions } from "@/db/schema";
import { eq, desc, sql, sum, gte, lte, and } from "drizzle-orm";
import { subDays } from "date-fns";

async function simulateSummaryAPI() {
    try {
        console.log("🔍 Simulating Summary API Logic...");

        const userId = "user_2vcrxCLLvMn62bE6NLtB2cC02AF";
        const endDate = new Date();
        const startDate = subDays(endDate, 30);

        console.log(`📅 Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

        // 1. Get current account balances (what should show as "Remaining")
        console.log("\n💰 Account Balances:");
        const balances = await db
            .select({
                accountId: accountBalances.accountId,
                accountName: accounts.name,
                balance: accountBalances.current,
                currency: accountBalances.currency,
                timestamp: accountBalances.timestamp
            })
            .from(accountBalances)
            .innerJoin(accounts, eq(accountBalances.accountId, accounts.id))
            .where(eq(accounts.userId, userId))
            .orderBy(desc(accountBalances.timestamp));

        // Get the latest balance for each account
        const latestBalances = new Map();
        for (const balance of balances) {
            if (!latestBalances.has(balance.accountId)) {
                latestBalances.set(balance.accountId, balance);
                console.log(`  ${balance.accountName}: ${balance.balance / 1000} ${balance.currency} (${balance.timestamp})`);
            }
        }

        const totalCurrentBalance = Array.from(latestBalances.values()).reduce((sum, balance) => sum + balance.balance, 0);
        console.log(`  📊 Total Current Balance: ${totalCurrentBalance / 1000} EUR`);

        // 2. Get transactions for income/expenses calculation
        console.log("\n📈 Transactions in Period:");
        const [financialData] = await db
            .select({
                income: sql`SUM(CASE WHEN ${transactions.amount} >=0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number),
                expenses: sql`SUM(CASE WHEN ${transactions.amount} <0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number),
                remaining: sum(transactions.amount).mapWith(Number),
            })
            .from(transactions)
            .innerJoin(accounts, eq(transactions.accountId, accounts.id))
            .where(and(
                eq(accounts.userId, userId),
                gte(transactions.date, startDate),
                lte(transactions.date, endDate),
            ));

        console.log(`  💚 Income: ${(financialData.income || 0) / 1000} EUR`);
        console.log(`  🔴 Expenses: ${(financialData.expenses || 0) / 1000} EUR`);
        console.log(`  🧮 Transaction Sum: ${(financialData.remaining || 0) / 1000} EUR`);

        // 3. Expected API Response
        console.log("\n🎯 Expected API Response:");
        console.log(`  remainingAmount: ${totalCurrentBalance} (${totalCurrentBalance / 1000} EUR)`);
        console.log(`  incomeAmount: ${financialData.income || 0} (${(financialData.income || 0) / 1000} EUR)`);
        console.log(`  expensesAmount: ${financialData.expenses || 0} (${(financialData.expenses || 0) / 1000} EUR)`);
        console.log(`  currency: EUR`);

        console.log("\n✅ Simulation complete!");

    } catch (err) {
        console.error("❌ Error simulating API:", err);
    }

    process.exit(0);
}

simulateSummaryAPI();

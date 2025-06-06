import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { z } from 'zod';
import { and, desc, eq, gte, lte, sum } from 'drizzle-orm';
import { subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

import { db } from "@/db/drizzle";
import { accounts, transactions, categories, predefinedCategories, accountBalances } from "@/db/schema";
import {
    generateIntelligentResponse,
    quickAnalysis,
    type UserFinancialContext,
    type AIQuery
} from "@/lib/ai-assistant";
import { convertAmountFromMiliunits } from "@/lib/utils";

const app = new Hono();

app.post('/chat',
    clerkMiddleware(),
    zValidator("json", z.object({
        question: z.string().min(1, "La pregunta no puede estar vacía"),
        includeContext: z.boolean().default(true),
        intent: z.enum(['overview', 'transactions', 'budget', 'analysis', 'advice', 'prediction', 'alerts', 'general']).optional(),
        enhancedAnalysis: z.boolean().default(true)
    })),
    async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const { question, includeContext, intent, enhancedAnalysis } = c.req.valid("json");

        try {
            let context: UserFinancialContext | null = null;

            if (includeContext) {
                context = await buildUserFinancialContext(auth.userId);
            }

            const aiQuery: AIQuery = {
                question,
                context: context || getEmptyContext(auth.userId),
                intent
            };

            const response = await generateIntelligentResponse(aiQuery);

            // Agregar análisis adicional si se solicita
            let additionalAnalysis = null;
            if (enhancedAnalysis && context) {
                additionalAnalysis = {
                    healthScore: quickAnalysis.getFinancialHealthScore(context),
                    predictions: quickAnalysis.getPredictiveInsights(context),
                    recommendations: quickAnalysis.getSmartRecommendations(context),
                    patterns: quickAnalysis.getSpendingPatterns(context)
                };
            }

            return c.json({
                success: true,
                response,
                additionalAnalysis,
                contextIncluded: includeContext,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in AI assistant:', error);

            // Respuesta de fallback con información básica si hay contexto
            let fallbackResponse = null;
            try {
                if (includeContext) {
                    const basicContext = await buildUserFinancialContext(auth.userId);
                    fallbackResponse = {
                        text: `No pude procesar tu consulta completamente, pero aquí tienes información básica: 
                   Tienes ${basicContext.accounts.length} cuenta(s) conectada(s) y tu balance total es de ${quickAnalysis.getTotalBalance(basicContext).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}.`,
                        suggestions: generatePersonalizedSuggestions(basicContext).slice(0, 3),
                        data: { fallback: true, basicStats: generateQuickInsights(basicContext) }
                    };
                }
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }

            return c.json({
                error: "Error procesando tu consulta",
                details: error instanceof Error ? error.message : 'Unknown error',
                fallbackResponse
            }, 500);
        }
    }
);

/**
 * Endpoint para obtener sugerencias inteligentes personalizadas
 * GET /api/ai-assistant/suggestions
 */
app.get('/suggestions',
    clerkMiddleware(),
    async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        try {
            const context = await buildUserFinancialContext(auth.userId);
            const suggestions = generatePersonalizedSuggestions(context);
            const smartRecommendations = quickAnalysis.getSmartRecommendations(context);

            return c.json({
                success: true,
                suggestions,
                smartRecommendations,
                contextual: {
                    hasLowSavings: context.yearlyStats.savingsRate < 15,
                    hasNegativeBalance: context.monthlyStats.balance < 0,
                    hasHighExpenses: context.monthlyStats.topCategories[0]?.percentage > 40,
                    needsEmergencyFund: quickAnalysis.getTotalBalance(context) < context.yearlyStats.averageMonthlySpending
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error getting suggestions:', error);
            return c.json({ error: "Error obteniendo sugerencias" }, 500);
        }
    }
);

/**
 * Endpoint para análisis rápido y insights avanzados
 * GET /api/ai-assistant/quick-insights
 */
app.get('/quick-insights',
    clerkMiddleware(),
    async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        try {
            const context = await buildUserFinancialContext(auth.userId);
            const insights = generateQuickInsights(context);
            const healthScore = quickAnalysis.getFinancialHealthScore(context);
            const predictions = quickAnalysis.getPredictiveInsights(context);
            const patterns = quickAnalysis.getSpendingPatterns(context);

            return c.json({
                success: true,
                insights,
                healthScore: {
                    score: healthScore.score,
                    level: healthScore.level,
                    topFactors: healthScore.factors.slice(0, 3)
                },
                predictions: {
                    monthlyProjection: predictions.monthlyProjection,
                    savingsProjection: predictions.savingsProjection,
                    alerts: predictions.budgetAlerts,
                    opportunities: predictions.opportunities.slice(0, 3)
                },
                patterns: {
                    unusualTransactions: patterns.unusualTransactions.length,
                    topRecommendations: patterns.recommendations.slice(0, 2),
                    categoryTrends: patterns.categoryTrends.slice(0, 5)
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error getting quick insights:', error);
            return c.json({ error: "Error obteniendo insights" }, 500);
        }
    }
);

/**
 * Endpoint para análisis de salud financiera completo
 * GET /api/ai-assistant/health-analysis
 */
app.get('/health-analysis',
    clerkMiddleware(),
    async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        try {
            const context = await buildUserFinancialContext(auth.userId);
            const healthScore = quickAnalysis.getFinancialHealthScore(context);
            const recommendations = quickAnalysis.getSmartRecommendations(context);
            const predictions = quickAnalysis.getPredictiveInsights(context);

            return c.json({
                success: true,
                analysis: {
                    healthScore,
                    recommendations,
                    predictions,
                    riskFactors: identifyRiskFactors(context),
                    opportunities: identifyOpportunities(context),
                    actionPlan: generateActionPlan(healthScore, recommendations)
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error getting health analysis:', error);
            return c.json({ error: "Error obteniendo análisis de salud" }, 500);
        }
    }
);

/**
 * Endpoint para predicciones financieras
 * POST /api/ai-assistant/predictions
 */
app.post('/predictions',
    clerkMiddleware(),
    zValidator("json", z.object({
        timeframe: z.enum(['month', 'quarter', 'year']).default('month'),
        scenario: z.enum(['conservative', 'optimistic', 'current']).default('current')
    })),
    async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const { timeframe, scenario } = c.req.valid("json");

        try {
            const context = await buildUserFinancialContext(auth.userId);
            const predictions = generateAdvancedPredictions(context, timeframe, scenario);

            return c.json({
                success: true,
                predictions,
                timeframe,
                scenario,
                confidence: calculatePredictionConfidence(context),
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error generating predictions:', error);
            return c.json({ error: "Error generando predicciones" }, 500);
        }
    }
);

/**
 * Construye el contexto financiero completo del usuario
 */
async function buildUserFinancialContext(userId: string): Promise<UserFinancialContext> {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);

    // Obtener cuentas del usuario con balances reales desde accountBalances
    const userAccounts = await db
        .select({
            id: accounts.id,
            name: accounts.name
        })
        .from(accounts)
        .where(eq(accounts.userId, userId));

    const accountsWithBalance = await Promise.all(
        userAccounts.map(async (account) => {
            // Obtener el balance más reciente desde accountBalances (igual que en dashboard)
            const [latestBalance] = await db
                .select({
                    balance: accountBalances.current
                })
                .from(accountBalances)
                .innerJoin(accounts, eq(accountBalances.accountId, accounts.id))
                .where(and(
                    eq(accountBalances.accountId, account.id),
                    eq(accounts.userId, userId)
                ))
                .orderBy(desc(accountBalances.timestamp))
                .limit(1);

            return {
                ...account,
                balance: latestBalance ? convertAmountFromMiliunits(latestBalance.balance) : 0
            };
        })
    );

    // Obtener transacciones recientes (últimos 30 días)
    const recentTransactions = await db
        .select({
            id: transactions.id,
            payee: transactions.payee,
            amount: transactions.amount,
            date: transactions.date,
            notes: transactions.notes,
            accountId: transactions.accountId,
            userCategoryId: transactions.userCategoryId,
            predefinedCategoryId: transactions.predefinedCategoryId
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
            and(
                eq(accounts.userId, userId),
                gte(transactions.date, subDays(now, 30))
            )
        )
        .orderBy(desc(transactions.date))
        .limit(50);

    // Enriquecer transacciones con nombres de cuenta y categoría
    const enrichedTransactions = await Promise.all(
        recentTransactions.map(async (tx) => {
            const account = accountsWithBalance.find(acc => acc.id === tx.accountId);
            let categoryName = 'Sin categoría';

            if (tx.userCategoryId) {
                const [userCategory] = await db
                    .select({ name: categories.name })
                    .from(categories)
                    .where(eq(categories.id, tx.userCategoryId));
                categoryName = userCategory?.name || 'Sin categoría';
            } else if (tx.predefinedCategoryId) {
                const [predefinedCategory] = await db
                    .select({ name: predefinedCategories.name })
                    .from(predefinedCategories)
                    .where(eq(predefinedCategories.id, tx.predefinedCategoryId));
                categoryName = predefinedCategory?.name || 'Sin categoría';
            } return {
                id: tx.id,
                payee: tx.payee,
                amount: convertAmountFromMiliunits(tx.amount),
                date: tx.date.toISOString(),
                category: categoryName,
                accountName: account?.name || 'Cuenta desconocida'
            };
        })
    );

    // Obtener categorías del usuario
    const userCategories = await db
        .select({
            id: categories.id,
            name: categories.name
        })
        .from(categories)
        .where(eq(categories.userId, userId));

    // Calcular estadísticas mensuales
    const monthlyTransactions = await db
        .select({
            amount: transactions.amount,
            userCategoryId: transactions.userCategoryId,
            predefinedCategoryId: transactions.predefinedCategoryId
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
            and(
                eq(accounts.userId, userId),
                gte(transactions.date, monthStart),
                lte(transactions.date, monthEnd)
            )
        ); const monthlyIncome = convertAmountFromMiliunits(monthlyTransactions
            .filter(tx => tx.amount > 0)
            .reduce((sum, tx) => sum + tx.amount, 0));

    const monthlyExpenses = convertAmountFromMiliunits(Math.abs(monthlyTransactions
        .filter(tx => tx.amount < 0)
        .reduce((sum, tx) => sum + tx.amount, 0)));

    // Calcular gastos por categoría
    const categorySpending = new Map<string, { amount: number; count: number }>();

    for (const tx of monthlyTransactions.filter(tx => tx.amount < 0)) {
        let categoryName = 'Sin categoría';

        if (tx.userCategoryId) {
            const category = userCategories.find(cat => cat.id === tx.userCategoryId);
            categoryName = category?.name || 'Sin categoría';
        } else if (tx.predefinedCategoryId) {
            const [predefinedCategory] = await db
                .select({ name: predefinedCategories.name })
                .from(predefinedCategories)
                .where(eq(predefinedCategories.id, tx.predefinedCategoryId));
            categoryName = predefinedCategory?.name || 'Sin categoría';
        } const current = categorySpending.get(categoryName) || { amount: 0, count: 0 };
        categorySpending.set(categoryName, {
            amount: current.amount + convertAmountFromMiliunits(Math.abs(tx.amount)),
            count: current.count + 1
        });
    }

    const topCategories = Array.from(categorySpending.entries())
        .map(([name, data]) => ({
            name,
            amount: data.amount,
            percentage: monthlyExpenses > 0 ? (data.amount / monthlyExpenses) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    // Calcular estadísticas anuales
    const yearlyTransactions = await db
        .select({
            amount: transactions.amount
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
            and(
                eq(accounts.userId, userId),
                gte(transactions.date, yearStart),
                lte(transactions.date, yearEnd)
            )
        ); const yearlyIncome = convertAmountFromMiliunits(yearlyTransactions
            .filter(tx => tx.amount > 0)
            .reduce((sum, tx) => sum + tx.amount, 0));

    const yearlyExpenses = convertAmountFromMiliunits(Math.abs(yearlyTransactions
        .filter(tx => tx.amount < 0)
        .reduce((sum, tx) => sum + tx.amount, 0)));

    const savingsRate = yearlyIncome > 0 ? ((yearlyIncome - yearlyExpenses) / yearlyIncome) * 100 : 0;

    return {
        userId,
        accounts: accountsWithBalance,
        recentTransactions: enrichedTransactions, categories: userCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            totalSpent: categorySpending.get(cat.name)?.amount || 0,
            transactionCount: categorySpending.get(cat.name)?.count || 0
        })),
        monthlyStats: {
            income: monthlyIncome,
            expenses: monthlyExpenses,
            balance: monthlyIncome - monthlyExpenses,
            topCategories
        },
        yearlyStats: {
            totalIncome: yearlyIncome,
            totalExpenses: yearlyExpenses,
            averageMonthlySpending: yearlyExpenses / 12,
            savingsRate
        }
    };
}

/**
 * Genera contexto vacío para casos de error
 */
function getEmptyContext(userId: string): UserFinancialContext {
    return {
        userId,
        accounts: [],
        recentTransactions: [],
        categories: [],
        monthlyStats: {
            income: 0,
            expenses: 0,
            balance: 0,
            topCategories: []
        },
        yearlyStats: {
            totalIncome: 0,
            totalExpenses: 0,
            averageMonthlySpending: 0,
            savingsRate: 0
        }
    };
}

/**
 * Genera sugerencias personalizadas basadas en el contexto del usuario
 */
function generatePersonalizedSuggestions(context: UserFinancialContext): string[] {
    const suggestions = [];

    // Sugerencias basadas en datos reales
    if (context.accounts.length > 0) {
        suggestions.push("¿Cuál es mi balance total actual?");
    }

    if (context.recentTransactions.length > 0) {
        suggestions.push("Muéstrame mis últimas compras");
    }

    if (context.monthlyStats.topCategories.length > 0) {
        const topCategory = context.monthlyStats.topCategories[0];
        suggestions.push(`¿Por qué gasto tanto en ${topCategory.name}?`);
    }

    if (context.monthlyStats.expenses > context.monthlyStats.income) {
        suggestions.push("¿Cómo puedo reducir mis gastos este mes?");
    }

    if (context.yearlyStats.savingsRate < 20) {
        suggestions.push("Dame consejos para ahorrar más dinero");
    }

    // Sugerencias generales siempre útiles
    suggestions.push(
        "Analiza mis patrones de gasto",
        "¿Qué metas financieras debería establecer?",
        "Compara mis gastos con el mes pasado"
    );

    return suggestions.slice(0, 6); // Máximo 6 sugerencias
}

/**
 * Genera insights rápidos sobre la situación financiera
 */
function generateQuickInsights(context: UserFinancialContext): Array<{
    title: string;
    value: string;
    trend?: 'up' | 'down' | 'stable';
    color?: 'green' | 'red' | 'blue' | 'yellow';
}> {
    const insights = [];

    const totalBalance = context.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0); insights.push({
        title: "Balance Total",
        value: `${totalBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`,
        color: (totalBalance >= 0 ? 'green' : 'red') as 'green' | 'red'
    });

    if (context.monthlyStats.expenses > 0) {
        insights.push({
            title: "Gastos del Mes",
            value: `${context.monthlyStats.expenses.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`,
            color: 'red' as const
        });
    }

    if (context.yearlyStats.savingsRate > 0) {
        insights.push({
            title: "Tasa de Ahorro",
            value: `${context.yearlyStats.savingsRate.toFixed(1)}%`,
            color: (context.yearlyStats.savingsRate >= 20 ? 'green' : 'yellow') as 'green' | 'yellow'
        });
    }

    if (context.monthlyStats.topCategories.length > 0) {
        const topCategory = context.monthlyStats.topCategories[0];
        insights.push({
            title: "Mayor Gasto",
            value: `${topCategory.name} (${topCategory.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })})`,
            color: 'blue' as const
        });
    }

    return insights;
}

/**
 * Identifica factores de riesgo en las finanzas del usuario
 */
function identifyRiskFactors(context: UserFinancialContext): Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
}> {
    const riskFactors = [];
    const totalBalance = context.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    // Balance negativo - Riesgo alto
    if (totalBalance < 0) {
        riskFactors.push({
            type: 'negative_balance',
            severity: 'high' as const,
            description: `Tu balance total es negativo (${totalBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })})`,
            recommendation: 'Considera reducir gastos inmediatamente y buscar ingresos adicionales'
        });
    }

    // Gastos superan ingresos - Riesgo alto
    if (context.monthlyStats.expenses > context.monthlyStats.income && context.monthlyStats.income > 0) {
        const deficit = context.monthlyStats.expenses - context.monthlyStats.income;
        riskFactors.push({
            type: 'spending_exceeds_income',
            severity: 'high' as const,
            description: `Tus gastos superan tus ingresos por ${deficit.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`,
            recommendation: 'Revisa y recorta gastos no esenciales inmediatamente'
        });
    }

    // Baja tasa de ahorro - Riesgo medio
    if (context.yearlyStats.savingsRate < 10 && context.yearlyStats.savingsRate >= 0) {
        riskFactors.push({
            type: 'low_savings_rate',
            severity: 'medium' as const,
            description: `Tu tasa de ahorro es muy baja (${context.yearlyStats.savingsRate.toFixed(1)}%)`,
            recommendation: 'Intenta ahorrar al menos el 20% de tus ingresos'
        });
    }

    // Alta concentración de gastos en una categoría - Riesgo medio
    if (context.monthlyStats.topCategories.length > 0) {
        const topCategory = context.monthlyStats.topCategories[0];
        if (topCategory.percentage > 50) {
            riskFactors.push({
                type: 'concentrated_spending',
                severity: 'medium' as const,
                description: `El ${topCategory.percentage.toFixed(1)}% de tus gastos se concentra en ${topCategory.name}`,
                recommendation: 'Diversifica tus gastos para tener mejor control financiero'
            });
        }
    }

    // Sin fondo de emergencia - Riesgo medio
    if (totalBalance < context.yearlyStats.averageMonthlySpending * 3) {
        riskFactors.push({
            type: 'no_emergency_fund',
            severity: 'medium' as const,
            description: 'No tienes suficiente fondo de emergencia',
            recommendation: 'Construye un fondo de emergencia de 3-6 meses de gastos'
        });
    }

    // Pocos ingresos - Riesgo bajo a medio
    if (context.monthlyStats.income < context.yearlyStats.averageMonthlySpending * 1.5) {
        riskFactors.push({
            type: 'low_income_margin',
            severity: context.monthlyStats.income < context.yearlyStats.averageMonthlySpending ? 'high' as const : 'medium' as const,
            description: 'Tu margen entre ingresos y gastos es muy estrecho',
            recommendation: 'Busca oportunidades para aumentar tus ingresos'
        });
    }

    return riskFactors;
}

/**
 * Identifica oportunidades de mejora financiera
 */
function identifyOpportunities(context: UserFinancialContext): Array<{
    type: string;
    impact: 'low' | 'medium' | 'high';
    description: string;
    potentialSaving: number;
    action: string;
}> {
    const opportunities = [];
    const totalBalance = context.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    // Oportunidad de ahorro en categorías altas
    if (context.monthlyStats.topCategories.length > 0) {
        const topCategory = context.monthlyStats.topCategories[0];
        if (topCategory.amount > context.monthlyStats.income * 0.3) {
            const potentialSaving = topCategory.amount * 0.2; // 20% de reducción
            opportunities.push({
                type: 'reduce_top_spending',
                impact: 'high' as const,
                description: `Reducir gastos en ${topCategory.name}`,
                potentialSaving,
                action: `Podrías ahorrar ${potentialSaving.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} reduciendo un 20% tus gastos en ${topCategory.name}`
            });
        }
    }

    // Oportunidad de optimizar múltiples cuentas
    if (context.accounts.length > 3) {
        opportunities.push({
            type: 'consolidate_accounts',
            impact: 'medium' as const,
            description: 'Consolidar cuentas para mejor control',
            potentialSaving: 0,
            action: 'Considera consolidar algunas cuentas para simplificar tu gestión financiera'
        });
    }

    // Oportunidad de incrementar ahorros
    if (context.yearlyStats.savingsRate > 0 && context.yearlyStats.savingsRate < 30) {
        const currentSavings = (context.monthlyStats.income - context.monthlyStats.expenses);
        const targetSavings = context.monthlyStats.income * 0.2; // 20% objetivo
        const additionalSaving = Math.max(0, targetSavings - currentSavings);

        if (additionalSaving > 0) {
            opportunities.push({
                type: 'increase_savings',
                impact: 'high' as const,
                description: 'Incrementar tasa de ahorro',
                potentialSaving: additionalSaving * 12, // Anual
                action: `Podrías ahorrar ${(additionalSaving * 12).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} adicionales al año aumentando tu ahorro mensual en ${additionalSaving.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`
            });
        }
    }

    // Oportunidad de categorización
    const uncategorizedTransactions = context.recentTransactions.filter(tx => tx.category === 'Sin categoría');
    if (uncategorizedTransactions.length > context.recentTransactions.length * 0.3) {
        opportunities.push({
            type: 'improve_categorization',
            impact: 'medium' as const,
            description: 'Mejorar categorización de transacciones',
            potentialSaving: 0,
            action: `${uncategorizedTransactions.length} transacciones sin categorizar. Categorizarlas te ayudará a tener mejor control de gastos`
        });
    }

    // Oportunidad de inversión (si hay exceso de liquidez)
    if (totalBalance > context.yearlyStats.averageMonthlySpending * 6) {
        const excessCash = totalBalance - (context.yearlyStats.averageMonthlySpending * 6);
        opportunities.push({
            type: 'investment_opportunity',
            impact: 'high' as const,
            description: 'Considerar inversiones',
            potentialSaving: excessCash * 0.08, // 8% anual estimado
            action: `Tienes ${excessCash.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} en exceso que podrías invertir para generar rendimientos adicionales`
        });
    }

    return opportunities.sort((a, b) => {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
    });
}

/**
 * Genera un plan de acción basado en el health score y recomendaciones
 */
function generateActionPlan(
    healthScore: ReturnType<typeof quickAnalysis.getFinancialHealthScore>,
    recommendations: ReturnType<typeof quickAnalysis.getSmartRecommendations>
): {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    priority: 'low' | 'medium' | 'high';
} {
    const immediate = [];
    const shortTerm = [];
    const longTerm = [];

    // Determinar prioridad basada en health score
    let priority: 'low' | 'medium' | 'high' = 'low';
    if (healthScore.score < 40) {
        priority = 'high';
    } else if (healthScore.score < 70) {
        priority = 'medium';
    }

    // Acciones inmediatas (crisis financiera)
    if (healthScore.score < 30) {
        immediate.push(
            'Revisar y recortar todos los gastos no esenciales',
            'Buscar fuentes adicionales de ingresos inmediatamente',
            'Considerar asesoría financiera profesional'
        );
    } else if (healthScore.score < 50) {
        immediate.push(
            'Crear un presupuesto detallado',
            'Identificar gastos que se pueden reducir',
            'Establecer límites de gasto por categoría'
        );
    }

    // Acciones a corto plazo (1-3 meses)
    if (recommendations.immediate.length > 0) {
        shortTerm.push(...recommendations.immediate.slice(0, 3));
    }

    shortTerm.push(
        'Construir un fondo de emergencia básico (1 mes de gastos)',
        'Automatizar ahorros con transferencias programadas',
        'Revisar y optimizar suscripciones y servicios recurrentes'
    );

    // Acciones a largo plazo (3+ meses)
    if (recommendations.longTerm.length > 0) {
        longTerm.push(...recommendations.longTerm.slice(0, 3));
    }

    longTerm.push(
        'Expandir fondo de emergencia a 6 meses de gastos',
        'Explorar opciones de inversión para hacer crecer el dinero',
        'Establecer metas financieras específicas y medibles',
        'Considerar diversificar fuentes de ingresos'
    );

    return {
        immediate: immediate.slice(0, 4),
        shortTerm: shortTerm.slice(0, 4),
        longTerm: longTerm.slice(0, 4),
        priority
    };
}

/**
 * Genera predicciones financieras avanzadas
 */
function generateAdvancedPredictions(
    context: UserFinancialContext,
    timeframe: 'month' | 'quarter' | 'year',
    scenario: 'conservative' | 'optimistic' | 'current'
): {
    balanceProjection: number;
    incomeProjection: number;
    expenseProjection: number;
    savingsProjection: number;
    scenarios: {
        best: { balance: number; savings: number };
        worst: { balance: number; savings: number };
        likely: { balance: number; savings: number };
    };
    recommendations: string[];
} {
    const currentBalance = context.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const monthlyIncome = context.monthlyStats.income;
    const monthlyExpenses = context.monthlyStats.expenses;
    const monthlySavings = monthlyIncome - monthlyExpenses;

    // Factores de multiplicación por timeframe
    const timeMultiplier = {
        month: 1,
        quarter: 3,
        year: 12
    }[timeframe];

    // Factores de ajuste por escenario
    const scenarioAdjustments = {
        conservative: {
            incomeGrowth: 0.95, // -5%
            expenseGrowth: 1.05, // +5%
            volatility: 0.1
        },
        current: {
            incomeGrowth: 1.0, // sin cambio
            expenseGrowth: 1.0, // sin cambio
            volatility: 0.05
        },
        optimistic: {
            incomeGrowth: 1.1, // +10%
            expenseGrowth: 0.95, // -5%
            volatility: 0.15
        }
    }[scenario];

    // Proyecciones base
    const projectedIncome = monthlyIncome * scenarioAdjustments.incomeGrowth * timeMultiplier;
    const projectedExpenses = monthlyExpenses * scenarioAdjustments.expenseGrowth * timeMultiplier;
    const projectedSavings = projectedIncome - projectedExpenses;
    const projectedBalance = currentBalance + projectedSavings;

    // Escenarios alternativos
    const bestCase = {
        balance: currentBalance + (monthlySavings * 1.3 * timeMultiplier),
        savings: monthlySavings * 1.3 * timeMultiplier
    };

    const worstCase = {
        balance: currentBalance + (monthlySavings * 0.7 * timeMultiplier),
        savings: monthlySavings * 0.7 * timeMultiplier
    };

    const likelyCase = {
        balance: projectedBalance,
        savings: projectedSavings
    };

    // Recomendaciones basadas en las predicciones
    const recommendations = [];

    if (projectedBalance < currentBalance) {
        recommendations.push(`Se proyecta una disminución en tu balance. Considera reducir gastos en ${context.monthlyStats.topCategories[0]?.name || 'categorías principales'}`);
    }

    if (projectedSavings < 0) {
        recommendations.push('Las proyecciones muestran gastos superiores a ingresos. Es crítico revisar tu presupuesto');
    } else if (projectedSavings < monthlyIncome * 0.1 * timeMultiplier) {
        recommendations.push('Tus ahorros proyectados son bajos. Intenta incrementar ingresos o reducir gastos');
    }

    if (scenario === 'conservative' && projectedBalance > currentBalance * 1.1) {
        recommendations.push('Incluso en el escenario conservador tus finanzas se ven positivas. Considera invertir el excedente');
    }

    return {
        balanceProjection: projectedBalance,
        incomeProjection: projectedIncome,
        expenseProjection: projectedExpenses,
        savingsProjection: projectedSavings,
        scenarios: {
            best: bestCase,
            worst: worstCase,
            likely: likelyCase
        },
        recommendations
    };
}

/**
 * Calcula la confianza de las predicciones
 */
function calculatePredictionConfidence(context: UserFinancialContext): {
    score: number;
    level: 'low' | 'medium' | 'high';
    factors: Array<{ factor: string; impact: number; description: string }>;
} {
    const factors = [];
    let confidenceScore = 50; // Base 50%

    // Factor: Cantidad de datos históricos
    const transactionCount = context.recentTransactions.length;
    if (transactionCount > 40) {
        confidenceScore += 20;
        factors.push({
            factor: 'data_volume',
            impact: 20,
            description: 'Suficientes datos históricos para análisis'
        });
    } else if (transactionCount > 20) {
        confidenceScore += 10;
        factors.push({
            factor: 'data_volume',
            impact: 10,
            description: 'Datos moderados para análisis'
        });
    } else {
        confidenceScore -= 10;
        factors.push({
            factor: 'data_volume',
            impact: -10,
            description: 'Pocos datos históricos limitan la precisión'
        });
    }

    // Factor: Estabilidad de ingresos
    if (context.monthlyStats.income > 0) {
        const incomeVariability = Math.abs(context.monthlyStats.income - context.yearlyStats.totalIncome / 12) / (context.yearlyStats.totalIncome / 12);
        if (incomeVariability < 0.1) {
            confidenceScore += 15;
            factors.push({
                factor: 'income_stability',
                impact: 15,
                description: 'Ingresos estables mejoran la precisión'
            });
        } else if (incomeVariability < 0.3) {
            confidenceScore += 5;
            factors.push({
                factor: 'income_stability',
                impact: 5,
                description: 'Ingresos moderadamente estables'
            });
        } else {
            confidenceScore -= 10;
            factors.push({
                factor: 'income_stability',
                impact: -10,
                description: 'Ingresos variables reducen la confianza'
            });
        }
    }

    // Factor: Patrones de gasto consistentes
    const categorizedTransactions = context.recentTransactions.filter(tx => tx.category !== 'Sin categoría');
    const categorizationRate = categorizedTransactions.length / context.recentTransactions.length;

    if (categorizationRate > 0.8) {
        confidenceScore += 10;
        factors.push({
            factor: 'categorization',
            impact: 10,
            description: 'Buena categorización permite mejor análisis'
        });
    } else if (categorizationRate < 0.5) {
        confidenceScore -= 5;
        factors.push({
            factor: 'categorization',
            impact: -5,
            description: 'Poca categorización limita el análisis'
        });
    }

    // Factor: Múltiples cuentas para mejor visibilidad
    if (context.accounts.length > 1) {
        confidenceScore += 5;
        factors.push({
            factor: 'account_coverage',
            impact: 5,
            description: 'Múltiples cuentas brindan mejor visibilidad'
        });
    }

    // Normalizar score
    confidenceScore = Math.max(0, Math.min(100, confidenceScore));

    let level: 'low' | 'medium' | 'high' = 'low';
    if (confidenceScore >= 75) {
        level = 'high';
    } else if (confidenceScore >= 50) {
        level = 'medium';
    }

    return {
        score: confidenceScore,
        level,
        factors
    };
}

export default app;

import { generateText } from '@/app/services/gemini/gemini-generate';

/**
 * Sistema inteligente de asistente IA con acceso a datos del usuario
 * Proporciona respuestas contextuales basadas en la información financiera real
 */

export interface UserFinancialContext {
    userId: string;
    accounts: Array<{
        id: string;
        name: string;
        balance?: number;
    }>;
    recentTransactions: Array<{
        id: string;
        payee: string;
        amount: number;
        date: string;
        category?: string;
        accountName: string;
    }>; categories: Array<{
        id: string;
        name: string;
        totalSpent?: number;
        transactionCount?: number;
    }>;
    monthlyStats: {
        income: number;
        expenses: number;
        balance: number;
        topCategories: Array<{
            name: string;
            amount: number;
            percentage: number;
            transactionCount?: number;
        }>;
    };
    yearlyStats: {
        totalIncome: number;
        totalExpenses: number;
        averageMonthlySpending: number;
        savingsRate: number;
    };
}

export interface AIQuery {
    question: string;
    context: UserFinancialContext;
    intent?: 'overview' | 'transactions' | 'budget' | 'analysis' | 'advice' | 'prediction' | 'alerts' | 'general';
}

export interface AIResponse {
    text: string;
    data?: any;
    suggestions?: string[];
    charts?: Array<{
        type: 'bar' | 'pie' | 'line';
        title: string;
        data: any[];
    }>;
    actions?: Array<{
        label: string;
        action: string;
        params?: any;
    }>;
}

/**
 * Detecta la intención del usuario basada en su pregunta usando análisis más sofisticado
 */
export function detectIntent(question: string): string {
    const lowerQuestion = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Patrones más sofisticados con puntajes de confianza
    const intentPatterns = {
        overview: {
            keywords: ['resumen', 'estado', 'general', 'como estoy', 'situacion', 'balance', 'total', 'panorama', 'vision'],
            phrases: ['como estoy', 'cual es mi situacion', 'dame un resumen', 'estado general', 'como van mis finanzas'],
            score: 0
        },
        transactions: {
            keywords: ['transacciones', 'gastos', 'movimientos', 'pagos', 'compras', 'gaste', 'pague', 'compre', 'transferencia'],
            phrases: ['cuanto gaste', 'donde gaste', 'mis ultimas compras', 'mis movimientos', 'que compre'],
            score: 0
        },
        budget: {
            keywords: ['presupuesto', 'limite', 'cuanto puedo', 'donde gasto mas', 'planificar', 'ahorrar', 'meta'],
            phrases: ['cuanto puedo gastar', 'donde gasto mas', 'como ahorrar', 'planificar gastos', 'mi presupuesto'],
            score: 0
        },
        analysis: {
            keywords: ['analisis', 'tendencia', 'comparar', 'patron', 'evolucion', 'historico', 'mes pasado', 'ano pasado'],
            phrases: ['comparar con', 'tendencia de', 'patron de gastos', 'analizar mis', 'evolucion de'],
            score: 0
        },
        advice: {
            keywords: ['consejo', 'recomendacion', 'que hago', 'como ahorrar', 'sugerencia', 'ayuda', 'deberia', 'mejor'],
            phrases: ['que me recomiendas', 'como puedo', 'que deberia', 'dame un consejo', 'como mejorar'],
            score: 0
        },
        prediction: {
            keywords: ['predecir', 'futuro', 'proyeccion', 'estimacion', 'podre', 'alcanzare', 'cuando'],
            phrases: ['cuanto tendre', 'podre ahorrar', 'cuando alcanzare', 'proyeccion de', 'en el futuro'],
            score: 0
        },
        alerts: {
            keywords: ['alerta', 'limite', 'aviso', 'exceso', 'presupuesto superado', 'gasto alto'],
            phrases: ['he superado', 'gaste mucho', 'alerta de', 'limite superado', 'aviso de gasto'],
            score: 0
        }
    };

    // Calcular puntajes para cada intención
    for (const [intent, config] of Object.entries(intentPatterns)) {
        // Puntaje por palabras clave
        config.score += config.keywords.filter(keyword => lowerQuestion.includes(keyword)).length * 2;

        // Puntaje por frases completas (mayor peso)
        config.score += config.phrases.filter(phrase => lowerQuestion.includes(phrase)).length * 5;

        // Bonus por contexto específico
        if (intent === 'transactions' && /\b(en|de|categoria|lugar|tienda)\b/.test(lowerQuestion)) {
            config.score += 3;
        }
        if (intent === 'budget' && /\b(este|mes|semana|dia)\b/.test(lowerQuestion)) {
            config.score += 3;
        }
        if (intent === 'analysis' && /\b(ultimo|pasado|anterior|comparacion)\b/.test(lowerQuestion)) {
            config.score += 3;
        }
    }

    // Encontrar la intención con mayor puntaje
    const bestIntent = Object.entries(intentPatterns)
        .sort(([, a], [, b]) => b.score - a.score)[0];

    return bestIntent[1].score > 0 ? bestIntent[0] : 'general';
}

/**
 * Genera respuestas inteligentes basadas en el contexto financiero del usuario
 */
export async function generateIntelligentResponse({ question, context, intent }: AIQuery): Promise<AIResponse> {
    const detectedIntent = intent || detectIntent(question);

    // Intentar generar respuesta rápida para consultas simples
    const quickResponse = generateQuickResponse(question, context, detectedIntent);
    if (quickResponse) {
        return quickResponse;
    }

    // Construir prompt contextual avanzado
    const contextualPrompt = buildContextualPrompt(question, context, detectedIntent);

    try {
        const aiText = await generateText({
            prompt: contextualPrompt,
            maxTokens: 200,
            temperature: 0.7
        });

        // Procesar respuesta y agregar datos adicionales
        const response = await enhanceResponseWithData(aiText, context, detectedIntent);

        return response;
    } catch (error) {
        console.error('Error generating AI response:', error);
        return {
            text: 'Lo siento, no pude procesar tu consulta en este momento. Sin embargo, puedo ayudarte con información básica de tus finanzas.',
            suggestions: generateSuggestions('general', context),
            data: {
                fallback: true,
                basicInfo: {
                    totalBalance: quickAnalysis.getTotalBalance(context),
                    monthlyExpenses: context.monthlyStats.expenses,
                    topCategory: quickAnalysis.getTopSpendingCategory(context)
                }
            }
        };
    }
}

/**
 * Genera respuestas rápidas para consultas simples sin usar IA externa
 */
function generateQuickResponse(question: string, context: UserFinancialContext, intent: string): AIResponse | null {
    const lowerQuestion = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Respuestas rápidas para consultas comunes
    const quickResponses: { [key: string]: () => AIResponse } = {
        // Saludos simples
        'saludo': () => {
            return {
                text: `Hello! 👋 I'm your personal financial assistant.

How can I help you today? I can analyze your spending, give you savings advice, or answer any questions about your finances.`,
                suggestions: ['What is my balance?', 'How much have I spent this month?', 'How is my financial health?', 'Give me savings tips'],
            };
        },

        // Balance y dinero disponible
        'balance': () => {
            const totalBalance = quickAnalysis.getTotalBalance(context);
            return {
                text: `Your current total balance is €${totalBalance.toLocaleString()}.

${totalBalance > context.yearlyStats.averageMonthlySpending ?
                        'You have a good reserve! 💪' : 'I recommend working on building your emergency fund. 📈'}`,
                suggestions: ['How can I increase my balance?', 'How much do I spend per month?', 'Give me savings advice'],
            };
        },

        // Monthly expenses
        'gastos_mes': () => {
            const expenses = context.monthlyStats.expenses;
            const income = context.monthlyStats.income;
            const ratio = income > 0 ? (expenses / income * 100).toFixed(1) : 0;

            return {
                text: `This month you've spent €${expenses.toLocaleString()}.

This represents ${ratio}% of your income. ${Number(ratio) < 80 ? 'Excellent control! 👏' : Number(ratio) < 90 ? 'Moderate spending 👍' : 'Consider reducing some expenses ⚠️'}`,
                suggestions: ['Which category do I spend most on?', 'How can I reduce expenses?', 'Show me my spending by category'],
            };
        },

        // Top spending category
        'categoria_mayor': () => {
            const topCategory = context.monthlyStats.topCategories[0];
            if (!topCategory) {
                return {
                    text: 'I don\'t have enough information about your spending by category.',
                    suggestions: ['Add some transactions', 'Categorize your expenses'],
                };
            }

            return {
                text: `Your highest spending category is "${topCategory.name}" with €${topCategory.amount.toLocaleString()}.

This represents ${topCategory.percentage.toFixed(1)}% of your total expenses.`,
                suggestions: [`How to reduce ${topCategory.name} expenses?`, 'Analyze all my categories', 'Give me budgeting advice'],
            };
        },

        // Savings rate
        'ahorro': () => {
            const savingsRate = context.yearlyStats.savingsRate;

            return {
                text: `Your current savings rate is ${savingsRate.toFixed(1)}%.

${savingsRate >= 20 ? 'Excellent! 🎉' : savingsRate >= 15 ? 'Very good! 👍' : savingsRate >= 10 ? 'You can improve 📈' : 'I recommend increasing your savings ⚠️'}`,
                suggestions: ['How to increase my savings?', 'Strategies to save more', 'Give me personalized advice'],
            };
        },

        // Financial health
        'salud_financiera': () => {
            const healthScore = quickAnalysis.getFinancialHealthScore(context);

            return {
                text: `Your financial health score is ${healthScore.score}/100 - "${healthScore.level}" level.

${healthScore.score >= 80 ? 'Excellent work! 🎉' : healthScore.score >= 60 ? 'You\'re on the right track 👍' : healthScore.score >= 40 ? 'There\'s room for improvement 💪' : 'It\'s time to take action 🚀'}

Would you like me to analyze any specific aspect?`,
                suggestions: ['How to improve my score?', 'Analyze my expenses', 'Give me an improvement plan'],
            };
        }
    };

    // Detectar consultas que pueden responderse rápidamente
    const patterns = {
        saludo: /\b(hola|hey|buenas|buenos|saludos|que tal)\b/,
        balance: /\b(balance|saldo|dinero|cuanto tengo|total|disponible)\b/,
        gastos_mes: /\b(gast[oé]|este mes|gastos mensuales|cuanto gast[eé])\b/,
        categoria_mayor: /\b(categoria|categor[íi]a|donde gasto|mayor gasto|mas gasto)\b/,
        ahorro: /\b(ahorro|ahorrar|tasa de ahorro|cuanto ahorro)\b/,
        salud_financiera: /\b(salud|puntuacion|score|como estoy|situacion)\b/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(lowerQuestion) && quickResponses[type]) {
            const response = quickResponses[type]();
            response.suggestions = generateSuggestions(intent, context).slice(0, 4);
            response.actions = generateActionSuggestions(intent, context).slice(0, 3);
            return response;
        }
    }

    return null; // No hay respuesta rápida disponible
}

/**
 * Construye un prompt contextual inteligente con análisis avanzado
 */
function buildContextualPrompt(question: string, context: UserFinancialContext, intent: string): string {
    const { accounts, recentTransactions, categories, monthlyStats, yearlyStats } = context;
    
    let prompt = `You are a friendly and professional personal financial assistant.

INSTRUCTIONS FOR RESPONSE FORMAT:
- Always respond in English
- Keep responses VERY SHORT (maximum 2-3 short paragraphs)
- Use **bold text** for important numbers and key points
- Use bullet points (•) for ALL lists - never use numbers or numbered lists
- Include 1-2 relevant emojis maximum
- Be direct and concise
- End with a brief follow-up question

CONTENT REQUIREMENTS:
- Maximum 150 words total
- Focus on 1-2 key insights only
- Be extremely concise and actionable
- Skip lengthy explanations

User asks: "${question}"

USER'S FINANCIAL DATA:
Total Balance: €${accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0).toLocaleString()}
Monthly Expenses: €${monthlyStats.expenses.toLocaleString()}
Monthly Income: €${monthlyStats.income.toLocaleString()}
Savings Rate: ${yearlyStats.savingsRate.toFixed(1)}%

${monthlyStats.topCategories.length > 0 ? `Top Spending Categories:
${monthlyStats.topCategories.slice(0, 3).map(cat => `- ${cat.name}: €${cat.amount.toLocaleString()}`).join('\n')}` : ''}

EXAMPLE RESPONSE FORMAT:
## Financial Overview 📊

Your balance is €5,500 with €2,200 spent this month. Your 15.2% savings rate is excellent! 💪

Top insights:
• Groceries take 29.5% of expenses (€650)
• Monthly surplus of €800 available

Quick win: Reduce grocery spending by 10% to boost savings further.

What area should we focus on next?

RESPONSE REQUIREMENTS:
- Follow the example format structure above
- Maximum 4-5 short paragraphs with clear sections
- Include relevant user data with **bold formatting**
- Use numbered lists for steps and bullet points for tips
- Use appropriate emojis throughout
- Be friendly but professional
- End with a helpful follow-up question
- Provide actionable insights when possible`;

    return prompt;
}

/**
 * Mejora la respuesta de IA con datos adicionales y sugerencias inteligentes
 */
async function enhanceResponseWithData(aiText: string, context: UserFinancialContext, intent: string): Promise<AIResponse> {
    const response: AIResponse = {
        text: aiText,
        suggestions: generateSuggestions(intent, context)
    };

    // Agregar análisis avanzado según la intención
    switch (intent) {
        case 'overview':
            const healthScore = quickAnalysis.getFinancialHealthScore(context);
            const predictions = quickAnalysis.getPredictiveInsights(context);

            response.data = {
                summary: {
                    totalBalance: quickAnalysis.getTotalBalance(context),
                    monthlyIncome: context.monthlyStats.income,
                    monthlyExpenses: context.monthlyStats.expenses,
                    savingsRate: context.yearlyStats.savingsRate,
                    healthScore: healthScore.score,
                    healthLevel: healthScore.level,
                    projectedSavings: predictions.savingsProjection
                },
                healthFactors: healthScore.factors,
                alerts: predictions.budgetAlerts
            };

            response.charts = [
                {
                    type: 'pie',
                    title: 'Distribución de Gastos por Categoría',
                    data: context.monthlyStats.topCategories.map(cat => ({
                        name: cat.name,
                        value: cat.amount,
                        percentage: cat.percentage
                    }))
                },
                {
                    type: 'bar',
                    title: 'Puntuación de Salud Financiera',
                    data: [
                        { name: 'Tu Puntuación', value: healthScore.score, color: healthScore.score >= 70 ? 'green' : healthScore.score >= 40 ? 'yellow' : 'red' },
                        { name: 'Objetivo Recomendado', value: 85, color: 'blue' }
                    ]
                }
            ];
            break;

        case 'transactions':
            const patterns = quickAnalysis.getSpendingPatterns(context);

            response.data = {
                recentTransactions: context.recentTransactions.slice(0, 10),
                totalTransactions: context.recentTransactions.length,
                unusualTransactions: patterns.unusualTransactions,
                patterns: patterns.categoryTrends
            };

            response.charts = [{
                type: 'bar',
                title: 'Transacciones por Categoría',
                data: context.monthlyStats.topCategories.map(cat => ({
                    name: cat.name,
                    value: cat.amount,
                    count: cat.transactionCount || 0
                }))
            }];
            break;

        case 'budget':
            const recommendations = quickAnalysis.getSmartRecommendations(context);
            const projections = quickAnalysis.getPredictiveInsights(context);

            response.data = {
                currentSpending: context.monthlyStats.expenses,
                projectedSpending: projections.monthlyProjection,
                availableBalance: context.monthlyStats.income - context.monthlyStats.expenses,
                recommendations: recommendations,
                budgetBreakdown: context.monthlyStats.topCategories
            };

            response.charts = [
                {
                    type: 'bar',
                    title: 'Presupuesto vs Gastos Reales',
                    data: context.monthlyStats.topCategories.map(cat => ({
                        name: cat.name,
                        actual: cat.amount,
                        // Presupuesto sugerido basado en mejores prácticas
                        budget: cat.percentage > 30 ? cat.amount * 0.8 : cat.amount * 1.1
                    }))
                }
            ];
            break;

        case 'analysis':
            const analyticsData = quickAnalysis.getSpendingPatterns(context);
            const healthAnalysis = quickAnalysis.getFinancialHealthScore(context);

            response.data = {
                healthScore: healthAnalysis,
                patterns: analyticsData,
                trends: context.monthlyStats.topCategories.map(cat => ({
                    category: cat.name,
                    amount: cat.amount,
                    percentage: cat.percentage,
                    trend: cat.percentage > 25 ? 'concerning' : cat.percentage > 15 ? 'moderate' : 'healthy'
                }))
            };

            response.charts = [
                {
                    type: 'bar',
                    title: 'Análisis de Gastos por Categoría',
                    data: context.monthlyStats.topCategories.map(cat => ({
                        name: cat.name,
                        value: cat.amount,
                        percentage: cat.percentage,
                        color: cat.percentage > 30 ? 'red' : cat.percentage > 20 ? 'yellow' : 'green'
                    }))
                },
                {
                    type: 'line',
                    title: 'Proyección de Gastos',
                    data: [
                        { month: 'Actual', value: context.monthlyStats.expenses },
                        { month: 'Proyectado', value: quickAnalysis.getPredictiveInsights(context).monthlyProjection }
                    ]
                }
            ];
            break;

        case 'advice':
            const smartRecommendations = quickAnalysis.getSmartRecommendations(context);
            const insights = quickAnalysis.getPredictiveInsights(context);

            response.data = {
                recommendations: smartRecommendations,
                opportunities: insights.opportunities,
                priority: smartRecommendations.priority,
                actionableInsights: [
                    ...smartRecommendations.immediate,
                    ...smartRecommendations.shortTerm.slice(0, 2)
                ]
            };
            break;

        case 'prediction':
            const predictionData = quickAnalysis.getPredictiveInsights(context);

            response.data = {
                predictions: predictionData,
                confidence: 'medium', // Placeholder para futura implementación
                factors: [
                    'Basado en patrones de gasto actuales',
                    'Considera fluctuaciones estacionales',
                    'Proyección conservadora'
                ]
            };

            response.charts = [{
                type: 'line',
                title: 'Proyección Financiera',
                data: [
                    { period: 'Este mes', income: context.monthlyStats.income, expenses: context.monthlyStats.expenses, projected: false },
                    { period: 'Proyección', income: context.monthlyStats.income, expenses: predictionData.monthlyProjection, projected: true }
                ]
            }];
            break;

        case 'alerts':
            const alertInsights = quickAnalysis.getPredictiveInsights(context);
            const urgentRecommendations = quickAnalysis.getSmartRecommendations(context);

            response.data = {
                alerts: alertInsights.budgetAlerts,
                urgentActions: urgentRecommendations.immediate,
                severity: urgentRecommendations.priority,
                impactAnalysis: {
                    currentBalance: quickAnalysis.getTotalBalance(context),
                    projectedBalance: alertInsights.savingsProjection,
                    riskLevel: urgentRecommendations.priority
                }
            };
            break;
    }

    // Agregar acciones sugeridas mejoradas
    response.actions = generateActionSuggestions(intent, context);

    return response;
}

/**
 * Genera sugerencias inteligentes de preguntas de seguimiento
 */
function generateSuggestions(intent: string, context: UserFinancialContext): string[] {
    const healthScore = quickAnalysis.getFinancialHealthScore(context);
    const totalBalance = quickAnalysis.getTotalBalance(context);
    const topCategory = quickAnalysis.getTopSpendingCategory(context);
    const savingsRate = quickAnalysis.getSavingsRate(context);

    // Sugerencias contextuales basadas en la situación del usuario
    const contextualSuggestions: string[] = [];

    // Sugerencias basadas en salud financiera
    if (healthScore.score < 40) {
        contextualSuggestions.push('¿Cómo puedo mejorar mi situación financiera urgentemente?');
        contextualSuggestions.push('¿Qué gastos debería reducir primero?');
    } else if (healthScore.score < 70) {
        contextualSuggestions.push('¿Cómo puedo optimizar mis gastos?');
        contextualSuggestions.push('¿Qué metas de ahorro debería establecer?');
    } else {
        contextualSuggestions.push('¿Cómo puedo maximizar mis ahorros?');
        contextualSuggestions.push('¿Debería considerar inversiones?');
    }

    // Sugerencias basadas en balance
    if (totalBalance < context.yearlyStats.averageMonthlySpending) {
        contextualSuggestions.push('¿Cómo crear un fondo de emergencia?');
    }

    // Sugerencias basadas en tasa de ahorro
    if (savingsRate < 10) {
        contextualSuggestions.push('¿Cómo aumentar mi tasa de ahorro?');
        contextualSuggestions.push('Estrategias para gastar menos');
    }

    // Sugerencias basadas en categoría principal
    if (topCategory !== 'Sin datos') {
        contextualSuggestions.push(`¿Cómo reducir gastos en ${topCategory}?`);
    }

    const intentSpecificSuggestions = {
        overview: [
            '¿Cuál es mi puntuación de salud financiera?',
            'Muéstrame un análisis detallado de mis finanzas',
            '¿Cómo se comparan mis gastos con mis ingresos?',
            'Dame un resumen de mis principales categorías de gasto',
            ...contextualSuggestions.slice(0, 2)
        ],
        transactions: [
            'Muéstrame mis transacciones más grandes del mes',
            `¿Cuánto gasto en promedio en ${topCategory}?`,
            '¿Hay algún patrón inusual en mis gastos?',
            'Analiza mis gastos de la última semana',
            'Encuentra transacciones duplicadas o sospechosas'
        ],
        budget: [
            '¿Cuánto puedo gastar esta semana sin exceder mi presupuesto?',
            'Ayúdame a crear un presupuesto realista',
            '¿En qué categorías debería establecer límites?',
            'Calcula mi capacidad de ahorro optimizada',
            'Proyecta mis gastos para el resto del mes'
        ],
        analysis: [
            'Compara mis gastos de este mes con el anterior',
            '¿Cuáles son mis tendencias de gasto más preocupantes?',
            'Analiza mi comportamiento financiero por días de la semana',
            'Identifica oportunidades de ahorro en mis datos',
            'Muéstrame patrones estacionales en mis gastos'
        ],
        advice: [
            'Dame 3 consejos prioritarios para mejorar mis finanzas',
            '¿Cómo puedo alcanzar una tasa de ahorro del 20%?',
            'Estrategias para reducir gastos sin afectar mi calidad de vida',
            '¿Qué metas financieras debería establecer para este año?',
            'Plan paso a paso para optimizar mi presupuesto'
        ],
        prediction: [
            '¿Cuánto podré ahorrar en los próximos 6 meses?',
            'Proyecta mi situación financiera para fin de año',
            '¿Cuándo podré alcanzar mis metas de ahorro?',
            'Predice mi gasto total del próximo mes',
            '¿En cuánto tiempo duplicaré mis ahorros actuales?'
        ],
        alerts: [
            '¿Qué alertas financieras debería configurar?',
            'Identifica riesgos en mi situación actual',
            '¿He superado algún límite de gasto este mes?',
            'Avísame si tengo gastos inusuales',
            'Configura alertas inteligentes para mi perfil'
        ],
        general: [
            '¿Cuál es mi balance total actual?',
            'Muéstrame mis gastos de este mes',
            '¿En qué categoría gasto más dinero?',
            'Dame consejos personalizados para ahorrar más',
            ...contextualSuggestions.slice(0, 1)
        ]
    };

    // Combinar sugerencias específicas con contextuales
    const suggestions = intentSpecificSuggestions[intent as keyof typeof intentSpecificSuggestions] || intentSpecificSuggestions.general;

    // Agregar sugerencias dinámicas basadas en el contexto actual
    const dynamicSuggestions: string[] = [];

    // Si es fin de mes, agregar sugerencias relacionadas
    const today = new Date();
    const daysLeftInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate();

    if (daysLeftInMonth <= 5) {
        dynamicSuggestions.push('Resumen de mis gastos del mes que termina');
        dynamicSuggestions.push('¿Cómo me fue con mi presupuesto este mes?');
    }

    // Si hay balance negativo, priorizar sugerencias de emergencia
    if (context.monthlyStats.balance < 0) {
        dynamicSuggestions.unshift('¡Ayuda! Tengo balance negativo, ¿qué hago?');
        dynamicSuggestions.unshift('Plan de emergencia para recuperar balance positivo');
    }

    // Combinar todas las sugerencias y limitar a las más relevantes
    return [...dynamicSuggestions, ...suggestions].slice(0, 6);
}

/**
 * Genera acciones inteligentes que el usuario puede realizar
 */
function generateActionSuggestions(intent: string, context: UserFinancialContext): Array<{ label: string; action: string; params?: any }> {
    const actions = [];
    const healthScore = quickAnalysis.getFinancialHealthScore(context);
    const recommendations = quickAnalysis.getSmartRecommendations(context);

    // Acciones universales siempre disponibles
    const universalActions = [
        { label: '🏠 Ver Dashboard', action: 'navigate', params: { path: '/dashboard' } },
        { label: '💰 Ver Transacciones', action: 'navigate', params: { path: '/transactions' } }
    ];

    // Acciones específicas según la intención
    switch (intent) {
        case 'overview':
            actions.push(
                { label: '📊 Análisis Detallado', action: 'deep_analysis' },
                { label: '🎯 Configurar Metas', action: 'open_goals_dialog' },
                { label: '📈 Ver Tendencias', action: 'show_trends' }
            );

            // Acciones condicionales basadas en salud financiera
            if (healthScore.score < 40) {
                actions.push({ label: '🚨 Plan de Emergencia', action: 'emergency_plan' });
            } else if (healthScore.score < 70) {
                actions.push({ label: '⚡ Optimizar Gastos', action: 'optimize_spending' });
            } else {
                actions.push({ label: '💎 Estrategias Avanzadas', action: 'advanced_strategies' });
            }
            break;

        case 'transactions':
            actions.push(
                { label: '➕ Nueva Transacción', action: 'open_transaction_dialog' },
                { label: '🔍 Buscar Transacciones', action: 'open_search_dialog' },
                { label: '📋 Categorizar Pendientes', action: 'categorize_transactions' },
                { label: '📊 Analizar Patrones', action: 'analyze_patterns' }
            );

            // Si hay transacciones inusuales
            const patterns = quickAnalysis.getSpendingPatterns(context);
            if (patterns.unusualTransactions.length > 0) {
                actions.push({ label: '⚠️ Revisar Gastos Inusuales', action: 'review_unusual' });
            }
            break;

        case 'budget':
            actions.push(
                { label: '🎯 Crear Presupuesto', action: 'open_budget_dialog' },
                { label: '📊 Ver Gastos por Categoría', action: 'show_category_breakdown' },
                { label: '⚡ Optimización Automática', action: 'auto_optimize_budget' }
            );

            // Acciones basadas en estado del presupuesto
            if (context.monthlyStats.balance < 0) {
                actions.push({ label: '🚨 Ajustar Presupuesto Urgente', action: 'emergency_budget_adjustment' });
            }

            if (recommendations.priority === 'high') {
                actions.push({ label: '🔥 Acciones Prioritarias', action: 'show_priority_actions' });
            }
            break;

        case 'analysis':
            actions.push(
                { label: '📈 Comparar Períodos', action: 'compare_periods' },
                { label: '🎯 Identificar Tendencias', action: 'trend_analysis' },
                { label: '💡 Oportunidades de Ahorro', action: 'savings_opportunities' },
                { label: '📊 Informe Detallado', action: 'generate_report' }
            );
            break;

        case 'advice':
            actions.push(
                { label: '📋 Plan de Acción', action: 'create_action_plan' },
                { label: '🎯 Establecer Metas', action: 'open_goals_dialog' },
                { label: '📚 Recursos Educativos', action: 'show_education' }
            );

            // Acciones específicas según prioridad
            if (recommendations.immediate.length > 0) {
                actions.push({ label: '🚨 Acciones Inmediatas', action: 'immediate_actions' });
            }
            break;

        case 'prediction':
            actions.push(
                { label: '🔮 Proyección Detallada', action: 'detailed_projection' },
                { label: '📊 Simulador de Escenarios', action: 'scenario_simulator' },
                { label: '🎯 Ajustar Metas', action: 'adjust_goals' },
                { label: '📈 Seguimiento de Progreso', action: 'progress_tracking' }
            );
            break;

        case 'alerts':
            actions.push(
                { label: '⚙️ Configurar Alertas', action: 'configure_alerts' },
                { label: '🚨 Ver Todas las Alertas', action: 'show_all_alerts' },
                { label: '✅ Marcar Como Resuelto', action: 'mark_resolved' }
            );

            if (recommendations.priority === 'high') {
                actions.push({ label: '🔥 Atender Urgentes', action: 'handle_urgent' });
            }
            break;

        default:
            // Acciones por defecto basadas en contexto
            if (context.monthlyStats.balance < 0) {
                actions.push({ label: '🚨 Revisar Balance Negativo', action: 'check_negative_balance' });
            }

            actions.push(
                { label: '💡 Sugerencias Personalizadas', action: 'get_suggestions' },
                { label: '📊 Análisis Rápido', action: 'quick_analysis' }
            );
            break;
    }

    // Agregar acciones contextuales inteligentes
    const contextualActions = [];

    // Si es fin de mes
    const today = new Date();
    const daysLeftInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate();

    if (daysLeftInMonth <= 5) {
        contextualActions.push({ label: '📅 Resumen Mensual', action: 'monthly_summary' });
    }

    // Si hay oportunidades de ahorro significativas
    const insights = quickAnalysis.getPredictiveInsights(context);
    if (insights.opportunities.length > 2) {
        contextualActions.push({ label: '💰 Explorar Ahorros', action: 'explore_savings' });
    }

    // Si tasa de ahorro es baja
    if (context.yearlyStats.savingsRate < 10) {
        contextualActions.push({ label: '📈 Mejorar Ahorro', action: 'improve_savings' });
    }

    // Combinar acciones: contextuales + específicas + universales
    return [
        ...contextualActions,
        ...actions.slice(0, 4), // Limitar acciones específicas
        ...universalActions
    ].slice(0, 6); // Máximo 6 acciones para no sobrecargar la UI
}

/**
 * Funciones de análisis rápido para respuestas inmediatas
 */
export const quickAnalysis = {
    getTotalBalance: (context: UserFinancialContext): number => {
        return context.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    },

    getTopSpendingCategory: (context: UserFinancialContext): string => {
        const topCategory = context.monthlyStats.topCategories[0];
        return topCategory ? topCategory.name : 'Sin datos';
    },

    getSavingsRate: (context: UserFinancialContext): number => {
        return context.yearlyStats.savingsRate;
    },

    getRecentLargeTransaction: (context: UserFinancialContext): any => {
        return context.recentTransactions
            .filter(tx => tx.amount > 0)
            .sort((a, b) => b.amount - a.amount)[0];
    },

    // Nuevas funciones de análisis avanzado
    getFinancialHealthScore: (context: UserFinancialContext): { score: number; level: string; factors: string[] } => {
        let score = 0;
        const factors: string[] = [];

        // Factor 1: Tasa de ahorro (30 puntos max)
        const savingsRate = context.yearlyStats.savingsRate;
        if (savingsRate >= 20) {
            score += 30;
            factors.push('✅ Excelente tasa de ahorro');
        } else if (savingsRate >= 15) {
            score += 25;
            factors.push('👍 Buena tasa de ahorro');
        } else if (savingsRate >= 10) {
            score += 20;
            factors.push('⚠️ Tasa de ahorro moderada');
        } else if (savingsRate >= 5) {
            score += 10;
            factors.push('📉 Tasa de ahorro baja');
        } else {
            factors.push('🚨 Tasa de ahorro muy baja');
        }

        // Factor 2: Diversificación de gastos (20 puntos max)
        const categoryCount = context.monthlyStats.topCategories.length;
        if (categoryCount >= 6) {
            score += 20;
            factors.push('✅ Gastos bien diversificados');
        } else if (categoryCount >= 4) {
            score += 15;
            factors.push('👍 Gastos moderadamente diversificados');
        } else if (categoryCount >= 2) {
            score += 10;
            factors.push('⚠️ Gastos poco diversificados');
        } else {
            factors.push('🚨 Gastos muy concentrados');
        }

        // Factor 3: Flujo de efectivo (25 puntos max)
        const cashFlow = context.monthlyStats.balance;
        const income = context.monthlyStats.income;
        const flowRatio = income > 0 ? cashFlow / income : 0;

        if (flowRatio >= 0.2) {
            score += 25;
            factors.push('✅ Flujo de efectivo excelente');
        } else if (flowRatio >= 0.1) {
            score += 20;
            factors.push('👍 Flujo de efectivo bueno');
        } else if (flowRatio >= 0) {
            score += 15;
            factors.push('⚠️ Flujo de efectivo equilibrado');
        } else if (flowRatio >= -0.1) {
            score += 10;
            factors.push('📉 Flujo de efectivo ajustado');
        } else {
            factors.push('🚨 Flujo de efectivo negativo');
        }

        // Factor 4: Consistencia de gastos (15 puntos max)
        const totalBalance = context.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        if (totalBalance > context.yearlyStats.averageMonthlySpending * 3) {
            score += 15;
            factors.push('✅ Reservas de emergencia adecuadas');
        } else if (totalBalance > context.yearlyStats.averageMonthlySpending * 2) {
            score += 12;
            factors.push('👍 Reservas de emergencia aceptables');
        } else if (totalBalance > context.yearlyStats.averageMonthlySpending) {
            score += 8;
            factors.push('⚠️ Reservas de emergencia limitadas');
        } else {
            factors.push('🚨 Reservas de emergencia insuficientes');
        }

        // Factor 5: Control de gastos grandes (10 puntos max)
        const largestTransaction = context.recentTransactions.length > 0 ?
            Math.max(...context.recentTransactions.map(tx => tx.amount)) : 0;
        const avgTransaction = context.recentTransactions.length > 0 ?
            context.recentTransactions.reduce((sum, tx) => sum + tx.amount, 0) / context.recentTransactions.length : 0;

        if (largestTransaction < avgTransaction * 3) {
            score += 10;
            factors.push('✅ Gastos controlados y consistentes');
        } else if (largestTransaction < avgTransaction * 5) {
            score += 7;
            factors.push('👍 Gastos mayormente controlados');
        } else {
            factors.push('⚠️ Algunos gastos grandes irregulares');
        }

        let level = 'Crítico';
        if (score >= 85) level = 'Excelente';
        else if (score >= 70) level = 'Muy bueno';
        else if (score >= 55) level = 'Bueno';
        else if (score >= 40) level = 'Regular';
        else if (score >= 25) level = 'Necesita mejoras';

        return { score, level, factors };
    },

    getSpendingPatterns: (context: UserFinancialContext): {
        dayOfWeekPattern: string;
        categoryTrends: Array<{ name: string; trend: 'up' | 'down' | 'stable'; impact: 'high' | 'medium' | 'low' }>;
        unusualTransactions: any[];
        recommendations: string[];
    } => {
        const recommendations: string[] = [];
        const categoryTrends = context.monthlyStats.topCategories.map(cat => ({
            name: cat.name,
            trend: 'stable' as const, // Placeholder - necesitaríamos datos históricos
            impact: cat.percentage > 25 ? 'high' as const : cat.percentage > 15 ? 'medium' as const : 'low' as const
        }));

        // Identificar transacciones inusuales (más del 200% del promedio)
        const avgAmount = context.recentTransactions.length > 0 ?
            context.recentTransactions.reduce((sum, tx) => sum + tx.amount, 0) / context.recentTransactions.length : 0;

        const unusualTransactions = context.recentTransactions.filter(tx =>
            tx.amount > avgAmount * 2
        ).slice(0, 3);

        // Generar recomendaciones basadas en patrones
        if (context.monthlyStats.topCategories[0]?.percentage > 40) {
            recommendations.push(`Considera diversificar gastos - ${context.monthlyStats.topCategories[0].name} representa más del 40% de tus gastos`);
        }

        if (context.yearlyStats.savingsRate < 10) {
            recommendations.push('Intenta aumentar tu tasa de ahorro al menos al 10% de tus ingresos');
        }

        if (unusualTransactions.length > 2) {
            recommendations.push('Revisa los gastos grandes recientes para identificar oportunidades de ahorro');
        }

        return {
            dayOfWeekPattern: 'Datos insuficientes', // Placeholder
            categoryTrends,
            unusualTransactions,
            recommendations
        };
    },

    getPredictiveInsights: (context: UserFinancialContext): {
        monthlyProjection: number;
        savingsProjection: number;
        budgetAlerts: string[];
        opportunities: string[];
    } => {
        const currentSpendingRate = context.monthlyStats.expenses;
        const daysInMonth = new Date().getDate();
        const daysRemaining = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - daysInMonth;

        // Proyección simple basada en gastos actuales
        const dailySpending = currentSpendingRate / daysInMonth;
        const monthlyProjection = currentSpendingRate + (dailySpending * daysRemaining);

        const projectedBalance = context.monthlyStats.income - monthlyProjection;
        const savingsProjection = Math.max(0, projectedBalance);

        const budgetAlerts: string[] = [];
        const opportunities: string[] = [];

        // Generar alertas
        if (monthlyProjection > context.monthlyStats.income) {
            budgetAlerts.push('⚠️ Proyección indica posible déficit este mes');
        }

        if (context.yearlyStats.savingsRate < 15 && savingsProjection < context.monthlyStats.income * 0.15) {
            budgetAlerts.push('📊 Tasa de ahorro proyectada por debajo del objetivo recomendado');
        }

        // Identificar oportunidades
        const topCategory = context.monthlyStats.topCategories[0];
        if (topCategory && topCategory.percentage > 30) {
            opportunities.push(`💡 Reducir gastos en ${topCategory.name} podría generar ahorros significativos`);
        }

        if (context.recentTransactions.length > 0) {
            const avgTransaction = context.recentTransactions.reduce((sum, tx) => sum + tx.amount, 0) / context.recentTransactions.length;
            if (avgTransaction > context.monthlyStats.income * 0.05) {
                opportunities.push('💡 Revisar transacciones recurrentes para identificar suscripciones innecesarias');
            }
        }

        return {
            monthlyProjection,
            savingsProjection,
            budgetAlerts,
            opportunities
        };
    },

    getSmartRecommendations: (context: UserFinancialContext): {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
        priority: 'high' | 'medium' | 'low';
    } => {
        const immediate: string[] = [];
        const shortTerm: string[] = [];
        const longTerm: string[] = [];

        let priority: 'high' | 'medium' | 'low' = 'low';

        // Recomendaciones inmediatas (críticas)
        if (context.monthlyStats.balance < 0) {
            immediate.push('🚨 Revisar gastos urgentemente - balance mensual negativo');
            priority = 'high';
        }

        if (context.yearlyStats.savingsRate < 5) {
            immediate.push('💰 Establecer un plan de ahorro básico inmediatamente');
            if (priority !== 'high') priority = 'medium';
        }

        const totalBalance = context.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        if (totalBalance < context.yearlyStats.averageMonthlySpending) {
            immediate.push('🏦 Construir fondo de emergencia - balance muy bajo');
            priority = 'high';
        }

        // Recomendaciones a corto plazo (1-3 meses)
        if (context.monthlyStats.topCategories[0]?.percentage > 35) {
            shortTerm.push(`📊 Diversificar gastos - ${context.monthlyStats.topCategories[0].name} muy concentrado`);
        }

        if (context.yearlyStats.savingsRate < 15) {
            shortTerm.push('📈 Aumentar tasa de ahorro gradualmente al 15%');
        }

        shortTerm.push('📱 Configurar alertas de presupuesto por categoría');
        shortTerm.push('📋 Revisar suscripciones y gastos recurrentes');

        // Recomendaciones a largo plazo (6+ meses)
        longTerm.push('🎯 Establecer metas de ahorro específicas (vacaciones, emergencias, etc.)');
        longTerm.push('📊 Crear presupuesto basado en promedios históricos');
        longTerm.push('💡 Explorar opciones de inversión para ahorros excedentes');
        longTerm.push('📚 Educación financiera continua y optimización de gastos');

        return { immediate, shortTerm, longTerm, priority };
    }
};

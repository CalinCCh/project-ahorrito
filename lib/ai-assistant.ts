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
 * Detecta la intención del usuario a partir de su pregunta
 */
export function detectIntent(question: string): string {
    const lowerQuestion = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Patrones mejorados para detectar intenciones
    const intentPatterns = {
        overview: [
            /como va.*(mis|mi).*finanzas/i,
            /resum(en|ir|e).*(mis|mi).*finanzas/i,
            /panorama.*(general|financiero)/i,
            /salud financiera/i,
            /como estoy financieramente/i,
            /vision general/i,
            /estado general/i,
            /como voy/i,
            /mis numeros/i
        ],
        transactions: [
            /transaccion(es)?/i,
            /gasto(s)?( reciente(s)?)?/i,
            /movimiento(s)?/i,
            /compra(s)?( reciente(s)?)?/i,
            /historial/i,
            /ultimos movimientos/i,
            /en que he gastado/i,
            /pagos/i,
            /cobros/i
        ],
        budget: [
            /presupuesto/i,
            /planificacion/i,
            /plan financiero/i,
            /cuanto puedo gastar/i,
            /limite de gasto/i,
            /distribucion/i,
            /asignacion/i
        ],
        analysis: [
            /anali(sis|za|zar)/i,
            /tendencia(s)?/i,
            /patron(es)?/i,
            /estadistica(s)?/i,
            /grafico(s)?/i,
            /diagrama(s)?/i,
            /compara(r|cion)/i
        ],
        advice: [
            /consejo(s)?/i,
            /recomendacion(es)?/i,
            /sugerencia(s)?/i,
            /como (puedo|deberia|podria)/i,
            /que (debo|deberia) hacer/i,
            /ayuda con/i,
            /orientacion/i
        ],
        prediction: [
            /predic(ir|cion)/i,
            /proyect(ar|cion)/i,
            /futuro/i,
            /pronostico/i,
            /estimacion/i,
            /cuanto tendre/i,
            /como estare/i
        ],
        alerts: [
            /alerta(s)?/i,
            /notificacion(es)?/i,
            /aviso(s)?/i,
            /advertencia(s)?/i,
            /problema(s)?/i,
            /riesgo(s)?/i,
            /preocupa(r|cion)/i
        ]
    };

    // Patrones específicos para consultas de saldo
    // Ampliados para cubrir más variaciones en español
    const balancePatterns = [
        /\b(saldo|balance|dinero|cuanto tengo)\b/i,
        /\b(cuenta|cuentas).*\b(saldo|balance|tengo|disponible)\b/i,
        /\bcuanto.*\b(dinero|saldo|hay)\b/i,
        /\bdisponible\b/i,
        /\bcuanto me queda\b/i,
        /\bver.*\b(saldo|balance|dinero)\b/i,
        /\b(mi|mis).*\b(saldo|cuenta|dinero)\b/i,
        /\b(dime|muestra|cual es|diga).*\b(saldo|dinero|balance)\b/i,
        /\b(tengo).*\b(cuenta|dinero|saldo)\b/i,
        /\bcuanto.*\b(hay|tengo).*\b(cuenta|saldo|disponible)\b/i,
        /\bestado de.*\b(cuenta|saldo|finanzas)\b/i,
        /\bconsulta.*\b(saldo|cuenta|balance)\b/i,
    ];

    // Patrones específicos para gastos mensuales
    const monthlyExpensesPatterns = [
        /\bgasto.*\b(mes|mensual)\b/i,
        /\bcuanto.*\b(gasto|he gastado)\b/i,
        /\bgastos.*\b(mes|mensual)\b/i,
        /\ben que.*\b(gasto|he gastado)\b/i,
        /\bmis gastos\b/i,
        /\banalisis de gastos\b/i,
        /\ben que se va.*\b(dinero|saldo)\b/i
    ];

    // Patrones específicos para transacciones recientes
    const recentTransactionsPatterns = [
        /\b(mis|muestra|ver).*\btransacciones\b/i,
        /\btransacciones recientes\b/i,
        /\b(ultimos|ultimas|recientes).*\b(movimientos|transacciones|gastos|compras)\b/i,
        /\b(que|donde).*\b(he comprado|he gastado)\b/i,
        /\bhistorial.*\b(reciente|transacciones|compras|pagos)\b/i,
        /\bactividad reciente\b/i,
        /\bmovimientos.*\b(recientes|ultimos|cuenta)\b/i,
        /\bver.*\b(transacciones|movimientos|operaciones)\b/i,
        /\bmostrar.*\b(transacciones|movimientos|operaciones)\b/i,
        /\ben que.*\b(he gastado|se ha ido el dinero)\b/i
    ];

    // Verificar patrones específicos primero
    // Si es una consulta de saldo, asignar intent 'balance' (para respuesta rápida)
    for (const pattern of balancePatterns) {
        if (pattern.test(lowerQuestion)) {
            return 'overview';
        }
    }

    // Si es una consulta de gastos mensuales
    for (const pattern of monthlyExpensesPatterns) {
        if (pattern.test(lowerQuestion)) {
            return 'analysis';
        }
    }

    // Si es una consulta de transacciones recientes
    for (const pattern of recentTransactionsPatterns) {
        if (pattern.test(lowerQuestion)) {
            return 'transactions';
        }
    }

    // Para otras intenciones
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
        for (const pattern of patterns) {
            if (pattern.test(lowerQuestion)) {
                return intent;
            }
        }
    }

    // Intención por defecto
    return 'general';
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
                text: `¡Hola! 👋 Soy tu asistente financiero personal.

¿En qué puedo ayudarte hoy? Puedo analizar tus gastos, darte consejos de ahorro o responder cualquier pregunta sobre tus finanzas.`,
                suggestions: ['¿Cuál es mi saldo?', '¿Cuánto he gastado este mes?', '¿Cómo está mi salud financiera?', 'Dame consejos de ahorro'],
            };
        },

        // Balance y dinero disponible
        'balance': () => {
            const totalBalance = quickAnalysis.getTotalBalance(context);
            const accounts = context.accounts;
            const hasAccounts = accounts.length > 0;

            if (!hasAccounts) {
                return {
                    text: `Aún no tienes cuentas conectadas. Para ver tu saldo, primero necesitas conectar al menos una cuenta bancaria.
                    
¿Te gustaría que te ayude a configurar una cuenta?`,
                    suggestions: ['¿Cómo conectar mi cuenta bancaria?', 'Configurar una nueva cuenta', 'Ver tutorial de conexión'],
                };
            }

            // Detalles de saldos individuales
            const accountDetails = accounts.map(acc =>
                `• ${acc.name}: ${acc.balance !== undefined ? acc.balance.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : "Sin datos"}`
            ).join('\n');

            const savingsRate = context.yearlyStats.savingsRate;
            const monthlyExpenses = context.monthlyStats.expenses;

            // Análisis contextual del saldo
            let analysis = '';
            if (totalBalance <= 0) {
                analysis = 'Tu saldo está en números rojos. Es urgente revisar tus gastos. 🚨';
            } else if (totalBalance < monthlyExpenses * 0.5) {
                analysis = 'Tu saldo está por debajo del 50% de tus gastos mensuales. Ten cuidado con tus próximos gastos. ⚠️';
            } else if (totalBalance < monthlyExpenses) {
                analysis = 'Tu saldo cubre menos de un mes de gastos. Considera reducir gastos no esenciales. 📉';
            } else if (totalBalance < monthlyExpenses * 3) {
                analysis = 'Tu saldo es razonable, pero sería ideal aumentarlo para tener un fondo de emergencia más sólido. 📊';
            } else {
                analysis = 'Tienes un buen fondo de emergencia. ¡Excelente trabajo! 💪';
            }

            return {
                text: `Tu saldo total actual es ${totalBalance.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}.

Desglose por cuenta:
${accountDetails}

${analysis}`,
                suggestions: ['¿Cómo puedo aumentar mi saldo?', '¿Cuánto gasto al mes?', 'Dame consejos de ahorro', 'Analiza mis finanzas'],
            };
        },

        // Transacciones recientes
        'transacciones_recientes': () => {
            const { recentTransactions } = context;

            if (!recentTransactions || recentTransactions.length === 0) {
                return {
                    text: `No he encontrado transacciones recientes en tu cuenta. 

Esto puede deberse a que:
• Aún no tienes transacciones registradas
• Necesitas sincronizar tus cuentas bancarias
• Ha habido un problema al recuperar los datos

¿Quieres que te ayude a configurar la conexión con tu banco?`,
                    suggestions: ['Sincronizar cuentas', 'Conectar banco', 'Ver tutorial de conexión'],
                };
            }

            // Formatear fecha para visualización
            const formatDate = (dateStr: string) => {
                const date = new Date(dateStr);
                return date.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                });
            };

            // Obtener las 5 transacciones más recientes
            const latestTransactions = [...recentTransactions]
                .filter(tx => typeof tx.amount === 'number' && !isNaN(tx.amount))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5);

            // Si no hay transacciones válidas después del filtrado
            if (latestTransactions.length === 0) {
                return {
                    text: `No he encontrado transacciones recientes con datos válidos.
                    
Esto puede ser un problema técnico. ¿Quieres intentar sincronizar tus cuentas nuevamente?`,
                    suggestions: ['Sincronizar cuentas', 'Revisar conexión bancaria', 'Ver todas las transacciones'],
                };
            }

            // Construir la lista formateada de transacciones
            const transactionItems = latestTransactions.map(tx => {
                const amount = Number(tx.amount);
                const amountFormatted = amount.toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 2
                });

                return `• ${formatDate(tx.date)} | ${tx.payee} | ${amountFormatted} | ${tx.category || 'Sin categoría'}`;
            }).join('\n');

            // Estadísticas básicas
            const positiveTransactions = latestTransactions.filter(tx => Number(tx.amount) > 0);
            const negativeTransactions = latestTransactions.filter(tx => Number(tx.amount) < 0);
            const positiveCount = positiveTransactions.length;
            const negativeCount = negativeTransactions.length;

            // Calcular balance (ingresos - gastos)
            let balance = 0;
            for (let i = 0; i < latestTransactions.length; i++) {
                const val = Number(latestTransactions[i].amount);
                if (!isNaN(val)) {
                    balance = balance + val;
                }
            }

            // Texto de análisis
            let insightText = '';
            if (negativeCount > positiveCount) {
                insightText = 'La mayoría de tus movimientos recientes son gastos.';
            } else if (positiveCount > negativeCount) {
                insightText = 'La mayoría de tus movimientos recientes son ingresos.';
            }

            return {
                text: `## Tus transacciones más recientes 📊

${transactionItems}

${insightText ? insightText + ' ' : ''}${balance >= 0 ? '¡Tu balance de transacciones recientes es positivo! 👍' : 'Tu balance de transacciones recientes es negativo. Considera revisar tus gastos. ⚠️'}

¿Quieres ver más detalles o analizar algún aspecto específico?`,
                suggestions: ['Analiza mis patrones de gasto', 'Muestra transacciones por categoría', 'Busca gastos recurrentes', 'Compara con el mes pasado'],
                data: {
                    transactions: latestTransactions,
                    balance,
                    positiveCount,
                    negativeCount
                }
            };
        },

        // Monthly expenses
        'gastos_mes': () => {
            const expenses = context.monthlyStats.expenses;
            const income = context.monthlyStats.income;
            const ratio = income > 0 ? (expenses / income * 100).toFixed(1) : 0;

            return {
                text: `Este mes has gastado ${expenses.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}.

Esto representa el ${ratio}% de tus ingresos. ${Number(ratio) < 80 ? '¡Excelente control! 👏' : Number(ratio) < 90 ? 'Gasto moderado 👍' : 'Considera reducir algunos gastos ⚠️'}`,
                suggestions: ['¿En qué categoría gasto más?', '¿Cómo puedo reducir gastos?', 'Muéstrame mis gastos por categoría'],
            };
        },

        // Top spending category
        'categoria_mayor': () => {
            const topCategory = context.monthlyStats.topCategories[0];
            if (!topCategory) {
                return {
                    text: 'No tengo suficiente información sobre tus gastos por categoría.',
                    suggestions: ['Añade algunas transacciones', 'Categoriza tus gastos'],
                };
            }

            return {
                text: `Tu categoría de mayor gasto es "${topCategory.name}" con ${topCategory.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}.

Esto representa el ${topCategory.percentage.toFixed(1)}% de tus gastos totales.`,
                suggestions: [`¿Cómo reducir gastos en ${topCategory.name}?`, 'Analiza todas mis categorías', 'Dame consejos de presupuesto'],
            };
        },

        // Savings rate
        'ahorro': () => {
            const savingsRate = context.yearlyStats.savingsRate;

            return {
                text: `Tu tasa de ahorro actual es del ${savingsRate.toFixed(1)}% de tus ingresos.

${savingsRate >= 20 ? '¡Excelente trabajo! Estás ahorrando por encima de lo recomendado. 🌟' :
                        savingsRate >= 10 ? 'Estás ahorrando a un buen ritmo. Intenta aumentarlo gradualmente. 👍' :
                            'Te recomiendo aumentar tu tasa de ahorro. Un objetivo saludable es al menos 15-20%. 📊'}`,
                suggestions: ['¿Cómo puedo ahorrar más?', 'Crea un plan de ahorro', 'Analiza mis gastos innecesarios'],
            };
        },

        // Financial health
        'salud_financiera': () => {
            const healthScore = quickAnalysis.getFinancialHealthScore(context);

            return {
                text: `Tu puntuación de salud financiera es de ${healthScore.score}/100 - nivel "${healthScore.level}".

${healthScore.score >= 80 ? '¡Excelente trabajo! Estás en una posición financiera sólida. 🎉' :
                        healthScore.score >= 60 ? 'Vas por buen camino. Sigue trabajando en mejorar tus finanzas. 👍' :
                            healthScore.score >= 40 ? 'Hay margen de mejora. Puedo ayudarte a fortalecerte financieramente. 💪' :
                                'Es momento de tomar acción para mejorar tu situación financiera. 🚀'}

¿Te gustaría que analice algún aspecto específico?`,
                suggestions: ['¿Cómo mejorar mi puntuación?', 'Analiza mis gastos', 'Dame un plan de mejora'],
            };
        }
    };

    // Mapeo de intenciones a respuestas rápidas
    if (intent === 'overview') {
        return quickResponses.balance();
    }

    if (intent === 'transactions') {
        return quickResponses.transacciones_recientes();
    }

    // Patrones básicos para saludos
    if (/^hola|^saludos|^buenos dias|^buenas tardes|^buenas noches/i.test(lowerQuestion)) {
        return quickResponses.saludo();
    }

    // No se encontró una respuesta rápida adecuada
    return null;
}

/**
 * Construye un prompt contextual inteligente con análisis avanzado
 */
function buildContextualPrompt(question: string, context: UserFinancialContext, intent: string): string {
    const { accounts, recentTransactions, categories, monthlyStats, yearlyStats } = context;

    // Formatear montos con formato español
    const formatCurrency = (amount: number) => amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
    const totalBalance = formatCurrency(accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0));
    const monthlyExpenses = formatCurrency(monthlyStats.expenses);
    const monthlyIncome = formatCurrency(monthlyStats.income);

    // Análisis financiero adicional para contexto enriquecido
    const topCategory = monthlyStats.topCategories[0]?.name || "Sin datos";
    const topCategoryAmount = monthlyStats.topCategories[0]?.amount || 0;
    const topCategoryPercentage = monthlyStats.topCategories[0]?.percentage || 0;

    const hasNegativeBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0) <= 0;
    const hasLowSavings = yearlyStats.savingsRate < 10;
    const hasSufficientEmergencyFund = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0) > yearlyStats.averageMonthlySpending * 3;

    // Detectar situaciones financieras especiales
    let financialSituation = "normal";
    if (hasNegativeBalance) {
        financialSituation = "crítica";
    } else if (hasLowSavings && !hasSufficientEmergencyFund) {
        financialSituation = "vulnerable";
    } else if (hasSufficientEmergencyFund && yearlyStats.savingsRate > 20) {
        financialSituation = "excelente";
    } else if (yearlyStats.savingsRate > 15 || hasSufficientEmergencyFund) {
        financialSituation = "buena";
    }

    let prompt = `Eres un asistente financiero personal amigable y profesional con pensamiento avanzado independiente.

INSTRUCCIONES PARA EL FORMATO DE RESPUESTA:
- SIEMPRE responde en ESPAÑOL
- Mantén las respuestas MUY CORTAS (máximo 2-3 párrafos breves)
- Usa **texto en negrita** para números importantes y puntos clave
- Usa viñetas (•) para TODAS las listas - nunca uses números o listas numeradas
- Incluye 1-2 emojis relevantes como máximo
- Sé directo y conciso
- Termina con una breve pregunta de seguimiento
- SIEMPRE dirígete al usuario con "tú" (forma informal), no uses "usted"

INSTRUCCIONES DE PENSAMIENTO AUTÓNOMO:
- SIEMPRE analiza el contexto financiero real del usuario y extrae conclusiones por ti mismo
- NO recites datos sin analizarlos - interpreta lo que significan para la situación financiera del usuario
- Si una pregunta es ambigua, haz tu mejor interpretación basada en el contexto
- Cuando te pregunten por el saldo, revisa detalladamente los datos de las cuentas - nunca respondas con valores predeterminados
- Si no hay cuentas conectadas, indícalo claramente y sugiere conectar cuentas
- Muestra pensamiento crítico: considera diferentes aspectos de la situación financiera
- Si detectas problemas financieros, señálalos de manera constructiva
- Responde basándote en datos reales, no en suposiciones

REQUISITOS DE CONTENIDO:
- Máximo 150 palabras en total
- Céntrate solo en 1-2 ideas clave
- Sé extremadamente conciso y práctico
- Omite explicaciones extensas
- Personaliza TODOS los consejos según los datos financieros reales del usuario

El usuario pregunta: "${question}"

PERFIL FINANCIERO DEL USUARIO:
Situación financiera general: ${financialSituation}
Saldo Total: ${totalBalance}
Número de cuentas: ${accounts.length}
Gastos Mensuales: ${monthlyExpenses}
Ingresos Mensuales: ${monthlyIncome}
Tasa de Ahorro: ${yearlyStats.savingsRate.toFixed(1)}%
Principal categoría de gasto: ${topCategory} (${formatCurrency(topCategoryAmount)}, ${topCategoryPercentage.toFixed(1)}%)
Fondo de emergencia: ${hasSufficientEmergencyFund ? "Suficiente" : "Insuficiente"}

${accounts.length > 0 ? `DETALLE DE CUENTAS:
${accounts.map(acc => `- ${acc.name}: ${acc.balance !== undefined ? formatCurrency(acc.balance) : "Sin datos"}`).join('\n')}` : "NO HAY CUENTAS CONECTADAS"}

${monthlyStats.topCategories.length > 0 ? `PRINCIPALES CATEGORÍAS DE GASTO:
${monthlyStats.topCategories.slice(0, 3).map(cat => `- ${cat.name}: ${formatCurrency(cat.amount)} (${cat.percentage.toFixed(1)}%)`).join('\n')}` : ''}

${recentTransactions.length > 0 ? `TRANSACCIONES RECIENTES:
${recentTransactions.slice(0, 3).map(tx => `- ${tx.payee}: ${formatCurrency(tx.amount)} (${new Date(tx.date).toLocaleDateString('es-ES')})`).join('\n')}` : ''}

ANÁLISIS FINANCIERO ACTUAL:
- Balance mensual: ${monthlyStats.balance >= 0 ? "Positivo" : "Negativo"} (${formatCurrency(monthlyStats.balance)})
- Gasto en categoría principal: ${topCategoryPercentage > 35 ? "Excesivamente alto" : topCategoryPercentage > 25 ? "Alto" : "Normal"}
- Diversificación de gastos: ${monthlyStats.topCategories.length > 5 ? "Buena" : monthlyStats.topCategories.length > 3 ? "Regular" : "Limitada"}
- Ahorro mensual: ${typeof monthlyIncome === 'number' && monthlyIncome > 0 ? (monthlyStats.balance > monthlyIncome * 0.2 ? "Excelente" : monthlyStats.balance > 0 ? "Presente pero mejorable" : "Inexistente") : (monthlyStats.balance > 0 ? "Presente" : "Inexistente")}
- Número de transacciones recientes: ${recentTransactions.length}

FORMATO DE RESPUESTA DE EJEMPLO:
## Resumen Financiero 📊

Tu saldo es de **${totalBalance}** con **${monthlyExpenses}** gastados este mes. Tu tasa de ahorro del **${yearlyStats.savingsRate.toFixed(1)}%** es excelente. 💪

Principales conclusiones:
• Alimentación representa el 29,5% de tus gastos (**650€**)
• Tienes un superávit mensual de **800€** disponible

Consejo rápido: Reduce el gasto en alimentación un 10% para aumentar aún más tus ahorros.

¿En qué área quieres que nos centremos ahora?

REQUISITOS DE RESPUESTA:
- Sigue la estructura del formato de ejemplo anterior
- Máximo 4-5 párrafos cortos con secciones claras
- Incluye datos relevantes del usuario con **formato en negrita**
- Usa viñetas para consejos y listas
- Usa emojis apropiados
- Sé amigable pero profesional
- Termina con una pregunta de seguimiento útil
- Proporciona consejos prácticos cuando sea posible
- SIEMPRE usa el formato de moneda español (€)`;

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
        // Verificar si el contexto y las cuentas existen
        if (!context || !context.accounts || !Array.isArray(context.accounts)) {
            console.warn('Contexto de usuario inválido o sin cuentas al consultar saldo');
            return 0;
        }

        // Verificar si hay cuentas disponibles
        if (context.accounts.length === 0) {
            console.log('El usuario no tiene cuentas conectadas');
            return 0;
        }

        // Calcular el saldo total solo de cuentas con balance definido
        let total = 0;
        let accountsWithBalance = 0;

        for (const account of context.accounts) {
            // Solo considerar balances que sean números válidos
            if (account && account.balance !== undefined && !isNaN(account.balance)) {
                total += account.balance;
                accountsWithBalance++;
            }
        }

        // Log para depuración
        console.log(`Saldo total calculado: ${total} de ${accountsWithBalance}/${context.accounts.length} cuentas con datos válidos`);

        return total;
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

"use client";

import { useState, useCallback } from "react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface AIResponse {
  success: boolean;
  response: {
    text: string;
    suggestions?: string[];
    data?: any;
  };
  additionalAnalysis?: {
    healthScore: any;
    predictions: any;
    recommendations: any;
    patterns: any;
  };
  fallbackResponse?: {
    text: string;
    suggestions?: string[];
  };
}

/**
 * Determina si una pregunta requiere contexto financiero
 */
function shouldIncludeFinancialContext(question: string): boolean {
  const lowerQuestion = question.toLowerCase().trim();
  
  // Lista exhaustiva de saludos y frases casuales - NO requieren contexto
  const casualPhrases = [
    // Saludos básicos
    'hola', 'hello', 'hi', 'hey', 'buenas', 'saludos', 'holaa', 'holis',
    'buenos días', 'buenas tardes', 'buenas noches', 'buen día',
    'good morning', 'good afternoon', 'good evening', 'good night',
    
    // Preguntas casuales
    'que tal', 'qué tal', 'como estas', 'cómo estás', 'como va', 'cómo va',
    'how are you', 'how is it going', 'what\'s up', 'wassup',
    
    // Respuestas de cortesía
    'gracias', 'thanks', 'thank you', 'muchas gracias', 'perfecto', 'ok',
    'vale', 'bien', 'genial', 'excelente', 'fantástico', 'está bien',
    
    // Despedidas
    'adiós', 'bye', 'hasta luego', 'nos vemos', 'chao', 'see you', 'goodbye',
    
    // Confirmaciones simples
    'si', 'sí', 'no', 'yes', 'yeah', 'nope', 'sure', 'claro', 'por supuesto'
  ];
  
  // Verificación exacta primero (máxima prioridad)
  if (casualPhrases.includes(lowerQuestion)) {
    return false;
  }
  
  // Verificación de frases que empiezan con saludos casuales
  const casualStarters = ['hola', 'hello', 'hi', 'hey', 'buenas', 'que tal', 'qué tal'];
  if (casualStarters.some(starter => lowerQuestion.startsWith(starter))) {
    // Si empieza con saludo pero es muy largo, podría tener contenido financiero
    if (lowerQuestion.length < 20) {
      return false;
    }
  }
  
  // Palabras clave que SÍ requieren contexto financiero
  const financialKeywords = [
    'balance', 'dinero', 'gasto', 'gastos', 'ingreso', 'ingresos', 'ahorro', 'ahorros',
    'cuenta', 'cuentas', 'transacción', 'transacciones', 'presupuesto', 'categoría',
    'categorías', 'finanza', 'finanzas', 'pago', 'pagos', 'deuda', 'deudas',
    'inversión', 'inversiones', 'salud financiera', 'patrón', 'patrones',
    'análisis', 'recomendación', 'recomendaciones', 'consejo', 'consejos',
    'cuánto', 'dónde gasto', 'en qué gasto', 'proyección', 'predicción',
    'budget', 'money', 'expense', 'expenses', 'income', 'saving', 'savings',
    'account', 'accounts', 'transaction', 'transactions', 'financial',
    'spending', 'payment', 'payments', 'debt', 'investment', 'analysis'
  ];
  
  // Si contiene palabras clave financieras, incluir contexto
  if (financialKeywords.some(keyword => lowerQuestion.includes(keyword))) {
    return true;
  }
  
  // Preguntas que implican análisis financiero
  const analyticalPhrases = [
    '¿cuál es mi', '¿como está mi', '¿cómo está mi', 'analiza mi',
    'muéstrame mi', 'revisa mi', 'explica mi', 'ayúdame con',
    'what is my', 'how is my', 'show me my', 'analyze my', 'help me with'
  ];
  
  if (analyticalPhrases.some(phrase => lowerQuestion.includes(phrase))) {
    return true;
  }
  
  // Para preguntas muy cortas (menos de 15 caracteres), probablemente son casuales
  if (lowerQuestion.length < 15) {
    return false;
  }
  
  // Para preguntas largas, incluir contexto por defecto
  return lowerQuestion.length > 50;
}

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: question,
      role: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Detectar si la pregunta requiere contexto financiero
    const needsFinancialContext = shouldIncludeFinancialContext(question);

    try {
      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          includeContext: needsFinancialContext,
          enhancedAnalysis: needsFinancialContext,
        }),
      });

      const data: AIResponse = await response.json();

      if (data.success && data.response) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response.text || "Lo siento, no pude procesar tu consulta en este momento.",
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
        return data;
      } else {
        throw new Error(data.fallbackResponse?.text || "Error en la respuesta de la IA");
      }
    } catch (error) {
      console.error('Error calling AI assistant:', error);
      
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Lo siento, hay un problema temporal con el asistente. Por favor intenta de nuevo en unos momentos.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackResponse]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const addWelcomeMessage = useCallback((userName?: string) => {
    const welcomeMessage: Message = {
      id: "welcome",
      content: `# ¡Hola ${userName || ""}! 👋

Soy tu **asistente financiero personal** con IA avanzada. Estoy aquí para ayudarte a tomar mejores decisiones financieras.

## **¿Qué puedo hacer por ti?**

• **📊 Analizar tus finanzas** - Revisar gastos, ingresos y patrones de comportamiento
• **💰 Crear presupuestos** - Establecer límites realistas y metas alcanzables
• **🎯 Planificar ahorros** - Definir objetivos y estrategias personalizadas
• **📈 Dar consejos personalizados** - Recomendaciones basadas en tus datos reales
• **🔮 Predecir tendencias** - Proyecciones financieras inteligentes
• **⚠️ Detectar riesgos** - Identificar problemas antes de que crezcan

### **💡 Para empezar, puedes preguntarme:**
- "¿Cómo está mi salud financiera?"
- "¿En qué categorías gasto más?"
- "Ayúdame a crear un plan de ahorros"

**¿En qué te gustaría que te ayude hoy?** 🚀`,
      role: "assistant",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    addWelcomeMessage,
  };
}
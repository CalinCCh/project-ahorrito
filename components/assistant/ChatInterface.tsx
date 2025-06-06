"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  TrendingUp,
  DollarSign,
  PiggyBank,
  Target,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import { useAIChat } from "@/hooks/use-ai-chat";
import { MessageRenderer } from "./MessageRenderer";

const suggestedQuestions = [
  "¿Cómo puedo mejorar mis hábitos de gasto?",
  "¿Cuál es mi puntuación de salud financiera?",
  "Ayúdame a crear un plan de ahorros",
  "Analiza mis patrones de gasto del mes",
];

export function ChatInterface() {
  const { user } = useUser();
  const { messages, isLoading, sendMessage } = useAIChat();
  const [input, setInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    setInput("");
    
    try {
      await sendMessage(textToSend);
    } catch (error) {
      // Error is already handled in the hook
      console.error('Error sending message:', error);
    }
  };

  const getAIResponse = (question: string): string => {
    const lowerQ = question.toLowerCase();
    
    if (lowerQ.includes("spending") || lowerQ.includes("gasto") || lowerQ.includes("habits") || lowerQ.includes("hábitos")) {
      return `## 🎯 Análisis de Hábitos de Gasto

¡Excelente pregunta! Basándome en el historial de transacciones, puedo ver algunos patrones importantes:

### **Recomendaciones Principales:**

• **Categorizar gastos**: Concéntrate en restaurantes y entretenimiento - parecen ser tus gastos variables más altos
• **Establecer límites semanales**: Prueba la regla 50/30/20 para necesidades/deseos/ahorros
• **Configurar alertas**: Establece notificaciones cuando te acerques a los límites por categoría
• **Revisar semanalmente**: Cada domingo, revisa tus gastos y ajusta para la semana siguiente

💡 **Tip Pro**: Usa el método de sobres digitales para gastos variables

¿Te gustaría que te ayude a establecer límites específicos de gasto para alguna categoría?`;
    }
    
    if (lowerQ.includes("health") || lowerQ.includes("salud") || lowerQ.includes("score") || lowerQ.includes("puntuación")) {
      return `## 📊 Tu Puntuación de Salud Financiera

### **Puntuación: 78/100** ✅ ¡Buena!

**Fortalezas detectadas:**
• Patrón de ahorros consistente
• Baja relación deuda-ingresos
• Fondo de emergencia en crecimiento

**Áreas de mejora:**
• Aumentar contribuciones de retiro en 2-3%
• Diversificar tus metas de ahorro
• Considerar automatizar más inversiones

🎯 **Enfoque este mes:** Intenta aumentar tu tasa de ahorro del 15% al 18%. ¡Los pequeños cambios se acumulan con el tiempo!`;
    }
    
    if (lowerQ.includes("savings") || lowerQ.includes("ahorro") || lowerQ.includes("plan")) {
      return `## 💰 Plan de Ahorros Personalizado

¡Vamos a crear un plan que funcione para ti!

### **Metas Recomendadas:**

1. **Fondo de Emergencia:** $2,000 (3 meses de gastos)
2. **Fondo de Vacaciones:** $150/mes → $1,800/año
3. **Fondo para Auto Nuevo:** $200/mes → $2,400/año
4. **Retiro:** Aumentar 401k al 15%

### **Estrategia de Implementación:**

• **Automatizar** transferencias el día de pago
• Usar **cuentas de alto rendimiento**
• **Seguir progreso** con metas visuales
• **Celebrar hitos** alcanzados

💡 ¿Con cuál meta te gustaría empezar primero?`;
    }
    
    if (lowerQ.includes("budget") || lowerQ.includes("presupuesto")) {
      return `## 📝 Presupuesto Personalizado

¡Perfecto! Vamos a construir un presupuesto basado en tus patrones de ingresos y gastos:

### **Desglose Mensual Recomendado:**

• **Vivienda:** $1,200 (30%)
• **Alimentación:** $400 (10%)
• **Transporte:** $300 (7.5%)
• **Entretenimiento:** $200 (5%)
• **Ahorros:** $720 (18%)
• **Otros:** $180 (4.5%)

### **Tips Profesionales:**

• Usa el **método de sobres** para gastos variables
• **Revisa y ajusta** mensualmente
• **Rastrea** con nuestras herramientas integradas
• Permite un **buffer del 5-10%** para gastos inesperados

¿Te ayudo a configurar la categorización automática para estas categorías de presupuesto?`;
    }
    
    return `## 💡 ¡Estoy aquí para ayudarte!

Esa es una pregunta interesante sobre **${question}**. Como tu asistente financiero, puedo ayudarte con:

### **Mis Especialidades:**

• **📊 Análisis y Presupuestos** - Crear presupuestos personalizados
• **🎯 Metas de Ahorro** - Establecer y rastrear objetivos financieros
• **📈 Análisis de Gastos** - Entender tus patrones de consumo
• **💼 Consejos de Inversión** - Orientación básica para hacer crecer tu dinero
• **💳 Gestión de Deudas** - Estrategias para pagar deudas

### **¿Qué área específica te gustaría explorar?**

¡Siéntete libre de preguntarme cualquier cosa sobre tu situación financiera! 🚀`;
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header estilo ChatGPT - más limpio */}
      <div className="flex-none bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">
              Financial Assistant
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Chat Messages - sin scroll visible, contenedor fijo */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-hide">
          {messages.length === 0 ? (
            // Estado inicial más elegante
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  How can I help you today?
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  I'm your personal financial assistant. I can help with expense analysis,
                  savings planning, investment advice, and much more.
                </p>
                
                {/* Sugerencias estilo ChatGPT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {suggestedQuestions.map((question, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-gray-700 group-hover:text-gray-900 font-medium">{question}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${
                    message.role === "assistant"
                      ? "bg-gray-50 border-y border-gray-100"
                      : "bg-white"
                  }`}
                >
                  <div className="max-w-3xl mx-auto py-6 px-6">
                    <div className="flex gap-6">
                      {/* Avatar mejorado */}
                      <div className="flex-shrink-0">
                        {message.role === "assistant" ? (
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <Avatar className="w-10 h-10 shadow-lg">
                            {user?.imageUrl ? (
                              <img src={user.imageUrl} alt="User" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </Avatar>
                        )}
                      </div>
                      
                      {/* Message Content con mejor tipografía */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 mb-2">
                          {message.role === "assistant" ? "Financial Assistant" : "You"}
                        </div>
                        <div className="prose prose-gray max-w-none">
                          {message.role === "assistant" ? (
                            <MessageRenderer content={message.content} />
                          ) : (
                            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 border-y border-gray-100"
                >
                  <div className="max-w-3xl mx-auto py-6 px-6">
                    <div className="flex gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-800 mb-2">
                          Financial Assistant
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Input Area fijo en la parte inferior - estilo ChatGPT */}
        <div className="flex-none bg-white border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative"
            >
              <div className="relative flex items-center">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message Financial Assistant..."
                  className="w-full pr-14 py-4 text-base bg-white border border-gray-300 rounded-xl shadow-sm focus:border-emerald-500 focus:ring-emerald-500/20 focus:ring-2 resize-none transition-all duration-200"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className="absolute right-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-lg p-2.5 transition-colors duration-200"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                AI can make mistakes. Consider checking important information.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import { useAIChat } from "@/hooks/use-ai-chat";
import { MessageRenderer } from "./MessageRenderer";
import { cn } from "@/lib/utils";

interface UnifiedChatProps {
  /** Si es true, se renderiza como sidebar */
  variant?: "fullpage" | "sidebar";
  /** Clase CSS adicional */
  className?: string;
  /** Mensaje inicial a enviar automáticamente */
  initialMessage?: string | null;
  /** Control de si el mensaje ya fue enviado */
  messageSent?: boolean;
  /** Control de si se está procesando */
  isProcessing?: boolean;
  /** Callback cuando se envía un mensaje */
  onMessageSent?: () => void;
  /** Callback cuando cambia el estado de procesamiento */
  onProcessingChange?: (processing: boolean) => void;
}

const suggestedQuestions = [
  "¿Cómo puedo mejorar mis hábitos de gasto?",
  "¿Cuál es mi puntuación de salud financiera?",
  "Ayúdame a crear un plan de ahorro",
  "Analiza mis patrones de gasto mensual",
  "¿En qué categorías gasto más?",
  "Dame consejos para reducir mis gastos",
  "¿Cuál es mi saldo actual?",
  "Muéstrame mis transacciones recientes",
  "¿Cómo está mi salud financiera?",
  "Ayúdame a establecer metas de ahorro",
];

// Función para obtener una sugerencia aleatoria
const getRandomSuggestion = () => {
  const randomIndex = Math.floor(Math.random() * suggestedQuestions.length);
  return suggestedQuestions[randomIndex];
};

export function UnifiedChat({
  variant = "fullpage",
  className,
  initialMessage,
  messageSent = false,
  isProcessing = false,
  onMessageSent,
  onProcessingChange,
}: UnifiedChatProps) {
  const { user } = useUser();
  const { messages, isLoading, sendMessage } = useAIChat();
  const [input, setInput] = useState("");
  const [randomSuggestion, setRandomSuggestion] = useState(
    getRandomSuggestion()
  );
  const [hasProcessedInitialMessage, setHasProcessedInitialMessage] =
    useState(false);
  const lastProcessedMessageRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Process initial message when component mounts with duplication prevention
  useEffect(() => {
    if (
      initialMessage &&
      !isLoading &&
      !messageSent &&
      lastProcessedMessageRef.current !== initialMessage
    ) {
      lastProcessedMessageRef.current = initialMessage;
      setHasProcessedInitialMessage(true);

      // Send message directly without depending on handleSendMessage
      const sendInitialMessage = async () => {
        try {
          onProcessingChange?.(true);
          await sendMessage(initialMessage);
          onMessageSent?.();
        } catch (error) {
          console.error("Error sending initial message:", error);
        } finally {
          onProcessingChange?.(false);
        }
      };
      sendInitialMessage();
    }
  }, [
    initialMessage,
    isLoading,
    sendMessage,
    messageSent,
    onMessageSent,
    onProcessingChange,
  ]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading || isProcessing) return;

    setInput("");

    try {
      onProcessingChange?.(true);
      await sendMessage(textToSend);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      onProcessingChange?.(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleRandomSuggestion = (question: string) => {
    handleSendMessage(question);
    // Generar nueva sugerencia aleatoria para la próxima vez
    setRandomSuggestion(getRandomSuggestion());
  };

  const isSidebar = variant === "sidebar";

  return (
    <div
      className={cn(
        "flex flex-col bg-white",
        isSidebar ? "h-full" : "h-screen",
        className
      )}
    >
      {/* Header - Solo para página completa */}
      {!isSidebar && (
        <div className="flex-none border-b border-gray-200 bg-gradient-to-r from-purple-50 to-violet-50">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Financial Assistant
                </h1>
                <p className="text-sm text-purple-600 font-medium">
                  Your AI-powered financial advisor
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2"></div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div ref={scrollContainerRef} className="h-full overflow-y-auto">
          {messages.length === 0 ? (
            // Estado inicial
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <h2
                  className={cn(
                    "font-semibold text-gray-800 mb-6",
                    isSidebar ? "text-2xl" : "text-4xl"
                  )}
                >
                  ¿En qué puedo ayudarte hoy?
                </h2>

                {/* Botón de sugerencia aleatoria - Siempre visible */}
                <div className="max-w-lg mx-auto">
                  <button
                    onClick={() => handleRandomSuggestion(randomSuggestion)}
                    className="group relative w-full p-4 text-left bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="text-gray-800 font-medium leading-relaxed">
                          {randomSuggestion}
                        </span>
                      </div>
                      <div className="ml-3 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                        <svg
                          className="w-5 h-5 text-purple-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Messages List
            <div>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "border-b border-gray-100",
                    message.role === "assistant" && "bg-gray-50"
                  )}
                >
                  <div className="py-4 px-4">
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {message.role === "assistant" ? (
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <Avatar className="w-8 h-8">
                            {user?.imageUrl ? (
                              <img
                                src={user.imageUrl}
                                alt="User"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </Avatar>
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 mb-1">
                          {message.role === "assistant" ? "Assistant" : "You"}
                        </div>
                        <div className="text-sm">
                          {message.role === "assistant" ? (
                            <MessageRenderer content={message.content} />
                          ) : (
                            <div className="text-gray-800 whitespace-pre-wrap">
                              {message.content}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Loading State */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 py-4 px-4 border-b border-gray-100"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        Asistente
                      </div>
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 text-purple-500 animate-spin mr-2" />
                        <div className="text-sm text-gray-600">Pensando...</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none bg-gradient-to-r from-gray-50 to-purple-50/30 border-t border-gray-200 p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative"
        >
          <div className="relative flex items-end gap-3">
            <div className="flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your finances..."
                className={cn(
                  "w-full bg-white border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-sm transition-all duration-200",
                  isSidebar
                    ? "py-3 px-4 text-sm min-h-[48px]"
                    : "py-4 px-6 text-base min-h-[56px]"
                )}
                disabled={isLoading || isProcessing}
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading || isProcessing}
              className={cn(
                "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200",
                isSidebar ? "p-3 h-[48px] w-[48px]" : "p-4 h-[56px] w-[56px]"
              )}
            >
              {isLoading || isProcessing ? (
                <Loader2
                  className={cn(
                    "animate-spin",
                    isSidebar ? "w-4 h-4" : "w-5 h-5"
                  )}
                />
              ) : (
                <Send className={cn(isSidebar ? "w-4 h-4" : "w-5 h-5")} />
              )}
            </Button>
          </div>

          {!isSidebar && (
            <div className="flex items-center justify-center mt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-gray-600 font-medium">
                  AI can make mistakes. Consider checking important information.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

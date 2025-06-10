"use client";

import { useState, useCallback } from "react";
import { client } from "@/lib/hono";
import type { AIResponse } from "@/lib/ai-assistant";

export interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  data?: any;
  suggestions?: string[];
  charts?: Array<{
    type: "bar" | "pie" | "line";
    title: string;
    data: any[];
  }>;
  actions?: Array<{
    label: string;
    action: string;
    params?: any;
  }>;
}

export interface UseAIAssistantReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  suggestions: string[];
  quickInsights: Array<{
    title: string;
    value: string;
    trend?: "up" | "down" | "stable";
    color?: "green" | "red" | "blue" | "yellow";
  }>;
  sendMessage: (question: string, intent?: string) => Promise<void>;
  clearChat: () => void;
  loadSuggestions: () => Promise<void>;
  loadQuickInsights: () => Promise<void>;
  regenerateResponse: (messageId: string) => Promise<void>;
}

export function useAIAssistant(): UseAIAssistantReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [quickInsights, setQuickInsights] = useState<
    Array<{
      title: string;
      value: string;
      trend?: "up" | "down" | "stable";
      color?: "green" | "red" | "blue" | "yellow";
    }>
  >([]);

  const sendMessage = useCallback(async (question: string, intent?: string) => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);

    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Usar fetch en lugar del cliente Hono
      const response = await fetch("/api/ai-assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          includeContext: true,
          intent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar la consulta");
      }

      const data = await response.json();
      const aiResponse: AIResponse = data.response;

      // Agregar respuesta del asistente
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: aiResponse.text,
        timestamp: new Date(),
        data: aiResponse.data,
        suggestions: aiResponse.suggestions,
        charts: aiResponse.charts,
        actions: aiResponse.actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Actualizar sugerencias globales si están disponibles
      if (aiResponse.suggestions) {
        setSuggestions(aiResponse.suggestions);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");

      // Agregar mensaje de error
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content:
          "Lo siento, ocurrió un error al procesar tu consulta. Por favor, inténtalo de nuevo.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSuggestions = useCallback(async () => {
    try {
      // Usar fetch en lugar del cliente Hono
      const response = await fetch("/api/ai-assistant/suggestions");

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error("Error loading suggestions:", err);
    }
  }, []);

  const loadQuickInsights = useCallback(async () => {
    try {
      // Usar fetch en lugar del cliente Hono
      const response = await fetch("/api/ai-assistant/quick-insights");

      if (response.ok) {
        const data = await response.json();
        setQuickInsights(data.insights);
      }
    } catch (err) {
      console.error("Error loading quick insights:", err);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const regenerateResponse = useCallback(
    async (messageId: string) => {
      const messageIndex = messages.findIndex((msg) => msg.id === messageId);
      if (messageIndex === -1) return;

      // Encontrar el mensaje del usuario anterior
      const userMessageIndex = messageIndex - 1;
      if (userMessageIndex < 0 || messages[userMessageIndex].type !== "user")
        return;

      const userMessage = messages[userMessageIndex];

      // Remover la respuesta anterior
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

      // Regenerar respuesta
      await sendMessage(userMessage.content);
    },
    [messages, sendMessage]
  );

  return {
    messages,
    isLoading,
    error,
    suggestions,
    quickInsights,
    sendMessage,
    clearChat,
    loadSuggestions,
    loadQuickInsights,
    regenerateResponse,
  };
}

/**
 * Hook simplificado para consultas rápidas
 */
export function useQuickAI() {
  const [isLoading, setIsLoading] = useState(false);

  const askQuick = useCallback(async (question: string): Promise<string> => {
    setIsLoading(true);

    try {
      // Usar fetch en lugar del cliente Hono
      const response = await fetch("/api/ai-assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          includeContext: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al procesar la consulta");
      }

      const data = await response.json();
      return data.response.text;
    } catch (err) {
      console.error("Error in quick AI:", err);
      return "Lo siento, no pude procesar tu consulta.";
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    askQuick,
    isLoading,
  };
}

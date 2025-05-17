"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  Send,
  X,
  MessageSquareText,
  Image,
  Code,
  Lightbulb,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchGeminiText } from "@/lib/gemini-chat";

type Message = {
  text: string;
  isUser: boolean;
  timestamp: Date;
};

// Nuevo prompt universal
function buildPrompt(userInput: string) {
  return `Eres el asistente de Ahorrito, una app de finanzas personales. El usuario puede escribirte en cualquier idioma. Detecta automáticamente el idioma del mensaje del usuario y responde SIEMPRE en ese mismo idioma. Solo puedes responder preguntas sobre: ahorro, finanzas personales, consejos financieros o el funcionamiento de la app Ahorrito. Si el usuario pregunta algo fuera de estos temas, responde amablemente: 'Solo puedo ayudarte con ahorro, finanzas personales o la app Ahorrito.' Responde siempre de forma breve, útil y amable.\n\nMensaje del usuario:\n${userInput}`;
}

export const RightSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [width, setWidth] = useState(384);
  const [isResizing, setIsResizing] = useState(false);
  const [isNearDefaultSize, setIsNearDefaultSize] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const defaultWidth = 384;
  const minWidth = 320;
  const maxWidth = 640;
  const snapThreshold = 15;
  const [isLoading, setIsLoading] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [streamedActive, setStreamedActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "¡Hola! Soy el asistente de Ahorrito. ¿En qué puedo ayudarte hoy?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  function toggleSidebar() {
    setIsOpen((prev) => !prev);
  }

  async function handleSendMessage() {
    if (!input.trim()) return;
    // Mostrar el mensaje del usuario inmediatamente
    const userMessage: Message = {
      text: input,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);
    setStreamedText("");
    setStreamedActive(false);
    try {
      const prompt = buildPrompt(currentInput);
      console.log("[Gemini][Sidebar] Prompt generado:", prompt);
      const geminiResponse = await fetchGeminiText(prompt);
      console.log("[Gemini][Sidebar] Respuesta recibida:", geminiResponse);
      let finalResponse = geminiResponse;
      setStreamedText("");
      setStreamedActive(true);
      let i = 0;
      const interval = setInterval(() => {
        setStreamedText(finalResponse.slice(0, i + 1));
        i++;
        if (i >= finalResponse.length) {
          clearInterval(interval);
          setStreamedActive(false);
          setMessages((prev) => [
            ...prev,
            {
              text: finalResponse,
              isUser: false,
              timestamp: new Date(),
            },
          ]);
          setStreamedText("");
          setIsLoading(false);
        }
      }, 18);
    } catch (err) {
      console.error("[Gemini][Sidebar] Error general:", err);
      setMessages((prev) => [
        ...prev,
        {
          text: "Error getting response from Gemini.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
      setStreamedActive(false);
      setStreamedText("");
    }
  }

  // Resize logic (sin cambios)
  function startResizing(e: React.MouseEvent) {
    e.preventDefault();
    setIsResizing(true);
  }
  function stopResizing() {
    if (isNearDefaultSize) setWidth(defaultWidth);
    setIsResizing(false);
  }
  function resize(e: MouseEvent) {
    if (!isResizing) return;
    const newWidth = window.innerWidth - e.clientX;
    const isNearDefault = Math.abs(newWidth - defaultWidth) < snapThreshold;
    setIsNearDefaultSize(isNearDefault);
    if (isNearDefault) {
      setWidth(defaultWidth);
      return;
    }
    if (newWidth >= minWidth && newWidth <= maxWidth) setWidth(newWidth);
  }
  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

  // Quick prompts
  const quickPrompts = [
    { icon: <MessageSquareText size={16} />, text: "¿Cómo puedo ahorrar?" },
    { icon: <Image size={16} />, text: "Ver mis estadísticas" },
    { icon: <Code size={16} />, text: "Configurar alertas" },
    { icon: <Lightbulb size={16} />, text: "Consejos de inversión" },
  ];

  return (
    <div className="fixed top-0 right-0 h-screen z-30">
      <button
        onClick={toggleSidebar}
        className="absolute -left-12 top-28 bg-white/90 backdrop-blur-md rounded-full p-3 shadow-lg border border-gray-100 transition-transform hover:scale-105"
        aria-label={isOpen ? "Cerrar panel lateral" : "Abrir panel lateral"}
      >
        <ChevronLeft
          className={cn(
            "h-5 w-5 text-gray-700 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "h-full bg-white/95 backdrop-blur-md border-l border-gray-100 shadow-lg transition-all duration-300 ease-in-out flex flex-col relative",
          isOpen ? "w-0" : "w-0"
        )}
        style={{
          width: isOpen ? `${width}px` : "0px",
          transition: isResizing ? "none" : "width 0.3s ease-in-out",
        }}
        ref={resizeRef}
      >
        {isOpen && (
          <>
            <div
              className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize z-10 transition-colors hover:bg-gray-200/60"
              onMouseDown={startResizing}
            />
            <div className="border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10 rounded-tl-2xl">
              <h3 className="font-medium text-lg text-gray-800">
                Chat de Ahorrito
              </h3>
              <button
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-gray-700 bg-gray-100/90 rounded-full p-2 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-4 bg-white/95">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "mb-4 flex",
                    message.isUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] p-3 shadow-sm",
                      message.isUser
                        ? "bg-blue-500 text-white rounded-t-2xl rounded-bl-2xl"
                        : "bg-gray-100/90 text-gray-800 rounded-t-2xl rounded-br-2xl"
                    )}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={cn(
                        "text-xs mt-1 text-right",
                        message.isUser ? "text-blue-100" : "text-gray-500"
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {(isLoading || streamedActive) && streamedText && (
                <div className="mb-4 flex justify-start">
                  <div className="max-w-[80%] p-3 shadow-sm bg-gray-100/90 text-gray-800 rounded-t-2xl rounded-br-2xl flex items-center">
                    <span className="text-sm">
                      {streamedText}
                      <span className="animate-pulse text-blue-400">|</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-white/95 backdrop-blur-md">
              <div className="relative mb-3">
                <div className="flex items-center gap-2 bg-gray-100/80 rounded-2xl border border-gray-200/50 hover:border-gray-300/50 focus-within:border-blue-400/60 focus-within:ring-1 focus-within:ring-blue-400/30 shadow-sm px-4 py-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={input.trim() === ""}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      input.trim() !== ""
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-200/90 text-gray-400"
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    className="flex items-center gap-2 p-2.5 text-sm bg-gray-50/90 hover:bg-gray-100/90 rounded-xl border border-gray-200/50 shadow-sm transition-colors text-left"
                    onClick={() => {
                      setInput(prompt.text);
                    }}
                  >
                    <span className="text-blue-500">{prompt.icon}</span>
                    <span className="truncate text-gray-700">
                      {prompt.text}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1 mt-2 bg-gray-50/90 p-2 rounded-xl">
                <Info size={12} />
                El asistente puede cometer errores. Verifica información
                importante.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

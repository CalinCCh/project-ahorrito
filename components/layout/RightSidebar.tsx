"use client";

import React, { memo, useState, useCallback, useMemo, useEffect } from "react";
import { MessageSquare, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { UnifiedChat } from "@/components/assistant/UnifiedChat";
import { useRightSidebar } from "@/hooks/use-right-sidebar";
import { cn } from "@/lib/utils";

export const RightSidebar = memo(() => {
  const pathname = usePathname();
  const { isOpen, predefinedMessage, messageSent, isProcessing, openChat, closeChat, markMessageSent, setProcessing } = useRightSidebar();
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  // No mostrar el botón en la página de transactions
  const shouldShowButton = !pathname?.includes('/transactions');

  // Auto-minimizar después de inactividad
  useEffect(() => {
    const checkInactivity = () => {
      const now = Date.now();
      if (now - lastInteraction > 10000) { // 10 segundos
        setIsMinimized(true);
      }
    };

    const interval = setInterval(checkInactivity, 5000);
    return () => clearInterval(interval);
  }, [lastInteraction]);

  // Resetear minimización en interacciones
  const handleUserInteraction = useCallback(() => {
    setLastInteraction(Date.now());
    setIsMinimized(false);
  }, []);

  // Escuchar interacciones del usuario
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [handleUserInteraction]);

  const handleOpenChat = useCallback(() => {
    openChat();
    handleUserInteraction();
  }, [openChat, handleUserInteraction]);

  const handleCloseChat = useCallback(() => {
    closeChat();
    handleUserInteraction();
  }, [closeChat, handleUserInteraction]);

  // Memoize motion variants for performance
  const motionVariants = useMemo(
    () => ({
      chatButton: {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0, opacity: 0 },
        whileHover: { scale: 1.1 },
        whileTap: { scale: 0.95 },
      },
      backdrop: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
      sidebar: {
        initial: { x: "100%", opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: "100%", opacity: 0 },
        transition: { type: "spring", damping: 30, stiffness: 400, mass: 0.8 },
      },
    }),
    []
  );

  return (
    <>
      {/* Floating Chat Button - Solo mostrar si no estamos en /transactions */}
      <AnimatePresence>
        {!isOpen && shouldShowButton && (
          <div className="relative">
            <motion.button
              {...motionVariants.chatButton}
              onClick={handleOpenChat}
              className={cn(
                "fixed z-50 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white rounded-2xl shadow-lg shadow-purple-500/25 transition-all duration-300 group",
                isMinimized ? "bottom-4 right-4 p-3" : "bottom-6 right-6 p-4"
              )}
              aria-label="Open AI assistant"
              role="button"
              title={isMinimized ? "Assistant - Click to open" : undefined}
            >
              <div className={cn(
                "flex items-center gap-2",
                isMinimized && "scale-90"
              )}>
                <MessageSquare className={cn(
                  "text-white",
                  isMinimized ? "w-5 h-5 animate-pulse" : "w-6 h-6"
                )} aria-hidden="true" />
                {!isMinimized && (
                  <>
                    <span className="hidden lg:block font-medium">Assistant</span>
                    <Sparkles
                      className="w-4 h-4 text-yellow-300 animate-pulse"
                      aria-hidden="true"
                    />
                  </>
                )}
              </div>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              {...motionVariants.backdrop}
              onClick={handleCloseChat}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              aria-hidden="true"
            />

            {/* Sidebar */}
            <motion.div
              {...motionVariants.sidebar}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="AI Assistant Chat"
            >
              {/* Header */}
              <div className="flex-none border-b border-gray-200 bg-gradient-to-r from-purple-50 to-violet-50">
                <div className="flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 text-lg">Assistant</h2>
                      <p className="text-xs text-purple-600 font-medium">Your AI financial advisor</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCloseChat}
                      className="p-2 hover:bg-purple-100 rounded-xl transition-colors"
                      aria-label="Close chat"
                    >
                      <X className="w-5 h-5 text-gray-600" aria-hidden="true" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-hidden">
                <UnifiedChat
                  variant="sidebar"
                  initialMessage={predefinedMessage}
                  messageSent={messageSent}
                  isProcessing={isProcessing}
                  onMessageSent={markMessageSent}
                  onProcessingChange={setProcessing}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

RightSidebar.displayName = "RightSidebar";

export default RightSidebar;

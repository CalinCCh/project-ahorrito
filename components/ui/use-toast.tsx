"use client";

// Este archivo es un proxy para mantener compatibilidad y evitar errores de importación
import { toast } from "sonner";

// Función simple para compatibilidad con el código existente
function useToast() {
  return {
    toast,
    dismiss: () => {}, // Stub function
  };
}

export { useToast, toast };

"use client";

// Este archivo es un proxy para mantener compatibilidad y redirigir a la implementación de sonner
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

// Re-exportamos el Toaster de sonner
export function Toaster() {
  return <SonnerToaster />;
}

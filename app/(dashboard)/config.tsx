"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Esta configuración no causa conflictos con page.tsx
export default function DashboardConfig() {
  const pathname = usePathname();

  // Prefetch páginas comunes para mejorar la navegación
  useEffect(() => {
    // Lista de rutas a precargar
    const routesToPrefetch = [
      "/accounts",
      "/transactions",
      "/savings",
      "/achievements",
      "/categories",
    ];

    // Precargar todas las rutas excepto la actual
    routesToPrefetch
      .filter((route) => !pathname.includes(route))
      .forEach((route) => {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = route;
        document.head.appendChild(link);
      });

    return () => {
      // Limpiar al desmontar
      document
        .querySelectorAll('link[rel="prefetch"]')
        .forEach((el) => el.remove());
    };
  }, [pathname]);

  // Componente invisible que no renderiza nada
  return null;
}

# Planificación del Proyecto Ahorrito

## Tabla de Hitos

| Hito      | Entrega                        | Descripción                                                                                                                                           | Fecha inicio | Fecha fin |
| --------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------- |
| Entrega 1 | Introducción y Objetivos       | • Resumen<br>• Introducción<br>• Objetivos<br>• Análisis del contexto                                                                                 | 17/03/25     | 21/03/25  |
| Entrega 2 | Modelo de datos                | • Modelo de datos<br>• Implementación de la BD                                                                                                        | 24/03/25     | 28/03/25  |
| Entrega 3 | Diseño de la interfaz          | • Diseño de la interfaz<br>• Implementación de las pantallas con funcionalidad parcial (prototipo)<br>• Diagrama de clases inicial<br>• Planificación | 07/04/25     | 11/04/25  |
| Entrega 4 | Implementación                 | • Implementación de la funcionalidad de la aplicación                                                                                                 | 28/04/25     | 02/05/25  |
| Entrega 5 | Puesta en marcha y explotación | • Puesta en marcha, explotación<br>• Prueba y control de calidad<br>• Gestión económica o plan de empresa                                             | 19/05/25     | 23/05/25  |
| Entrega 6 | Código fuente                  | • Documentación completa<br>• Código fuente                                                                                                           | 09/06/25     | 13/06/25  |

## Diagrama Gantt

<!-- Leyenda de colores:
🟩 Verde - Tareas completadas (:done)
🟦 Azul - Tareas en progreso (:active)
🟥 Rojo - Tareas críticas (:crit)
🟪 Morado - Tareas especiales (:milestone)
⬜️ Gris - Tareas pendientes (normal)
-->

```mermaid
%%{init: {
  "theme":"dark",
  "themeVariables": {
    "doneTaskColor": "#4caf50",
    "doneTaskBorderColor": "#2e7d32",
    "doneTaskTextColor": "#000000",
    "activeTaskColor": "#1e88e5",
    "activeTaskBorderColor": "#0d47a1",
    "critTaskColor": "#f44336",
    "critTaskBorderColor": "#b71c1c",
    "taskTextColor": "#ffffff",
    "sectionBkgColor": "#333333",
    "specialTaskColor": "#9c27b0",
    "specialTaskBorderColor": "#6a1b9a",
    "specialTaskTextColor": "#ffffff",
    "fontSize": "16px",
    "fontFamily": "Arial, sans-serif",
    "ganttFontSize": "16px",
    "ganttFontFamily": "Arial, sans-serif",
    "primaryTextColor": "#ffffff",
    "secondaryTextColor": "#ffffff",
    "tertiaryTextColor": "#ffffff",
    "primaryBorderColor": "#ffffff"
  },
  "gantt": {
    "axisFormat": "%a %d/%m",
    "fontSize": 16
  }
}}%%
gantt
    dateFormat  YYYY-MM-DD
    title Diagrama Gantt - Proyecto Ahorrito
    excludes    weekends

    section Entrega 1
    Resumen             :t1_1, 2025-03-17, 2d
    Introduccion        :t1_2, 2025-03-17, 2d
    Objetivos           :t1_3, after t1_2, 2d
    Analisis contexto   :t1_4, 2025-03-18, 3d

    section Entrega 2
    Modelo datos        :t2_1, 2025-03-24, 20d
    Implementacion BD   :t2_2, 2025-03-25, 20d

    section Entrega 3
    Diseno interfaz     :t3_1, 2025-04-07, 15d
    Implementacion prototipo :t3_2, 2025-04-14, 11d
    Diagrama clases     :t3_3, 2025-04-18, 7d
    Planificacion       :t3_4, 2025-04-18, 7d

    section Entrega 4


    section Entrega 5


    section Entrega 6

```

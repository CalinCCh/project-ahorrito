"use client";

import React from "react";
import { motion } from "framer-motion";

interface MessageRendererProps {
  content: string;
}

export function MessageRenderer({ content }: MessageRendererProps) {
  // Process Markdown for special emphasis on financial terms
  const processSpecialTerms = (text: string) => {
    // Financial/Spanish terms to highlight
    const financialTerms = [
      "balance",
      "saldo",
      "gastos",
      "ingresos",
      "ahorros",
      "presupuesto",
      "deuda",
      "inversión",
      "categoría",
      "transacción",
      "financiero",
      "económico",
      "dinero",
      "ahorro",
      "gasto",
      "ingreso",
      "cuenta",
      "cuentas",
      "finanzas",
      "préstamo",
      "crédito",
      "hipoteca",
      "tarjeta",
      "nómina",
      "fiscal",
      "impuesto",
      "impuestos",
      "interés",
      "intereses",
      "patrimonio",
      "banca",
      "bancario",
      "bancaria",
      "financiera",
      "económica",
      "presupuestario",
      "presupuestaria",
    ];

    // Create a regex pattern for all terms that handles word boundaries correctly for Spanish
    const termPattern = financialTerms
      .map((term) => {
        // Escape special regex characters if any
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // For Spanish terms, handle accents and special characters
        return escapedTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      })
      .join("|");

    // Process the text with the pattern
    let processedText = text;

    // Replace financial terms with highlighted versions, respecting word boundaries
    const regex = new RegExp(`\\b(${termPattern})(?![\\w-])`, "gi");
    processedText = processedText.replace(
      regex,
      '<span class="financial-term">$1</span>'
    );

    return processedText;
  };

  // Process content for message display with enhanced formatting
  const processContent = (content: string) => {
    // Process markdown headings with enhanced styling
    let processedText = content.replace(
      /^### (.*$)/gim,
      '<h3 class="financial-heading text-lg font-bold text-purple-700 mt-4 mb-2">$1</h3>'
    );
    processedText = processedText.replace(
      /^## (.*$)/gim,
      '<h2 class="financial-heading text-xl font-bold text-purple-800 mt-5 mb-3">$1</h2>'
    );
    processedText = processedText.replace(
      /^# (.*$)/gim,
      '<h1 class="financial-heading text-2xl font-bold text-purple-900 mt-6 mb-4">$1</h1>'
    );

    // Process bold text with colored emphasis for numbers
    processedText = processedText.replace(
      /\*\*(.*?)\*\*/gim,
      (match, content) => {
        // Check if content contains numbers
        if (/[0-9€$%]/.test(content)) {
          return `<span class="font-bold text-purple-700">${content}</span>`;
        }
        return `<span class="font-bold">${content}</span>`;
      }
    );

    // Process bullet points with enhanced styling and Unicode support
    processedText = processedText.replace(
      /^\s*[-•]\s+(.*$)/gim,
      '<div class="financial-bullet flex mb-2"><div class="bullet-point mr-2 text-purple-600">•</div><div class="bullet-content">$1</div></div>'
    );

    // Process special characters and accents for Spanish
    processedText = processedText.normalize("NFC");

    // Process financial terms with highlighting
    processedText = processSpecialTerms(processedText);

    // Make links open in new tab
    processedText = processedText.replace(
      /<a\s+href=/g,
      '<a target="_blank" rel="noopener noreferrer" href='
    );

    return processedText;
  };

  const processedContent = processContent(content);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-none"
    >
      <div
        className="markdown-content text-gray-800 whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </motion.div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";

interface MessageRendererProps {
  content: string;
}

export function MessageRenderer({ content }: MessageRendererProps) {
  const renderFormattedMessage = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    return (
      <div className="space-y-4">
        {lines.map((line, index) => renderLine(line, index))}
      </div>
    );
  };

  const renderLine = (line: string, index: number) => {
    // Handle headers and remove asterisks
    if (line.startsWith('### ')) {
      const headerText = line.replace('### ', '').replace(/\*\*/g, '').trim();
      return (
        <h4 key={index} className="text-lg font-bold text-gray-900 mt-6 mb-3 border-b border-gray-200 pb-2">
          {headerText}
        </h4>
      );
    }
    
    if (line.startsWith('## ')) {
      const headerText = line.replace('## ', '').replace(/\*\*/g, '').trim();
      return (
        <h3 key={index} className="text-xl font-bold text-gray-900 mt-7 mb-4 border-b-2 border-gray-300 pb-2">
          {headerText}
        </h3>
      );
    }
    
    if (line.startsWith('# ')) {
      const headerText = line.replace('# ', '').replace(/\*\*/g, '').trim();
      return (
        <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-5 border-b-2 border-gray-200 pb-3">
          {headerText}
        </h2>
      );
    }

    // Convert numbered lists to bullet points
    if (line.match(/^\d+\.\s/)) {
      const content = line.replace(/^\d+\.\s*/, '').trim();
      return (
        <div key={index} className="flex items-start gap-4 my-3">
          <div className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
          <div className="flex-1 text-gray-800 leading-relaxed font-medium">
            {renderInlineFormatting(content)}
          </div>
        </div>
      );
    }

    // Handle bullet points
    if (line.match(/^[•·▪▫▸▹►▻\-\*]\s/) || line.trim().startsWith('• ')) {
      const content = line.replace(/^[•·▪▫▸▹►▻\-\*]\s*/, '').trim();
      return (
        <div key={index} className="flex items-start gap-4 my-3">
          <div className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
          <div className="flex-1 text-gray-800 leading-relaxed font-medium">
            {renderInlineFormatting(content)}
          </div>
        </div>
      );
    }

    // Handle blockquotes or important info
    if (line.startsWith('> ')) {
      return (
        <div key={index} className="border-l-4 border-blue-400 pl-4 py-3 my-4 bg-blue-50 rounded-r shadow-sm">
          <div className="text-blue-800 italic font-medium">
            {renderInlineFormatting(line.replace('> ', ''))}
          </div>
        </div>
      );
    }

    // Regular paragraph
    return (
      <p key={index} className="text-gray-800 leading-relaxed my-3">
        {renderInlineFormatting(line)}
      </p>
    );
  };

  const renderInlineFormatting = (text: string) => {
    let processedText = text;
    
    // Handle bold text (**text**) - do this first
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
    
    // Handle italic text (*text*)
    processedText = processedText.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic text-gray-700">$1</em>');
    
    // Handle code (`code`)
    processedText = processedText.replace(/`(.*?)`/g, '<code class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">$1</code>');
    
    // Handle monetary amounts with minimal green styling (only very specific amounts)
    processedText = processedText.replace(/€[\d,]+\.?\d*/g, '<span class="font-semibold text-green-600">$&</span>');
    processedText = processedText.replace(/\$[\d,]+\.?\d*/g, '<span class="font-semibold text-green-600">$&</span>');
    
    // Handle percentages with minimal blue styling (only very specific percentages)
    processedText = processedText.replace(/\b\d+\.?\d*%/g, '<span class="font-semibold text-blue-600">$&</span>');
    
    // Auto-bold important financial terms (but avoid already processed text) - NO COLOR
    processedText = processedText.replace(/\b(balance|saldo|gastos|ingresos|ahorros|presupuesto|deuda|inversión|categoría|transacción|financiero|económico|dinero|ahorro|gasto|ingreso|cuenta|cuentas|finanzas|financial|savings|expenses|income|budget|debt|investment|category|transaction|money|account|accounts)(?![^<]*>)/gi, '<strong class="font-bold text-gray-900">$1</strong>');
    
    // Bold important action words (avoid already processed text) - NO COLOR
    processedText = processedText.replace(/\b(recomiendo|sugiero|importante|atención|cuidado|optimizar|mejorar|reducir|aumentar|analizar|revisar|recommend|suggest|important|attention|optimize|improve|reduce|increase|analyze|review)(?![^<]*>)/gi, '<strong class="font-bold text-gray-900">$1</strong>');
    
    return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-none"
    >
      {renderFormattedMessage(content)}
    </motion.div>
  );
}
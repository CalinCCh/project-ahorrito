"use client";

import { UnifiedChat } from "@/components/assistant/UnifiedChat";

export function AIChatSidebar() {
  return (
    <div className="h-full bg-white border-l border-gray-200">
      <UnifiedChat variant="sidebar" />
    </div>
  );
}
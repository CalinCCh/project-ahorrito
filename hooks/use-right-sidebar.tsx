"use client";

import { create } from 'zustand';

interface RightSidebarStore {
  isOpen: boolean;
  predefinedMessage: string | undefined;
  messageSent: boolean;
  isProcessing: boolean;
  openChat: (message?: string) => void;
  closeChat: () => void;
  markMessageSent: () => void;
  setProcessing: (processing: boolean) => void;
}

export const useRightSidebar = create<RightSidebarStore>((set) => ({
  isOpen: false,
  predefinedMessage: undefined,
  messageSent: false,
  isProcessing: false,
  openChat: (message?: string) => set({
    isOpen: true,
    predefinedMessage: message,
    messageSent: false,
    isProcessing: false
  }),
  closeChat: () => set({
    isOpen: false,
    predefinedMessage: undefined,
    messageSent: false,
    isProcessing: false
  }),
  markMessageSent: () => set({ messageSent: true }),
  setProcessing: (processing: boolean) => set({ isProcessing: processing }),
}));
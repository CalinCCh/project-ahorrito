"use client";

import { UserButton } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <div className="relative w-96">
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-full pl-10 bg-slate-50/80 border border-slate-200 text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm transition-all duration-200 focus-visible:ring-slate-300 focus-visible:border-slate-400 hover:border-slate-300"
            />
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" className="flex items-center gap-2">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm font-medium">Usuario</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

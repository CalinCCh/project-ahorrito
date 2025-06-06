"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Download,
  TrendingUp,
  RefreshCw,
  Calendar,
  Building2,
  Filter,
  Receipt,
} from "lucide-react";
import { AccountFilter } from "@/components/filters/AccountFilter";
import { DateFilter } from "@/components/filters/DateFilter";
import { useIsMobile } from "@/hooks/use-mobile";

interface ModernTransactionsHeaderProps {
  title: string;
  description: string;
  totalCount: number;
  filterValue: string;
  onFilterChange: (value: string) => void;
  onAddNew: () => void;
  onUpload: (results: any) => void;
  onSync?: () => Promise<void>;
  isSyncing?: boolean;
  UploadButton: React.ComponentType<{ onUpload: (results: any) => void }>;
  isUnifiedContainer?: boolean;
  hasLinkedBankAccount?: boolean;
  isAllAccountsView?: boolean;
}

export function ModernTransactionsHeader({
  title,
  description,
  totalCount,
  filterValue,
  onFilterChange,
  onAddNew,
  onUpload,
  onSync,
  isSyncing = false,
  UploadButton,
  isUnifiedContainer = false,
  hasLinkedBankAccount = false,
  isAllAccountsView = false,
}: ModernTransactionsHeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();

  const headerContent = (
    <div
      className={cn(
        "relative overflow-hidden", 
        // Responsive padding
        isMobile ? "px-4 pt-3 pb-3" : "px-4 pt-2 pb-1",
        isUnifiedContainer &&
          "bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-purple-50/50 rounded-t-lg"
      )}
    >
      {/* Background Overlay */}
      {!isUnifiedContainer && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-purple-50/50" />
      )}
      <div className="relative">
        {/* Mobile Layout */}
        {isMobile ? (
          <div className="space-y-4">
            {/* Header en una sola fila: logo, título y contador */}
            <div className="flex items-center justify-center gap-3">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="relative flex-shrink-0"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-20" />
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
              </motion.div>
              
              <div className="flex flex-col items-center">
                <h1 className="text-xl font-bold bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent tracking-tight">
                  {title}
                </h1>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg shadow-xs">
                  <TrendingUp className="size-2.5 text-slate-600" />
                  <span className="text-xs font-medium text-slate-600">
                    {totalCount.toLocaleString()} transactions
                  </span>
                </div>
              </div>
            </div>

            {/* Fila con search y filtros al mismo nivel */}
            <div className="space-y-3">
              {/* Search bar */}
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={cn(
                    "w-4 h-4 transition-colors duration-200",
                    isSearchFocused ? "text-blue-500" : "text-slate-400"
                  )} />
                </div>
                <Input
                  placeholder="Search transactions..."
                  value={filterValue}
                  onChange={(e) => onFilterChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={cn(
                    "pl-10 pr-4 h-11 text-sm bg-slate-50/80 border-slate-300/50 rounded-xl transition-all duration-300 shadow-sm backdrop-blur-sm font-medium placeholder:text-slate-500",
                    isSearchFocused &&
                      "border-blue-400 ring-2 ring-blue-100/50 shadow-lg bg-white/95"
                  )}
                />
              </div>

              {/* Filtros y acción al mismo nivel */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="scale-95">
                    <AccountFilter />
                  </div>
                  <div className="scale-95">
                    <DateFilter />
                  </div>
                </div>
                
                {/* Action button */}
                {!isAllAccountsView && hasLinkedBankAccount && onSync ? (
                  <Button
                    onClick={onSync}
                    disabled={isSyncing}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-10 px-4 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-75 flex-shrink-0"
                  >
                    <RefreshCw
                      className={cn(
                        "w-3 h-3 mr-2 transition-colors duration-200",
                        isSyncing && "animate-spin"
                      )}
                    />
                    <span>{isSyncing ? "Syncing..." : "Sync"}</span>
                  </Button>
                ) : !isAllAccountsView && !hasLinkedBankAccount ? (
                  <Button
                    onClick={onAddNew}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-10 px-4 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer flex-shrink-0"
                  >
                    <Plus className="size-3 mr-2" />
                    Add
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Layout - unchanged */
          <div className="flex items-center justify-between gap-x-6">
            {/* Left side: Icon + Title */}
            <div className="flex flex-col items-start flex-shrink-0 pl-10">
              <div className="flex items-center gap-4 mb-2">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-20" />
                  <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                    <Receipt className="w-6 h-6 text-white" />
                  </div>
                </motion.div>
                <div className="flex flex-col">
                  <h1 className="text-3xl font-bold bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent tracking-tight">
                    {title}
                  </h1>
                  <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg shadow-xs mt-1">
                    <TrendingUp className="size-3 text-slate-600" />
                    <span className="text-xs font-medium text-slate-600">
                      {totalCount.toLocaleString()} transactions tracked
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spacer to push search more to the right */}
            <div className="flex-1"></div>

            {/* Centro: Búsqueda - Improved design */}
            <div className="relative w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={cn(
                  "w-4 h-4 transition-colors duration-200",
                  isSearchFocused ? "text-blue-500" : "text-slate-400"
                )} />
              </div>
              <Input
                placeholder="Search transactions..."
                value={filterValue}
                onChange={(e) => onFilterChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  "pl-10 pr-4 h-11 text-sm bg-slate-50/80 border-slate-300/50 rounded-xl transition-all duration-300 shadow-sm backdrop-blur-sm font-medium placeholder:text-slate-500",
                  isSearchFocused &&
                    "border-blue-400 ring-2 ring-blue-100/50 shadow-lg bg-white/95"
                )}
              />
            </div>

            {/* Lado derecho: Filtros + botones - unified styling */}
            <div className="flex items-center gap-3">
              <AccountFilter />
              <DateFilter />
              <div className="h-6 w-px bg-gradient-to-b from-blue-200 to-indigo-200" />
              
              {/* Mostrar Sync o Add en el mismo lugar, pero nunca ambos */}
              {!isAllAccountsView && hasLinkedBankAccount && onSync ? (
                <Button
                  onClick={onSync}
                  disabled={isSyncing}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-11 px-4 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-75"
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4 mr-2 transition-colors duration-200",
                      isSyncing && "animate-spin"
                    )}
                  />
                  <span>{isSyncing ? "Syncing..." : "Sync"}</span>
                </Button>
              ) : !isAllAccountsView && !hasLinkedBankAccount ? (
                <Button
                  onClick={onAddNew}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-11 px-4 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <Plus className="size-4 mr-2" />
                  Add
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isUnifiedContainer) {
    return headerContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white border border-slate-200 rounded-lg shadow-sm"
    >
      {headerContent}
    </motion.div>
  );
}

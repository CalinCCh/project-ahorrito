"use client";

import * as React from "react";
import { ModernTransactionsHeader } from "./ModernTransactionsHeader";
import { DataTable, DataTableProps } from "./DataTable"; // Asegúrate que DataTableProps esté exportada
import { MobileDataTable } from "./MobileDataTable";
import { Card } from "@/components/ui/card";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";

interface UnifiedTransactionsViewProps<TData, TValue>
  extends Omit<
      React.ComponentProps<typeof ModernTransactionsHeader>,
      "UploadButton"
    >,
    Omit<
      DataTableProps<TData, TValue>,
      "columns" | "data" | "filterKey" | "initialFilterValue"
    > {
  UploadButtonComponent: React.ComponentType<{
    onUpload: (results: any) => void;
  }>;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // filterKey se tomará de filterValue o se puede añadir explícitamente si es diferente
}

export function UnifiedTransactionsView<TData, TValue>({
  // Props para ModernTransactionsHeader
  title,
  description,
  totalCount,
  filterValue,
  onFilterChange,
  onAddNew,
  onUpload,
  onSync,
  isSyncing,
  UploadButtonComponent,
  // Props para DataTable
  columns,
  data,
  onDelete,
  disabled,
  lastSynced,
  syncStatus,
  syncProgress,
  hasLinkedBankAccount,
  isAllAccountsView,
}: UnifiedTransactionsViewProps<TData, TValue>) {
  const isMobile = useIsMobile();

  return (
    <Card className={`border border-gray-300 rounded-lg shadow-sm overflow-hidden flex flex-col h-full max-h-full bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/40 scrollbar-hide ${
      isMobile ? "rounded-lg" : ""
    }`}>
      {/* ModernTransactionsHeader - más compacto en móvil */}
      <div className="flex-shrink-0">
        <ModernTransactionsHeader
          title={title}
          description={description}
          totalCount={totalCount}
          filterValue={filterValue}
          onFilterChange={onFilterChange}
          onAddNew={onAddNew}
          onUpload={onUpload}
          onSync={onSync}
          isSyncing={isSyncing}
          UploadButton={UploadButtonComponent}
          isUnifiedContainer={true}
          hasLinkedBankAccount={hasLinkedBankAccount}
          isAllAccountsView={isAllAccountsView}
        />
      </div>
      
      {/* DataTable - versión móvil o desktop */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {isMobile ? (
          <MobileDataTable
            columns={columns}
            data={data}
            filterKey="payee"
            initialFilterValue={filterValue}
            onDelete={onDelete}
            disabled={disabled}
            onSync={onSync}
            isSyncing={isSyncing}
            lastSynced={lastSynced}
            syncStatus={syncStatus}
            syncProgress={syncProgress}
            hasLinkedBankAccount={hasLinkedBankAccount}
            isAllAccountsView={isAllAccountsView}
            isUnifiedContainer={true}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            filterKey="payee"
            initialFilterValue={filterValue}
            onDelete={onDelete}
            disabled={disabled}
            onSync={onSync}
            isSyncing={isSyncing}
            lastSynced={lastSynced}
            syncStatus={syncStatus}
            syncProgress={syncProgress}
            hasLinkedBankAccount={hasLinkedBankAccount}
            isAllAccountsView={isAllAccountsView}
            isUnifiedContainer={true}
          />
        )}
      </div>
    </Card>
  );
}

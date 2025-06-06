"use client";

import { motion } from "framer-motion";
import { DataTable } from "./DataTable";
import { Row } from "@tanstack/react-table";

interface ModernDataTableWrapperProps<TData, TValue> {
  filterKey: string;
  columns: any[];
  data: TData[];
  onDelete: (rows: Row<TData>[]) => void;
  disabled?: boolean;
  initialFilterValue?: string;
  hasLinkedBankAccount?: boolean;
  isAllAccountsView?: boolean;
  onSync?: () => Promise<void>;
  isSyncing?: boolean;
}

export function ModernDataTableWrapper<TData, TValue>({
  filterKey,
  columns,
  data,
  onDelete,
  disabled,
  initialFilterValue,
  hasLinkedBankAccount,
  isAllAccountsView,
  onSync,
  isSyncing,
}: ModernDataTableWrapperProps<TData, TValue>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden flex-1 flex flex-col min-h-0"
    >
      <DataTable
        filterKey={filterKey}
        columns={columns}
        data={data}
        onDelete={onDelete}
        disabled={disabled}
        initialFilterValue={initialFilterValue}
        hasLinkedBankAccount={hasLinkedBankAccount}
        isAllAccountsView={isAllAccountsView}
        onSync={onSync}
        isSyncing={isSyncing}
      />
    </motion.div>
  );
}

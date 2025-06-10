"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { useGetTotalTransactions } from "@/features/transactions/api/use-get-total-transactions";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { useUnifiedSync } from "@/features/sync/hooks/use-unified-sync";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";

import { DataTable } from "@/components/data-display/DataTable";
import { UnifiedTransactionsView } from "@/components/data-display/UnifiedTransactionsView";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Plus,
  Receipt,
  TrendingUp,
  ArrowUpDown,
  Search,
  Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadButton } from "./upload-button";
import { ImportCard } from "./import-card";
import { AccountFilter } from "@/components/filters/AccountFilter";
import { DateFilter } from "@/components/filters/DateFilter";
import { Row } from "@tanstack/react-table";

import { getColumns, ResponseType } from "./columns";

const INITIAL_IMPORT_RESULTS = {
  data: [],
  errors: [],
  meta: {},
};

enum VARIANTS {
  LIST = "LIST",
  IMPORT = "IMPORT",
}

function getTransactionsDescription(count: number) {
  if (count === 0) {
    return "No transactions available. Connect a bank account or add transactions manually.";
  }
  return `Manage and track all your financial transactions (${count.toLocaleString(
    "en-US"
  )} records)`;
}

export default function TransactionsPage() {
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);
  const [filterValue, setFilterValue] = useState("");
  const [AccountDialog, confirm] = useSelectAccount();

  // Para garantizar que la UI sea consistente entre desktop y móvil
  const [isUnified, setIsUnified] = useState(true);

  // Optimiza el espaciado en móvil
  useEffect(() => {
    // Ajusta el espaciado superior para móvil
    const adjustMobileSpacing = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Busca el contenedor principal en la vista móvil
        const container = document.querySelector(".smart-scroll");
        if (container) {
          // Reduce el padding para mejorar el espaciado
          (container as HTMLElement).style.paddingTop = "0px";
        }
      }
    };

    // Ejecuta el ajuste inmediatamente
    adjustMobileSpacing();

    // Ejecuta el ajuste cuando cambia el tamaño de la ventana
    window.addEventListener("resize", adjustMobileSpacing);

    return () => {
      window.removeEventListener("resize", adjustMobileSpacing);
    };
  }, []);

  const transactionsQuery = useGetTransactions();
  const totalTransactionsQuery = useGetTotalTransactions();
  const deleteTransactions = useBulkDeleteTransactions();
  const createTransactions = useBulkCreateTransactions();
  const { data: accounts = [] } = useGetAccounts();
  const { isSyncing, syncSingleAccount } = useUnifiedSync();
  const newTransaction = useNewTransaction();
  const params = useSearchParams();
  const queryClient = useQueryClient();

  const accountId = params.get("accountId") || "all";
  const isAllAccountsView = accountId === "all" || !accountId;
  const selectedAccount = !isAllAccountsView
    ? accounts.find((a) => a.account.id === accountId)
    : null;
  const hasLinkedBankAccount = !!selectedAccount?.account?.plaidId;
  const transactions = transactionsQuery.data || [];
  const isDisabled =
    transactionsQuery.isLoading || deleteTransactions.isPending;

  function handleUpload(results: typeof INITIAL_IMPORT_RESULTS) {
    setImportResults(results);
    setVariant(VARIANTS.IMPORT);
  }

  function handleCancelImport() {
    setImportResults(INITIAL_IMPORT_RESULTS);
    setVariant(VARIANTS.LIST);
  }

  async function handleSubmitImport(values: Array<any>) {
    const selectedAccountId = await confirm();
    if (!selectedAccountId) {
      return toast.error("Please select an account to continue");
    }
    const dataForApi = values.map((value) => ({
      payee: String(value.payee),
      amount: Number(value.amount),
      date:
        value.date instanceof Date ? value.date : new Date(String(value.date)),
      accountId: selectedAccountId as string,
      notes: value.notes ? String(value.notes) : undefined,
      userCategoryId: value.userCategoryId
        ? String(value.userCategoryId)
        : undefined,
      predefinedCategoryId: value.predefinedCategoryId
        ? String(value.predefinedCategoryId)
        : undefined,
    }));
    createTransactions.mutate(dataForApi, {
      onSuccess: () => {
        handleCancelImport();
        toast.success("Transactions imported successfully!");
      },
      onError: (error) => {
        console.error("Error creating transactions:", error);
        toast.error(
          "Failed to import transactions. Please check the data and try again."
        );
      },
    });
  }

  async function handleSync() {
    try {
      if (isAllAccountsView) {
        const plaidAccounts = accounts.filter((a) => !!a.account.plaidId);
        if (plaidAccounts.length === 0) {
          toast.info("No linked bank accounts found to sync");
          return;
        }

        // Sync accounts one by one instead of all at once
        for (const account of plaidAccounts) {
          await syncSingleAccount({
            id: account.account.id,
            plaidId: account.account.plaidId || undefined,
          });
        }
      } else if (hasLinkedBankAccount && selectedAccount?.account?.plaidId) {
        await syncSingleAccount({
          id: selectedAccount.account.id,
          plaidId: selectedAccount.account.plaidId,
        });
      }
    } catch (error) {
      // Error handling is done within the unified sync hook
      console.error("Sync error:", error);
    }
  }

  if (transactionsQuery.isLoading) {
    return (
      <div className="relative min-h-screen mobile-no-scroll">
        {/* Enhanced Background - Mobile Optimized */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/30" />
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-50/40 via-transparent to-cyan-50/30" />

          {/* Floating orbs - Responsive */}
          <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-16 sm:w-32 h-16 sm:h-32 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-20 sm:bottom-40 right-4 sm:right-20 w-14 sm:w-28 h-14 sm:h-28 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-2xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-lg shadow-black/5 p-6 sm:p-12 text-center w-full max-w-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-4 sm:mb-6"
            >
              <Loader2 className="w-12 sm:w-16 h-12 sm:h-16 text-blue-500 mx-auto" />
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">
              Loading Transactions
            </h3>
            <p className="text-sm sm:text-base text-slate-600">
              Fetching your financial data...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (variant === VARIANTS.IMPORT) {
    return (
      <>
        <AccountDialog />
        <ImportCard
          data={importResults.data}
          onCancel={handleCancelImport}
          onSubmit={handleSubmitImport}
        />
      </>
    );
  }

  const totalCount =
    totalTransactionsQuery.data !== undefined
      ? totalTransactionsQuery.data
      : transactions.length;

  return (
    <div className="relative h-screen overflow-hidden transactions-no-scroll no-scroll-page mobile-no-scroll">
      {/* Enhanced Background - Mobile Optimized */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/30" />
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-50/40 via-transparent to-cyan-50/30" />

        {/* Floating orbs - Responsive */}
        <div className="absolute top-10 sm:top-20 left-2 sm:left-10 w-16 sm:w-32 h-16 sm:h-32 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 sm:bottom-40 right-2 sm:right-20 w-14 sm:w-28 h-14 sm:h-28 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/4 w-12 sm:w-24 h-12 sm:h-24 bg-gradient-to-br from-emerald-400/15 to-teal-400/15 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>

      {/* Contenedor IGUAL QUE SAVINGS */}
      <div className="relative z-10 h-full flex flex-col">
        <div className="container mx-auto px-4 lg:px-6 py-1 sm:py-2 h-full flex flex-col pt-20 lg:pt-2">
          {/* Integrated Header with DataTable - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col min-h-0"
          >
            <UnifiedTransactionsView
              title="Transactions"
              description={getTransactionsDescription(totalCount)}
              totalCount={totalCount}
              filterValue={filterValue}
              onFilterChange={setFilterValue}
              onAddNew={newTransaction.onOpen}
              onUpload={handleUpload}
              onSync={handleSync}
              isSyncing={isSyncing}
              UploadButtonComponent={UploadButton}
              columns={getColumns(hasLinkedBankAccount, isAllAccountsView)}
              data={transactions}
              onDelete={(row: Row<ResponseType>[]) => {
                const ids = row.map((r) => r.original.id);
                deleteTransactions.mutate({ ids });
              }}
              disabled={isDisabled}
              hasLinkedBankAccount={hasLinkedBankAccount}
              isAllAccountsView={isAllAccountsView}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

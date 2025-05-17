"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { useGetTotalTransactions } from "@/features/transactions/api/use-get-total-transactions";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";

import { PageHeader } from "@/components/data-display/PageHeader";
import { DataTable } from "@/components/data-display/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadButton } from "./upload-button";
import { ImportCard } from "./import-card";
import { AccountFilter } from "@/components/filters/AccountFilter";
import { DateFilter } from "@/components/filters/DateFilter";

import { columns } from "./columns";

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
  return `You have a total of ${count} transaction${
    count !== 1 ? "s" : ""
  } recorded.`;
}

export default function TransactionsPage() {
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);
  const [filterValue, setFilterValue] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [AccountDialog, confirm] = useSelectAccount();

  const transactionsQuery = useGetTransactions();
  const totalTransactionsQuery = useGetTotalTransactions();
  const deleteTransactions = useBulkDeleteTransactions();
  const createTransactions = useBulkCreateTransactions();
  const { data: accounts = [] } = useGetAccounts();
  const { refreshAccount } = useAccounts();
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
    setIsSyncing(true);
    try {
      if (isAllAccountsView) {
        const plaidAccounts = accounts.filter((a) => !!a.account.plaidId);
        if (plaidAccounts.length === 0) {
          setIsSyncing(false);
          return;
        }
        await Promise.all(
          plaidAccounts.map((a) => refreshAccount(a.account.plaidId!))
        );
      } else if (hasLinkedBankAccount) {
        await refreshAccount(selectedAccount.account.plaidId!);
      }
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    } catch {
      // Silenciar errores
    } finally {
      setIsSyncing(false);
    }
  }

  if (transactionsQuery.isLoading) {
    return (
      <Card className="border-none drop-shadow-sm">
        <CardContent>
          <div className="h-[500px] w-full flex items-center justify-center">
            <Loader2 className="size-6 text-slate-300 animate-spin" />
          </div>
        </CardContent>
      </Card>
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
    <>
      <PageHeader
        title="Transactions History"
        description={getTransactionsDescription(totalCount)}
        filterArea={
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Filter payee..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-full sm:w-72 md:w-80 lg:w-96 h-10 bg-slate-50/80 border border-slate-200 text-slate-900 placeholder:text-slate-500 rounded-lg shadow-sm transition-all duration-200 focus-visible:ring-slate-300 focus-visible:border-slate-400 hover:border-slate-300"
            />
            <AccountFilter />
            <DateFilter />
          </div>
        }
        actions={
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button
              onClick={newTransaction.onOpen}
              className="w-full sm:w-auto cursor-pointer h-10"
            >
              <Plus className="size-4 mr-2" />
              Add new
            </Button>
            <UploadButton onUpload={handleUpload} />
          </div>
        }
        className="mb-6"
      />
      <div className="-mt-6">
        <div className="h-[770px] min-h-[770px] flex flex-col">
          <DataTable
            filterKey="payee"
            columns={columns}
            data={transactions}
            onDelete={(row) => {
              const ids = row.map((r) => r.original.id);
              deleteTransactions.mutate({ ids });
            }}
            disabled={isDisabled}
            initialFilterValue={filterValue}
            hasLinkedBankAccount={hasLinkedBankAccount}
            isAllAccountsView={isAllAccountsView}
            onSync={handleSync}
            isSyncing={isSyncing}
          />
        </div>
      </div>
    </>
  );
}

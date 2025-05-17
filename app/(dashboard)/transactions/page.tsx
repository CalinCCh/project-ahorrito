"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "@/components/data-display/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";
import { useState } from "react";
import { UploadButton } from "./upload-button";
import { ImportCard } from "./import-card";
import {
  transactions as transactionSchema,
  type insertTransactionSchema,
} from "@/db/schema";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { toast } from "sonner";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { PageHeader } from "@/components/data-display/PageHeader";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { AccountFilter } from "@/components/filters/AccountFilter";
import { DateFilter } from "@/components/filters/DateFilter";
import { useGetTotalTransactions } from "@/features/transactions/api/use-get-total-transactions";

enum VARIANTS {
  LIST = "LIST",
  IMPORT = "IMPORT",
}

const INITIAL_IMPORT_RESULTS = {
  data: [],
  errors: [],
  meta: {},
};

// Define the shape of the objects that the API endpoint expects
interface ExpectedApiInput {
  date: Date; // Changed to Date as the mutation expects this type after coercion
  payee: string;
  amount: number;
  notes?: string; // Optional, and if present, string (undefined if not, not null)
  accountId: string;
  userCategoryId?: string; // Optional, string | undefined
  predefinedCategoryId?: string; // Optional, string | undefined
}

const TransactionsPage = () => {
  const [AccountDialog, confirm] = useSelectAccount();
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);
  const [filterValue, setFilterValue] = useState("");

  const onUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
    console.log({ results });

    setImportResults(results);
    setVariant(VARIANTS.IMPORT);
  };

  const onCancelImport = () => {
    setImportResults(INITIAL_IMPORT_RESULTS);
    setVariant(VARIANTS.LIST);
  };

  const newTransaction = useNewTransaction();
  const createTransactions = useBulkCreateTransactions();
  const deleteTransactions = useBulkDeleteTransactions();
  const transactionsQuery = useGetTransactions();
  const totalTransactionsQuery = useGetTotalTransactions();
  const transactions = transactionsQuery.data || [];

  const getTransactionsDescription = () => {
    const count =
      totalTransactionsQuery.data !== undefined
        ? totalTransactionsQuery.data
        : transactions.length;
    return `You have a total of ${count} transaction${
      count !== 1 ? "s" : ""
    } recorded.`;
  };

  const onSubmitImport = async (
    values: Array<{
      payee: any;
      amount: any;
      date: any; // Can be string or Date from CSV parsing/mapping
      notes?: any;
      userCategoryId?: any;
      predefinedCategoryId?: any;
      [key: string]: any; // Allow other columns from CSV
    }>
  ) => {
    const selectedAccountId = await confirm();

    if (!selectedAccountId) {
      return toast.error("Please select an account to continue");
    }

    const dataForApi: ExpectedApiInput[] = values.map((value) => {
      const notesValue = value.notes;
      const userCategoryIdValue = value.userCategoryId;
      const predefinedCategoryIdValue = value.predefinedCategoryId;

      return {
        payee: String(value.payee),
        amount: Number(value.amount),
        // Ensure 'date' is a Date object
        date:
          value.date instanceof Date
            ? value.date
            : new Date(String(value.date)),
        accountId: selectedAccountId as string,
        notes:
          notesValue === null ||
          notesValue === undefined ||
          String(notesValue).trim() === ""
            ? undefined
            : String(notesValue),
        userCategoryId:
          userCategoryIdValue === null ||
          userCategoryIdValue === undefined ||
          String(userCategoryIdValue).trim() === ""
            ? undefined
            : String(userCategoryIdValue),
        predefinedCategoryId:
          predefinedCategoryIdValue === null ||
          predefinedCategoryIdValue === undefined ||
          String(predefinedCategoryIdValue).trim() === ""
            ? undefined
            : String(predefinedCategoryIdValue),
      };
    });

    createTransactions.mutate(dataForApi, {
      onSuccess: () => {
        onCancelImport();
        toast.success("Transactions imported successfully!");
      },
      onError: (error) => {
        console.error("Error creating transactions:", error);
        toast.error(
          "Failed to import transactions. Please check the data and try again."
        );
      },
    });
  };

  const isDisabled =
    transactionsQuery.isLoading || deleteTransactions.isPending;

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
          onCancel={onCancelImport}
          onSubmit={onSubmitImport}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Transactions History"
        description={getTransactionsDescription()}
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
            <UploadButton onUpload={onUpload} />
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
          />
        </div>
      </div>
    </>
  );
};

export default TransactionsPage;

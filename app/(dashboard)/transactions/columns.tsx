"use client";

import { InferResponseType } from "hono";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Calendar,
  CreditCard,
  DollarSign,
  Hash,
  ShoppingBag,
  User,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { client } from "@/lib/hono";
import { Actions } from "./actions";
import { format } from "date-fns";
import { formatCurrency, convertAmountFromMiliunits } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AccountColumn } from "./account-column";
import { CategoryColumn } from "./category-column";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { cn } from "@/lib/utils";

export type ResponseType = InferResponseType<
  typeof client.api.transactions.$get,
  200
>["data"][0];

export const getColumns = (
  hasLinkedBankAccount: boolean = false,
  isAllAccountsView: boolean = false
): ColumnDef<ResponseType>[] => {
  const shouldShowActions = !hasLinkedBankAccount && !isAllAccountsView;
  
  const baseColumns: ColumnDef<ResponseType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center w-full">
        <Checkbox
          checked={
            table.getIsAllRowsSelected() ||
            (table.getIsSomeRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
          aria-label="Select all"
          className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center w-full">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <div className="w-full px-1 group">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full h-9 px-2.5 py-1.5 justify-start font-normal text-slate-700 hover:bg-slate-50/90 hover:text-black hover:font-normal rounded-lg transition-all duration-200 cursor-pointer"
          >
            <Calendar className="mr-2.5 h-4 w-4 text-slate-500" />
            <span>Date</span>

            {isSorted ? (
              <span className="ml-auto">
                {isSorted === "asc" ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </span>
            ) : (
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ArrowUpDown className="h-4 w-4 text-slate-400" />
              </span>
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("date") as Date;
      return (
        <div className="pl-2.5">
          <span className="font-normal text-slate-800">
            {format(date, "dd MMM, yyyy")}
          </span>
        </div>
      );
    },
    size: 160,
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <div className="w-full px-1 group">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full h-9 px-2.5 py-1.5 justify-start font-normal text-slate-700 hover:bg-slate-50/90 hover:text-black hover:font-normal rounded-lg transition-all duration-200 cursor-pointer"
          >
            <Hash className="mr-2.5 h-4 w-4 text-slate-500" />
            <span>Category</span>

            {isSorted ? (
              <span className="ml-auto">
                {isSorted === "asc" ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </span>
            ) : (
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ArrowUpDown className="h-4 w-4 text-slate-400" />
              </span>
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <CategoryColumn
          id={row.original.id}
          category={row.original.category}
          categoryId={
            row.original.userCategoryId || row.original.predefinedCategoryId
          }
          emoji={row.original.categoryEmoji}
          icon={row.original.categoryIcon}
        />
      );
    },
    size: 180,
  },
  {
    accessorKey: "payee",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <div className="w-full px-1 group">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full h-9 px-2.5 py-1.5 justify-start font-normal text-slate-700 hover:bg-slate-50/90 hover:text-black hover:font-normal rounded-lg transition-all duration-200 cursor-pointer"
          >
            <ShoppingBag className="mr-2.5 h-4 w-4 text-slate-500" />
            <span>Payee</span>

            {isSorted ? (
              <span className="ml-auto">
                {isSorted === "asc" ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </span>
            ) : (
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ArrowUpDown className="h-4 w-4 text-slate-400" />
              </span>
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const { onOpen } = useOpenTransaction();
      return (
        <div
          onClick={() => onOpen(row.original.id)}
          className={cn(
            "flex items-center w-full cursor-pointer px-2 rounded-lg transition-all duration-300 group h-11 max-w-full",
            "hover:bg-gradient-to-r hover:from-white hover:to-slate-50/80",
            "hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5",
            "border border-transparent hover:border-slate-200/50",
            "backdrop-blur-sm"
          )}
        >
          <span className="font-normal text-slate-800 pl-0.5 transition-all duration-200 group-hover:text-slate-900 truncate flex-1 min-w-0">
            {row.getValue("payee") as string}
          </span>
        </div>
      );
    },
    size: 250,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <div className="w-full px-1 group">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full h-9 px-2.5 py-1.5 justify-start font-normal text-slate-700 hover:bg-slate-50/90 hover:text-black hover:font-normal rounded-lg transition-all duration-200 cursor-pointer"
          >
            <DollarSign className="mr-2.5 h-4 w-4 text-slate-500" />
            <span>Amount</span>

            {isSorted ? (
              <span className="ml-auto">
                {isSorted === "asc" ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </span>
            ) : (
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ArrowUpDown className="h-4 w-4 text-slate-400" />
              </span>
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const rawAmount = parseFloat(row.getValue("amount"));
      const amount = convertAmountFromMiliunits(rawAmount);
      const isNegative = rawAmount < 0;
      const currency = row.original.currency || "EUR";

      return (
        <div className="flex items-center">
          <div
            className={`
              ml-1 px-3 py-1.5 rounded-lg text-center
              ${
                isNegative
                  ? "bg-red-50/60 text-red-700 border border-red-100/80"
                  : "bg-emerald-50/60 text-emerald-700 border border-emerald-100/80"
              }
            `}
            style={{ width: "105px" }}
          >
            <span className="font-medium tabular-nums tracking-tight">
              {isNegative ? "−" : "+"}
              {formatCurrency(Math.abs(amount), currency).replace("-", "")}
            </span>
          </div>
        </div>
      );
    },
    size: 140,
  },
  {
    accessorKey: "account",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <div className="w-full px-1 group">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full h-9 px-2.5 py-1.5 justify-start font-normal text-slate-700 hover:bg-slate-50/90 hover:text-black hover:font-normal rounded-lg transition-all duration-200 cursor-pointer"
          >
            <CreditCard className="mr-2.5 h-4 w-4 text-slate-500" />
            <span>Account</span>

            {isSorted ? (
              <span className="ml-auto">
                {isSorted === "asc" ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </span>
            ) : (
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ArrowUpDown className="h-4 w-4 text-slate-400" />
              </span>
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <AccountColumn
          account={row.original.account}
          accountId={row.original.accountId}
        />
      );
    },
    size: 160,
  },
  ];

  // Conditionally add actions column
  if (shouldShowActions) {
    baseColumns.push({
      id: "actions",
      cell: ({ row }) => <Actions id={row.original.id} />,
      size: 50,
    });
  }

  return baseColumns;
};

// Export default columns for backward compatibility
export const columns = getColumns();

"use client";

import { InferResponseType } from "hono";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Calendar, CreditCard, DollarSign, Hash, ShoppingBag, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { client } from "@/lib/hono";
import { Actions } from "./actions";
import { format } from "date-fns";
import { formatCurrency, convertAmountFromMiliunits } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AccountColumn } from "./account-column";
import { CategoryColumn } from "./category-column ";

export type ResponseType = InferResponseType<
  typeof client.api.transactions.$get,
  200
>["data"][0];

export const columns: ColumnDef<ResponseType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-slate-100/70 font-normal text-slate-700"
        >
          <Calendar className="mr-2 h-4 w-4 text-slate-500" />
          Date
          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-slate-400" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("date") as Date;
      return <span className="font-normal text-slate-800">{format(date, "dd MMM, yyyy")}</span>;
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-slate-100/70 font-normal text-slate-700"
        >
          <Hash className="mr-2 h-4 w-4 text-slate-500" />
          Category
          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-slate-400" />
        </Button>
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
        />
      );
    },
  },
  {
    accessorKey: "payee",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-slate-100/70 font-normal text-slate-700"
        >
          <ShoppingBag className="mr-2 h-4 w-4 text-slate-500" />
          Payee
          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-slate-400" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <span className="font-normal text-slate-800">{row.getValue("payee") as string}</span>;
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-slate-100/70 font-normal text-slate-700"
        >
          <DollarSign className="mr-2 h-4 w-4 text-slate-500" />
          Amount
          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-slate-400" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const rawAmount = parseFloat(row.getValue("amount"));
      const amount = convertAmountFromMiliunits(rawAmount);
      return (
        <Badge
          variant={rawAmount < 0 ? "destructive" : "primary"}
          className={`rounded-full text-xs font-normal px-3.5 py-1.5 shadow-sm ${
            rawAmount < 0 
              ? "bg-red-50 text-red-600 hover:bg-red-100" 
              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
          }`}
        >
          {formatCurrency(amount)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "account",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-slate-100/70 font-normal text-slate-700"
        >
          <CreditCard className="mr-2 h-4 w-4 text-slate-500" />
          Account
          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-slate-400" />
        </Button>
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
  },
  {
    id: "actions",
    cell: ({ row }) => <Actions id={row.original.id} />,
  },
];

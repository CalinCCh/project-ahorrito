"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Trash } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey: string;
  onDelete: (rows: Row<TData>[]) => void;
  disabled?: boolean;
  initialFilterValue?: string;
  onSync?: () => Promise<void>;
  isSyncing?: boolean;
  lastSynced?: Date | null;
  syncStatus?: string | null;
  syncProgress?: {
    current: number;
    total: number;
  } | null;
  hasLinkedBankAccount?: boolean;
  isAllAccountsView?: boolean;
  isUnifiedContainer?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  onDelete,
  disabled,
  initialFilterValue = "",
  onSync,
  isSyncing = false,
  lastSynced = null,
  syncStatus = null,
  syncProgress = null,
  hasLinkedBankAccount = false,
  isAllAccountsView = false,
  isUnifiedContainer = false,
}: DataTableProps<TData, TValue>) {
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to perform a bulk delete."
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    initialFilterValue
      ? [
          {
            id: filterKey,
            value: initialFilterValue,
          },
        ]
      : []
  );

  const [rowSelection, setRowSelection] = React.useState({});

  // Update filter when initialFilterValue changes
  React.useEffect(() => {
    if (initialFilterValue !== undefined) {
      setColumnFilters(
        initialFilterValue
          ? [
              {
                id: filterKey,
                value: initialFilterValue,
              },
            ]
          : []
      );
    }
  }, [initialFilterValue, filterKey]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    columnResizeMode: "onChange",
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 8, // Changed to 8 rows to avoid scroll within datatable
      },
    },
  });

  const ROW_HEIGHT = 36; // Altura más compacta para evitar expansión de filas
  const HEADER_HEIGHT = 44; // Altura del header reducida
  const PAGINATION_HEIGHT = 60; // Altura aproximada de la sección de paginación reducida
  const FILTER_AREA_HEIGHT = 65; // Altura aproximada del área de filtros reducida
  const visibleRows = table.getRowModel().rows;

  // Calculamos cuántas filas caben exactamente en el espacio disponible
  const totalRows = 10; // Incrementado a 10 filas para mejor aprovechamiento del espacio
  const emptyRowsCount = Math.max(0, totalRows - visibleRows.length);

  // Format last synced date
  const formatLastSynced = (date: Date | null) => {
    if (!date) return "Never";
    const today = new Date();
    const isSameDay = (date1: Date, date2: Date) => {
      return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      );
    };
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };
    if (isSameDay(date, today)) return `Today at ${formatTime(date)}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(date, yesterday)) return `Yesterday at ${formatTime(date)}`;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tableContent = (
    <>
      <ConfirmDialog />
      {/* No renderizar la fila de filtro si es un contenedor unificado, ya que el header lo maneja */}
      {!isUnifiedContainer && (
        <div className="flex items-center justify-between py-4 px-4">
          <Input
            placeholder={`Filter by ${filterKey}...`}
            value={
              (table.getColumn(filterKey)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(filterKey)?.setFilterValue(event.target.value)
            }
            className="max-w-sm h-10 text-sm bg-slate-50 border-slate-200 rounded-lg transition-all duration-200 focus:bg-white focus:border-blue-300 ring-1 ring-transparent focus:ring-blue-100"
          />
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              disabled={disabled}
              size="sm"
              variant="outline"
              className="text-xs font-normal h-10 cursor-pointer"
              onClick={async () => {
                const ok = await confirm();
                if (ok) {
                  onDelete(table.getFilteredSelectedRowModel().rows);
                  table.resetRowSelection();
                }
              }}
            >
              <Trash className="size-4 mr-2" />
              Delete ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}
        </div>
      )}{" "}
      <div // Wrapper for <Table>
        className={cn(
          isUnifiedContainer
            ? "flex-1 min-h-0 overflow-hidden bg-white border-t border-slate-200 scrollbar-hide"
            : "border rounded-lg overflow-hidden flex-1 scrollbar-hide"
        )}
        role="region"
        aria-label="Data table"
        tabIndex={isUnifiedContainer ? 0 : undefined}
      >
        <Table className="table-fixed w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-12">
                {headerGroup.headers.map((header) => {
                  // Define fixed widths for each column
                  const getColumnWidth = (columnId: string) => {
                    switch (columnId) {
                      case "select":
                        return "w-12"; // 48px for checkbox
                      case "date":
                        return "w-32"; // 128px for date
                      case "category":
                        return "w-48"; // 192px for category
                      case "payee":
                        return "w-56"; // 224px for payee
                      case "account":
                        return "w-40"; // 160px for account
                      case "amount":
                        return "w-28"; // 112px for amount
                      case "actions":
                        return "w-16"; // 64px for actions
                      default:
                        return "w-32"; // Default width
                    }
                  };

                  return (
                    <TableHead
                      key={header.id}
                      className={`bg-slate-50 h-12 ${getColumnWidth(
                        header.column.id
                      )} px-2`}
                    >
                      <div className="truncate">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-9" // Further reduced from h-10
                >
                  {row.getVisibleCells().map((cell) => {
                    // Apply same width logic as headers
                    const getColumnWidth = (columnId: string) => {
                      switch (columnId) {
                        case "select":
                          return "w-12";
                        case "date":
                          return "w-32";
                        case "category":
                          return "w-48";
                        case "payee":
                          return "w-56";
                        case "account":
                          return "w-40";
                        case "amount":
                          return "w-28";
                        case "actions":
                          return "w-16";
                        default:
                          return "w-32";
                      }
                    };

                    return (
                      <TableCell
                        key={cell.id}
                        className={`h-9 ${getColumnWidth(
                          // Further reduced from h-10
                          cell.column.id
                        )} px-2 align-middle`}
                      >
                        <div className="truncate">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                {columns.map((column, colIndex) => {
                  // Apply same width logic for empty state cells
                  const getColumnWidth = (columnIndex: number) => {
                    const columnIds = [
                      "select",
                      "date",
                      "category",
                      "payee",
                      "account",
                      "amount",
                      "actions",
                    ];
                    const columnId = columnIds[columnIndex] || "default";
                    switch (columnId) {
                      case "select":
                        return "w-12";
                      case "date":
                        return "w-32";
                      case "category":
                        return "w-48";
                      case "payee":
                        return "w-56";
                      case "account":
                        return "w-40";
                      case "amount":
                        return "w-28";
                      case "actions":
                        return "w-16";
                      default:
                        return "w-32";
                    }
                  };

                  // Only show "No results" message in the middle column
                  if (colIndex === Math.floor(columns.length / 2)) {
                    return (
                      <TableCell
                        key={`empty-cell-${colIndex}`}
                        className={`h-9 ${getColumnWidth(
                          colIndex
                        )} px-2 align-middle text-center`}
                      >
                        No results.
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell
                      key={`empty-cell-${colIndex}`}
                      className={`h-9 ${getColumnWidth(
                        colIndex
                      )} px-2 align-middle`}
                    >
                      &nbsp;
                    </TableCell>
                  );
                })}
              </TableRow>
            )}
            {/* Render empty rows to fill space if needed, with fixed height */}
            {(!isUnifiedContainer || table.getRowModel().rows?.length === 0) &&
              emptyRowsCount > 0 &&
              Array.from({ length: emptyRowsCount }).map((_, index) => (
                <TableRow
                  key={`empty-${index}`}
                  className="h-9" // Further reduced from h-10
                >
                  {columns.map((column, colIndex) => {
                    // Apply same width logic for empty rows
                    const getColumnWidth = (columnIndex: number) => {
                      const columnIds = [
                        "select",
                        "date",
                        "category",
                        "payee",
                        "account",
                        "amount",
                        "actions",
                      ];
                      const columnId = columnIds[columnIndex] || "default";
                      switch (columnId) {
                        case "select":
                          return "w-12";
                        case "date":
                          return "w-32";
                        case "category":
                          return "w-48";
                        case "payee":
                          return "w-56";
                        case "account":
                          return "w-40";
                        case "amount":
                          return "w-28";
                        case "actions":
                          return "w-16";
                        default:
                          return "w-32";
                      }
                    };

                    return (
                      <TableCell
                        key={`empty-${index}-cell-${colIndex}`}
                        className={`h-9 ${getColumnWidth(
                          // Further reduced from h-10
                          colIndex
                        )} px-2 align-middle`}
                      >
                        &nbsp;
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>{" "}
      <div // Pagination Footer
        className={cn(
          "flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-purple-50/50 border-t border-blue-200/50 backdrop-blur-sm flex-shrink-0",
          !isUnifiedContainer && "rounded-b-lg",
          isUnifiedContainer && ""
        )}
      >
        {" "}
        <div className="text-sm text-blue-700 font-medium pl-9">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-9 px-3 cursor-pointer bg-white/80 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700 backdrop-blur-sm"
          >
            <ChevronLeft className="size-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-9 px-3 cursor-pointer bg-white/80 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700 backdrop-blur-sm"
          >
            Next
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>
    </>
  );

  if (isUnifiedContainer) {
    return (
      <div className="flex flex-col h-full max-h-full overflow-hidden scrollbar-hide">
        {tableContent}
      </div>
    );
  }

  // Fallback for non-unified (original structure)
  return (
    <Card className="border-none drop-shadow-sm h-full max-h-full flex flex-col overflow-hidden scrollbar-hide">
      <CardContent className="p-0 flex-1 flex flex-col min-h-0 overflow-hidden scrollbar-hide">
        {tableContent}
      </CardContent>
    </Card>
  );
}

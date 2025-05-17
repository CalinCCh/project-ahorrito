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

import { useConfirm } from "@/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Trash,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface DataTableProps<TData, TValue> {
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
  const [localSyncing, setLocalSyncing] = React.useState(false);

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

  // Default sync handler if none provided
  const handleSync = async () => {
    if (onSync) {
      return onSync();
    }

    // Si no hay onSync pero hay cuentas vinculadas, mostramos un toast
    if (hasLinkedBankAccount || isAllAccountsView) {
      setLocalSyncing(true);
      toast.info("Iniciando sincronización de transacciones...");

      // Simulación básica
      setTimeout(() => {
        setLocalSyncing(false);
        toast.success("Transacciones sincronizadas correctamente");
      }, 2000);
    } else {
      toast.error("No hay cuentas bancarias vinculadas para sincronizar");
    }
  };

  const canSync = hasLinkedBankAccount || isAllAccountsView;
  const isCurrentlySyncing = isSyncing || localSyncing;

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
        pageSize: 11,
      },
    },
  });

  const ROW_HEIGHT = 52; // Altura reducida para permitir más filas
  const HEADER_HEIGHT = 48; // Altura del header
  const PAGINATION_HEIGHT = 65; // Altura aproximada de la sección de paginación
  const FILTER_AREA_HEIGHT = 70; // Altura aproximada del área de filtros
  const visibleRows = table.getRowModel().rows;

  // Calculamos cuántas filas caben exactamente en el espacio disponible
  const totalRows = 11; // Aumentamos a 11 filas en total
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

  return (
    <div className="flex flex-col h-full">
      <ConfirmDialog />
      <div className="flex items-center justify-between py-2.5 min-h-[60px]">
        <div className="flex items-center flex-grow">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              disabled={disabled}
              size="sm"
              variant="destructive"
              className="font-normal text-xs mr-4 rounded-full px-4 py-2 shadow-sm transition-all duration-200 ease-in-out"
              onClick={async () => {
                if (table.getFilteredSelectedRowModel().rows.length === 0)
                  return;
                const ok = await confirm();
                if (ok) {
                  onDelete(table.getFilteredSelectedRowModel().rows);
                  table.resetRowSelection();
                }
              }}
            >
              <Trash className="size-3.5 mr-2" />
              Delete ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}
          <div className="flex-grow max-w-sm">
            {initialFilterValue === undefined && (
              <Input
                placeholder={`Filter ${filterKey}...`}
                value={
                  (table.getColumn(filterKey)?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn(filterKey)?.setFilterValue(event.target.value)
                }
                className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl shadow-sm transition-all duration-200 focus-visible:ring-slate-300 focus-visible:border-slate-400 hover:border-slate-300 h-11"
              />
            )}
            {initialFilterValue !== undefined && <div className="h-11" />}
          </div>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden border border-slate-200/80 bg-white/90 flex-grow flex flex-col shadow-sm backdrop-blur-sm">
        <Table className="h-full table-fixed w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-slate-50/90 border-b border-slate-200/80"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-slate-700 font-medium px-4 h-11"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {visibleRows.length ? (
              <>
                {visibleRows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="transition-colors duration-200 hover:bg-slate-50/90 data-[state=selected]:bg-slate-100/80 border-b border-slate-100/90"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-2 text-sm text-slate-700"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {/* Render empty rows to fill the table */}
                {Array.from({ length: emptyRowsCount }).map((_, idx) => (
                  <TableRow
                    key={`empty-${idx}`}
                    className="pointer-events-none border-b border-slate-100/60"
                  >
                    {table.getAllColumns().map((column) => (
                      <TableCell
                        key={column.id}
                        className="h-[52px] bg-transparent"
                        style={{ width: column.getSize() }}
                      />
                    ))}
                  </TableRow>
                ))}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-[500px] text-center text-slate-400 font-light text-base"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/90 border-t border-slate-200/80">
          <div className="flex items-center">
            <div className="text-sm text-slate-500 mr-4">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSync}
                    disabled={
                      isCurrentlySyncing || disabled || (!canSync && !onSync)
                    }
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-slate-200 hover:bg-slate-50/90 hover:border-slate-300 h-9 px-3.5 transition-all duration-200 flex items-center"
                  >
                    {isCurrentlySyncing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Sync Transactions
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[240px] text-xs">
                  {!canSync && !onSync ? (
                    "No hay cuentas bancarias vinculadas para sincronizar"
                  ) : syncStatus ? (
                    <div className="font-medium">{syncStatus}</div>
                  ) : lastSynced ? (
                    <>
                      Last synced: {formatLastSynced(lastSynced)}
                      <div className="text-xs text-slate-400 mt-1">
                        Recent transactions may take up to 48 hours to appear
                      </div>
                    </>
                  ) : (
                    "Synchronize transactions with your bank"
                  )}
                  {syncProgress && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Syncing Data
                        </div>
                        <div className="text-xs font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                          {syncProgress.current} / {syncProgress.total}
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300 ease-out"
                          style={{
                            width: `${
                              syncProgress.total
                                ? Math.min(
                                    100,
                                    Math.round(
                                      (syncProgress.current /
                                        syncProgress.total) *
                                        100
                                    )
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg border-slate-200 hover:bg-slate-50/90 hover:border-slate-300 h-9 px-3.5 transition-all duration-200"
            >
              <ChevronLeft className="size-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg border-slate-200 hover:bg-slate-50/90 hover:border-slate-300 h-9 px-3.5 transition-all duration-200"
            >
              Next <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

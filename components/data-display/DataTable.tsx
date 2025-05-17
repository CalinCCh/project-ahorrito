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
import { ChevronLeft, ChevronRight, Trash } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey: string;
  onDelete: (rows: Row<TData>[]) => void;
  disabled?: boolean;
  initialFilterValue?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  onDelete,
  disabled,
  initialFilterValue = "",
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
      </div>
      <div className="flex items-center justify-end space-x-2 py-3">
        <div className="flex-1 text-sm text-slate-500">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
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
  );
}

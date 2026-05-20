"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DataTableProps<TData, TValue> = {
  bulkActions?: ReactNode;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyDescription?: string;
  emptyTitle?: string;
  enablePagination?: boolean;
  filterPlaceholder?: string;
  mobileCard?: (row: TData, index: number) => ReactNode;
  pageSize?: number;
  rowSelection?: boolean;
  searchKey?: string;
  showToolbar?: boolean;
  tableMinWidth?: string;
};

export function createSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    cell: ({ row }) => (
      <input
        aria-label="Select row"
        checked={row.getIsSelected()}
        className="size-4 rounded border-border"
        onChange={row.getToggleSelectedHandler()}
        type="checkbox"
      />
    ),
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => (
      <input
        aria-label="Select all visible rows"
        checked={table.getIsAllPageRowsSelected()}
        className="size-4 rounded border-border"
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        type="checkbox"
      />
    ),
    id: "select",
  };
}

export function DataTable<TData, TValue>({
  bulkActions,
  columns,
  data,
  emptyDescription = "Try adjusting filters or adding a new record.",
  emptyTitle = "No records found",
  enablePagination = true,
  filterPlaceholder = "Search records",
  mobileCard,
  pageSize = 10,
  rowSelection: enableRowSelection = true,
  searchKey,
  showToolbar = true,
  tableMinWidth = "720px",
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  // TanStack Table intentionally returns non-memoizable helpers for table state.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(enablePagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      globalFilter,
      rowSelection,
      sorting,
    },
  });
  const selectedCount = table.getSelectedRowModel().rows.length;
  const rowCount = table.getFilteredRowModel().rows.length;
  const searchId = useMemo(() => `table-search-${searchKey ?? "global"}`, [searchKey]);

  return (
    <div className="space-y-4">
      {showToolbar ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-xs" htmlFor={searchId}>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              className="pl-9"
              id={searchId}
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder={filterPlaceholder}
              value={globalFilter}
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {selectedCount > 0 && bulkActions ? bulkActions : null}
            <p className="text-sm text-muted-foreground">
              {selectedCount > 0 ? `${selectedCount} selected · ` : ""}
              {rowCount} rows
            </p>
          </div>
        </div>
      ) : null}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {mobileCard ? (
          <div className="divide-y divide-border md:hidden">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, index) => (
                <div className="p-3" key={row.id}>
                  {mobileCard(row.original, index)}
                </div>
              ))
            ) : (
              <EmptyState description={emptyDescription} title={emptyTitle} />
            )}
          </div>
        ) : null}
        <div className={mobileCard ? "hidden overflow-x-auto md:block" : "overflow-x-auto"}>
          <table
            className="w-full border-collapse text-left text-sm"
            style={{ minWidth: tableMinWidth }}
          >
            <thead className="sticky top-0 z-10 bg-muted/85 text-muted-foreground backdrop-blur">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      className="h-11 px-4 text-xs font-semibold uppercase tracking-normal"
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          className={cn(
                            "inline-flex items-center gap-1 text-left",
                            header.column.getCanSort() && "hover:text-foreground",
                          )}
                          disabled={!header.column.getCanSort()}
                          onClick={header.column.getToggleSortingHandler()}
                          type="button"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getIsSorted()
                            ? header.column.getIsSorted() === "asc"
                              ? "↑"
                              : "↓"
                            : null}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr className="hover:bg-muted/50" key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td className="px-4 py-3 align-middle" key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      description={emptyDescription}
                      title={emptyTitle}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {enablePagination ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {Math.max(1, table.getPageCount())}
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              size="sm"
              variant="outline"
            >
              <ChevronLeft aria-hidden="true" />
              Previous
            </Button>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              size="sm"
              variant="outline"
            >
              Next
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

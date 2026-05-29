import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from "@tanstack/react-table";
import { EmptyState } from "../feedback/EmptyState";
import { LoadingState } from "../feedback/LoadingState";
import { ApiErrorAlert } from "../feedback/ApiErrorAlert";
import { Card } from "../ui/Card";
import { TablePagination } from "./TablePagination";

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  toolbar?: React.ReactNode;
};

export function DataTable<T>({ data, columns, isLoading, isError, error, totalCount, page, pageSize, onPageChange, toolbar }: DataTableProps<T>) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  if (isLoading) return <LoadingState />;
  if (isError) return <ApiErrorAlert error={error} />;

  return (
    <Card className="overflow-hidden">
      {toolbar}
      {data.length === 0 ? (
        <div className="p-4">
          <EmptyState />
        </div>
      ) : (
        <div>
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta as { className?: string } | undefined;
                    return (
                      <th key={header.id} className={`break-words px-3 py-3 font-bold ${meta?.className ?? ""}`}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as { className?: string } | undefined;
                    return (
                      <td key={cell.id} className={`break-words px-3 py-3 text-slate-700 ${meta?.className ?? ""}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <TablePagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={onPageChange} />
    </Card>
  );
}

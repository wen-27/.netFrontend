import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { DataTable } from "../../../shared/components/data-table/DataTable";
import { TableToolbar } from "../../../shared/components/data-table/TableToolbar";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { useTableQueryState } from "../../../shared/hooks/useTableQueryState";
import { Invoice } from "../../../shared/types/domain";
import { formatCurrency, formatDate } from "../../../shared/utils/formatters";
import { invoicesService } from "../services/invoicesService";

const columns: ColumnDef<Invoice>[] = [
  { header: "Número", accessorKey: "number" },
  { header: "Cliente", accessorKey: "customer" },
  { header: "Orden", accessorKey: "orderCode" },
  { header: "Fecha", cell: ({ row }) => formatDate(row.original.date) },
  { header: "Subtotal", cell: ({ row }) => formatCurrency(row.original.subtotal) },
  { header: "Impuestos", cell: ({ row }) => formatCurrency(row.original.taxes) },
  { header: "Total", cell: ({ row }) => formatCurrency(row.original.total) },
  { header: "Estado pago", cell: ({ row }) => <Badge tone={row.original.paymentStatus === "Pagada" ? "green" : "amber"}>{row.original.paymentStatus}</Badge> },
  { header: "Acciones", cell: ({ row }) => <Button variant="ghost" className="h-8 w-8 px-0" icon={<Eye className="h-4 w-4" />} onClick={() => location.assign(`/invoices/${row.original.id}`)} aria-label="Ver" /> },
];

export function InvoicesListPage({ payments = false }: { payments?: boolean }) {
  const table = useTableQueryState();
  const query = useQuery({
    queryKey: [payments ? "payments" : "invoices", table.page, table.pageSize, table.search],
    queryFn: () => (payments ? invoicesService.listPayments(table.params) : invoicesService.list(table.params)),
  });
  return (
    <>
      <PageHeader title={payments ? "Pagos" : "Facturación"} description="Facturas, estados de pago, detalle de servicios, repuestos e impuestos." />
      <DataTable data={query.data?.data ?? []} columns={columns} isLoading={query.isLoading} isError={query.isError} totalCount={query.data?.totalCount ?? 0} page={table.page} pageSize={table.pageSize} onPageChange={table.setPage} toolbar={<TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Buscar por cliente, fecha, estado o número" />} />
    </>
  );
}

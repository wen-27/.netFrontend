import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { DataTable } from "../../../shared/components/data-table/DataTable";
import { TableToolbar } from "../../../shared/components/data-table/TableToolbar";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { useTableQueryState } from "../../../shared/hooks/useTableQueryState";
import { Invoice } from "../../../shared/types/domain";
import { formatCurrency, formatDate } from "../../../shared/utils/formatters";
import { getPaymentStatusLabel, getPaymentStatusTone } from "../../../shared/utils/statusLabels";
import { useAuth } from "../../../shared/hooks/useAuth";
import { invoicesService } from "../services/invoicesService";

export function InvoicesListPage({ payments = false }: { payments?: boolean }) {
  const table = useTableQueryState();
  const role = useAuth((state) => state.role);
  const navigate = useNavigate();
  const invoiceColumns: ColumnDef<Invoice>[] = [
    { header: "Número", accessorKey: "number" },
    { header: "Cliente", accessorKey: "customer" },
    { header: "Orden", accessorKey: "orderCode" },
    { header: "Fecha", cell: ({ row }) => formatDate(row.original.date) },
    { header: "Subtotal", cell: ({ row }) => formatCurrency(row.original.subtotal) },
    { header: "Impuestos", cell: ({ row }) => formatCurrency(row.original.taxes) },
    { header: "Total", cell: ({ row }) => formatCurrency(row.original.total) },
    { header: "Estado de pago", cell: ({ row }) => <Badge tone={getPaymentStatusTone(row.original.paymentStatus)}>{getPaymentStatusLabel(row.original.paymentStatus)}</Badge> },
    { header: "Acciones", cell: ({ row }) => <Button variant="secondary" className="min-h-9 w-full px-2 text-xs leading-tight" icon={<Eye className="h-4 w-4 shrink-0" />} onClick={() => navigate(`/invoices/${row.original.id}`)}>Ver detalle</Button> },
  ];
  const paymentColumns: ColumnDef<Invoice>[] = [
    { header: "Fecha", cell: ({ row }) => formatDate(row.original.date) },
    { header: "Cliente", cell: ({ row }) => <div><p className="font-semibold text-slate-900">{row.original.customer}</p><p className="text-xs text-slate-500">{row.original.clientDocument || "Sin documento"}</p></div> },
    { header: "Vehículo", accessorKey: "vehicle" },
    { header: "Orden/Factura", accessorKey: "orderCode" },
    { header: "Referencia", accessorKey: "reference" },
    { header: "Método", accessorKey: "method" },
    { header: "Monto", cell: ({ row }) => formatCurrency(row.original.amount ?? row.original.subtotal) },
    { header: "Saldo", cell: ({ row }) => formatCurrency(row.original.balance ?? row.original.taxes) },
    { header: "Estado", cell: ({ row }) => <Badge tone={getPaymentStatusTone(row.original.paymentStatus)}>{getPaymentStatusLabel(row.original.paymentStatus)}</Badge> },
  ];
  const invoiceQueryFn = () => {
    if (payments) return invoicesService.listPayments(table.params);
    if (role === "Client") return invoicesService.listClient(table.params);
    if (role === "Receptionist" || role === "Admin") return invoicesService.listReception(table.params);
    return invoicesService.list(table.params);
  };
  const query = useQuery({
    queryKey: [payments ? "payments" : "invoices", role, table.page, table.pageSize, table.search],
    queryFn: invoiceQueryFn,
  });
  return (
    <>
      <PageHeader title={payments ? "Pagos" : "Facturación"} description="Facturas, estados de pago, detalle de servicios, repuestos e impuestos." />
      <DataTable data={query.data?.data ?? []} columns={payments ? paymentColumns : invoiceColumns} isLoading={query.isLoading} isError={query.isError} error={query.error} totalCount={query.data?.totalCount ?? 0} page={table.page} pageSize={table.pageSize} onPageChange={table.setPage} toolbar={<TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Buscar por cliente, fecha, estado o número" showFiltersButton={false} />} />
    </>
  );
}

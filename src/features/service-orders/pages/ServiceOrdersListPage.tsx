import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { DataTable } from "../../../shared/components/data-table/DataTable";
import { TableToolbar } from "../../../shared/components/data-table/TableToolbar";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { useTableQueryState } from "../../../shared/hooks/useTableQueryState";
import { formatCurrency, formatDate } from "../../../shared/utils/formatters";
import { ServiceOrder } from "../../../shared/types/domain";
import { serviceOrdersService } from "../services/serviceOrdersService";
import { OrderStatusBadge } from "../components/OrderStatusBadge";

const columns: ColumnDef<ServiceOrder>[] = [
  { header: "Código orden", accessorKey: "code" },
  { header: "Cliente", accessorKey: "customer" },
  { header: "Vehículo", accessorKey: "vehicle" },
  { header: "Estado", cell: ({ row }) => <OrderStatusBadge status={row.original.status} /> },
  { header: "Mecánico asignado", accessorKey: "mechanic" },
  { header: "Fecha ingreso", cell: ({ row }) => formatDate(row.original.entryDate) },
  { header: "Entrega estimada", cell: ({ row }) => formatDate(row.original.estimatedDelivery) },
  { header: "Total estimado", cell: ({ row }) => formatCurrency(row.original.estimatedTotal) },
  { header: "Acciones", cell: ({ row }) => <Button variant="ghost" className="h-8 w-8 px-0" icon={<Eye className="h-4 w-4" />} onClick={() => location.assign(`/service-orders/${row.original.id}`)} aria-label="Ver" /> },
];

export function ServiceOrdersListPage() {
  const table = useTableQueryState();
  const query = useQuery({ queryKey: ["service-orders", table.page, table.pageSize, table.search], queryFn: () => serviceOrdersService.list(table.params) });

  return (
    <>
      <PageHeader title="Órdenes de servicio" description="Control de ingreso, asignación, trabajo, repuestos, estado y facturación." actions={<Button icon={<Plus className="h-4 w-4" />}><Link to="/service-orders/new">Crear orden</Link></Button>} />
      <DataTable data={query.data?.data ?? []} columns={columns} isLoading={query.isLoading} isError={query.isError} totalCount={query.data?.totalCount ?? 0} page={table.page} pageSize={table.pageSize} onPageChange={table.setPage} toolbar={<TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Buscar por cliente, VIN, estado o mecánico" />} />
    </>
  );
}

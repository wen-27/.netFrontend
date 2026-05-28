import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { DataTable } from "../../../shared/components/data-table/DataTable";
import { TableToolbar } from "../../../shared/components/data-table/TableToolbar";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { useTableQueryState } from "../../../shared/hooks/useTableQueryState";
import { formatCurrency, formatDate } from "../../../shared/utils/formatters";
import { ServiceOrder } from "../../../shared/types/domain";
import { serviceOrdersService } from "../services/serviceOrdersService";
import { OrderStatusBadge } from "../components/OrderStatusBadge";

const statusOptions = [
  { label: "Todas activas", value: "" },
  { label: "Creada", value: "1" },
  { label: "Pendiente de asignación", value: "2" },
  { label: "Asignada", value: "3" },
  { label: "En progreso", value: "4" },
  { label: "Pendiente de aprobación del cliente", value: "5" },
  { label: "Esperando pago", value: "6" },
  { label: "Pago en revisión", value: "7" },
  { label: "Lista para entrega", value: "9" },
];

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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ statusId: "", customer: "", vehicle: "", orderCode: "", mechanic: "" });
  const search = [table.search, filters.customer, filters.orderCode, filters.mechanic].filter(Boolean).join(" ");
  const queryParams = {
    ...table.params,
    search,
    statusId: filters.statusId ? Number(filters.statusId) : undefined,
    vin: filters.vehicle || undefined,
  };
  const query = useQuery({ queryKey: ["service-orders", table.page, table.pageSize, search, filters.statusId, filters.vehicle], queryFn: () => serviceOrdersService.list(queryParams) });
  const visibleOrders = useMemo(() => {
    const activeStatuses = new Set(["Created", "PendingAssignment", "Assigned", "InProgress", "PendingClientApproval", "WaitingForPayment", "PaymentUnderReview", "ReadyForDelivery"]);
    return (query.data?.data ?? []).filter((order) => {
      if (!activeStatuses.has(String(order.status))) return false;
      const matchesCustomer = !filters.customer || order.customer.toLowerCase().includes(filters.customer.toLowerCase());
      const matchesVehicle = !filters.vehicle || order.vehicle.toLowerCase().includes(filters.vehicle.toLowerCase());
      const matchesOrderCode = !filters.orderCode || order.code.toLowerCase().includes(filters.orderCode.toLowerCase());
      const matchesMechanic = !filters.mechanic || order.mechanic.toLowerCase().includes(filters.mechanic.toLowerCase());
      return matchesCustomer && matchesVehicle && matchesOrderCode && matchesMechanic;
    });
  }, [filters, query.data?.data]);

  return (
    <>
      <PageHeader title="Órdenes de servicio" description="Órdenes activas, en progreso o pendientes del taller." actions={<Button icon={<Plus className="h-4 w-4" />}><Link to="/service-orders/new">Crear orden</Link></Button>} />
      {showFilters ? (
        <Card className="mb-4 grid gap-3 p-4 md:grid-cols-5">
          <label className="text-sm font-semibold text-slate-700">Estado<select className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={filters.statusId} onChange={(event) => setFilters((current) => ({ ...current, statusId: event.target.value }))}>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700">Cliente<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={filters.customer} onChange={(event) => setFilters((current) => ({ ...current, customer: event.target.value }))} /></label>
          <label className="text-sm font-semibold text-slate-700">Vehículo<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={filters.vehicle} onChange={(event) => setFilters((current) => ({ ...current, vehicle: event.target.value }))} /></label>
          <label className="text-sm font-semibold text-slate-700">Código orden<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={filters.orderCode} onChange={(event) => setFilters((current) => ({ ...current, orderCode: event.target.value }))} /></label>
          <label className="text-sm font-semibold text-slate-700">Mecánico<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={filters.mechanic} onChange={(event) => setFilters((current) => ({ ...current, mechanic: event.target.value }))} /></label>
        </Card>
      ) : null}
      <DataTable data={visibleOrders} columns={columns} isLoading={query.isLoading} isError={query.isError} error={query.error} totalCount={query.data?.totalCount ?? visibleOrders.length} page={table.page} pageSize={table.pageSize} onPageChange={table.setPage} toolbar={<TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Buscar por cliente, vehículo, estado, orden o mecánico" onFiltersClick={() => setShowFilters((current) => !current)} />} />
    </>
  );
}

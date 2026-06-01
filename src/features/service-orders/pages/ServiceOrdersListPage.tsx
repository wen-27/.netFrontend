import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Modal } from "../../../shared/components/ui/Modal";
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
  { label: "Esperando pago", value: "6" },
  { label: "Pago en revisión", value: "7" },
  { label: "Lista para entrega", value: "9" },
];

const activeStatuses = new Set(["Created", "PendingAssignment", "Assigned", "InProgress", "WaitingForPayment", "PaymentUnderReview", "ReadyForDelivery"]);

function ServiceOrdersTablePage({ pendingClientApprovalOnly = false, createdOnly = false }: { pendingClientApprovalOnly?: boolean; createdOnly?: boolean }) {
  const table = useTableQueryState();
  const queryClient = useQueryClient();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/reception") ? "/reception/service-orders" : "/service-orders";
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ statusId: "", customer: "", vehicle: "", orderCode: "", mechanic: "" });
  const [orderToComplete, setOrderToComplete] = useState<ServiceOrder | null>(null);
  const [workPerformed, setWorkPerformed] = useState("");
  const search = [table.search, filters.customer, filters.orderCode, filters.mechanic].filter(Boolean).join(" ");
  const queryParams = {
    ...table.params,
    search,
    statusId: createdOnly ? 1 : pendingClientApprovalOnly ? 5 : filters.statusId ? Number(filters.statusId) : undefined,
    vin: filters.vehicle || undefined,
  };
  const query = useQuery({ queryKey: ["service-orders", table.page, table.pageSize, search, filters.statusId, filters.vehicle, pendingClientApprovalOnly, createdOnly], queryFn: () => serviceOrdersService.list(queryParams) });
  const completeMutation = useMutation({
    mutationFn: () => {
      if (!orderToComplete) throw new Error("No hay una orden seleccionada.");
      return serviceOrdersService.completeMechanicOrder(orderToComplete.id, { workPerformed: workPerformed.trim() });
    },
    onSuccess: async () => {
      setOrderToComplete(null);
      setWorkPerformed("");
      await queryClient.invalidateQueries({ queryKey: ["service-orders"] });
    },
  });
  const columns: ColumnDef<ServiceOrder>[] = [
    { header: "Código orden", accessorKey: "code" },
    { header: "Cliente", accessorKey: "customer" },
    { header: "Vehículo", accessorKey: "vehicle" },
    { header: "Estado", cell: ({ row }) => <OrderStatusBadge status={row.original.status} /> },
    { header: "Mecánico asignado", accessorKey: "mechanic" },
    { header: "Fecha ingreso", cell: ({ row }) => formatDate(row.original.entryDate) },
    { header: "Entrega estimada", cell: ({ row }) => formatDate(row.original.estimatedDelivery) },
    { header: "Total estimado", cell: ({ row }) => formatCurrency(row.original.estimatedTotal) },
    {
      header: "Acciones",
      meta: { className: "w-28 whitespace-nowrap text-right" },
      cell: ({ row }) => (
        <div className="flex flex-col items-end gap-2">
          <Link to={createdOnly ? `/mechanic/chief-orders/${row.original.id}` : `${basePath}/${row.original.id}`}>
            <Button variant="secondary" className="min-h-9 w-24 whitespace-nowrap px-2 text-xs" icon={<Eye className="h-4 w-4" />} aria-label="Ver detalle">Ver</Button>
          </Link>
          {createdOnly ? (
            <Button
              className="min-h-9 w-24 whitespace-nowrap px-2 text-xs"
              isLoading={completeMutation.isPending}
              onClick={() => {
                setOrderToComplete(row.original);
                setWorkPerformed(row.original.workPerformed ?? "");
              }}
            >
              Completar
            </Button>
          ) : null}
        </div>
      ),
    },
  ];
  const visibleOrders = useMemo(() => {
    return (query.data?.data ?? []).filter((order) => {
      if (createdOnly) {
        if (String(order.status) !== "Created") return false;
      } else if (pendingClientApprovalOnly) {
        if (String(order.status) !== "PendingClientApproval") return false;
      } else if (!activeStatuses.has(String(order.status))) {
        return false;
      }
      const matchesCustomer = !filters.customer || order.customer.toLowerCase().includes(filters.customer.toLowerCase());
      const matchesVehicle = !filters.vehicle || order.vehicle.toLowerCase().includes(filters.vehicle.toLowerCase());
      const matchesOrderCode = !filters.orderCode || order.code.toLowerCase().includes(filters.orderCode.toLowerCase());
      const matchesMechanic = !filters.mechanic || order.mechanic.toLowerCase().includes(filters.mechanic.toLowerCase());
      return matchesCustomer && matchesVehicle && matchesOrderCode && matchesMechanic;
    });
  }, [createdOnly, filters, pendingClientApprovalOnly, query.data?.data]);

  return (
    <>
      <PageHeader
        title={createdOnly ? "Órdenes del jefe" : pendingClientApprovalOnly ? "Órdenes pendientes de aprobación" : "Órdenes activas"}
        description={createdOnly ? "Órdenes vacías creadas por el Jefe de Taller para diagnóstico." : pendingClientApprovalOnly ? "Órdenes completas que esperan aprobación del cliente." : "Órdenes que el taller tiene activas para seguimiento y ejecución."}
        actions={pendingClientApprovalOnly || createdOnly ? undefined : <Button icon={<Plus className="h-4 w-4" />}><Link to={`${basePath}/new`}>Crear orden</Link></Button>}
      />
      {showFilters && !pendingClientApprovalOnly ? (
        <Card className="mb-4 grid gap-3 p-4 md:grid-cols-5">
          <label className="text-sm font-semibold text-slate-700">Estado<select className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={filters.statusId} onChange={(event) => setFilters((current) => ({ ...current, statusId: event.target.value }))}>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700">Cliente<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={filters.customer} onChange={(event) => setFilters((current) => ({ ...current, customer: event.target.value }))} /></label>
          <label className="text-sm font-semibold text-slate-700">Vehículo<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={filters.vehicle} onChange={(event) => setFilters((current) => ({ ...current, vehicle: event.target.value }))} /></label>
          <label className="text-sm font-semibold text-slate-700">Código orden<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={filters.orderCode} onChange={(event) => setFilters((current) => ({ ...current, orderCode: event.target.value }))} /></label>
          <label className="text-sm font-semibold text-slate-700">Mecánico<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={filters.mechanic} onChange={(event) => setFilters((current) => ({ ...current, mechanic: event.target.value }))} /></label>
        </Card>
      ) : null}
      <DataTable data={visibleOrders} columns={columns} isLoading={query.isLoading} isError={query.isError} error={query.error} totalCount={query.data?.totalCount ?? visibleOrders.length} page={table.page} pageSize={table.pageSize} onPageChange={table.setPage} toolbar={<TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Buscar por cliente, vehículo, estado, orden o mecánico" onFiltersClick={() => setShowFilters((current) => !current)} />} />
      <Modal
        open={Boolean(orderToComplete)}
        title={orderToComplete ? `Completar ${orderToComplete.code}` : "Completar orden"}
        onClose={() => {
          if (!completeMutation.isPending) {
            setOrderToComplete(null);
            setWorkPerformed("");
          }
        }}
      >
        <div className="grid gap-4">
          <p className="text-sm text-slate-600">Registra el trabajo realizado antes de enviar la orden a aprobación.</p>
          {completeMutation.error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">No se pudo completar la orden.</p> : null}
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Trabajo realizado</span>
            <textarea
              className="mt-1 min-h-32 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={workPerformed}
              onChange={(event) => setWorkPerformed(event.target.value)}
              placeholder="Describe el diagnóstico, revisión o trabajo completado."
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              disabled={completeMutation.isPending}
              onClick={() => {
                setOrderToComplete(null);
                setWorkPerformed("");
              }}
            >
              Cancelar
            </Button>
            <Button disabled={!workPerformed.trim()} isLoading={completeMutation.isPending} onClick={() => completeMutation.mutate()}>
              Completar orden
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function ServiceOrdersListPage() {
  return <ServiceOrdersTablePage />;
}

export function ServiceOrdersPendingApprovalPage() {
  return <ServiceOrdersTablePage pendingClientApprovalOnly />;
}

export function ServiceOrdersCreatedPage() {
  return <ServiceOrdersTablePage createdOnly />;
}

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ApiErrorAlert } from "../../../shared/components/feedback/ApiErrorAlert";
import { LoadingState } from "../../../shared/components/feedback/LoadingState";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { formatCurrency, formatDate } from "../../../shared/utils/formatters";
import { serviceOrdersService } from "../services/serviceOrdersService";
import { OrderStatusBadge } from "../components/OrderStatusBadge";

const orderServiceLabels: Record<string, string> = {
  Pending: "Pendiente",
  Approved: "Aprobado",
  InProgress: "En progreso",
  WaitingForParts: "Esperando repuestos",
  Completed: "Completado",
  Rejected: "Rechazado",
  Invoiced: "Facturado",
};

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function ServiceOrderDetailPage() {
  const { id = "" } = useParams();
  const orderQuery = useQuery({
    queryKey: ["service-order", id],
    queryFn: () => serviceOrdersService.getById(id),
    enabled: Boolean(id),
  });
  const servicesQuery = useQuery({
    queryKey: ["service-order-services", id],
    queryFn: () => serviceOrdersService.listOrderServicesByOrder(id),
    enabled: Boolean(id),
  });

  if (orderQuery.isLoading || servicesQuery.isLoading) return <LoadingState />;
  if (orderQuery.isError) return <ApiErrorAlert error={orderQuery.error} action="No se pudo cargar la orden de servicio" />;
  if (servicesQuery.isError) return <ApiErrorAlert error={servicesQuery.error} action="No se pudieron cargar los servicios de la orden" />;

  const order = orderQuery.data;
  const services = servicesQuery.data ?? [];

  if (!order) return <Card className="p-5 text-sm text-slate-600">No se encontró la orden.</Card>;

  return (
    <>
      <PageHeader
        title={order.code}
        description={`${order.vehicle} · ${order.customer}`}
        actions={<Link to="/service-orders"><Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>Regresar</Button></Link>}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <DetailItem label="Orden" value={order.code} />
              <DetailItem label="Cliente" value={order.customer} />
              <DetailItem label="Vehículo" value={order.vehicle} />
              <DetailItem label="Mecánico asignado" value={order.mechanic} />
              <DetailItem label="Fecha de ingreso" value={formatDate(order.entryDate)} />
              <DetailItem label="Entrega estimada" value={formatDate(order.estimatedDelivery)} />
              <DetailItem label="Total estimado" value={formatCurrency(order.estimatedTotal)} />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Estado</p>
                <div className="mt-1"><OrderStatusBadge status={String(order.status)} /></div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-bold text-slate-900">Servicios registrados</h2>
            <div className="mt-4 space-y-3">
              {services.length === 0 ? <p className="text-sm text-slate-600">Esta orden no tiene servicios registrados.</p> : null}
              {services.map((service) => (
                <div key={service.id} className="rounded-md border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-950">{service.name}</h3>
                      {service.workPerformed ? <p className="mt-1 text-sm text-slate-600">{service.workPerformed}</p> : null}
                    </div>
                    <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                      {orderServiceLabels[service.status] ?? service.status}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                    <DetailItem label="Servicio" value={formatCurrency(service.price)} />
                    <DetailItem label="Mano de obra" value={formatCurrency(service.laborCost)} />
                    <DetailItem label="Total" value={formatCurrency(service.total)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-slate-400">Resumen</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(order.estimatedTotal)}</p>
          <p className="mt-2 text-sm text-slate-600">{services.length} servicios registrados en esta orden.</p>
        </Card>
      </div>
    </>
  );
}

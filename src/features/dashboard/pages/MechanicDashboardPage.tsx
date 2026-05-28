import { CheckCircle2, ClipboardList, FileText, Wrench, XCircle } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge";
import { Card } from "../../../shared/components/ui/Card";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { MetricCard } from "../../../shared/components/layout/MetricCard";
import { mockServiceOrders } from "../../../shared/utils/mockData";

export function MechanicDashboardPage() {
  return (
    <>
      <PageHeader title="Mi dashboard" description="Órdenes asignadas, servicios pendientes y solicitudes técnicas enviadas al Jefe de Taller." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Órdenes asignadas" value="8" tone="blue" icon={ClipboardList} />
        <MetricCard label="Órdenes en progreso" value="3" tone="indigo" icon={Wrench} />
        <MetricCard label="Servicios pendientes" value="5" tone="amber" icon={FileText} />
        <MetricCard label="Solicitudes enviadas" value="7" tone="blue" icon={FileText} />
        <MetricCard label="Solicitudes rechazadas" value="2" tone="red" icon={XCircle} />
        <MetricCard label="Solicitudes aprobadas" value="4" tone="green" icon={CheckCircle2} />
      </div>
      <Card className="mt-5 p-5">
        <h2 className="font-bold text-slate-900">Prioridad de trabajo</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {mockServiceOrders.map((order) => (
            <div key={order.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{order.code}</p>
                <p className="text-sm text-slate-500">{order.vehicle} · Entrega {order.estimatedDelivery}</p>
              </div>
              <Badge tone={order.status === "Completada" ? "green" : "amber"}>{order.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

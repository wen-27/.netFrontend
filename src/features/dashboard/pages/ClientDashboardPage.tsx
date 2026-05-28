import { CalendarClock, Car, ClipboardList, CreditCard, History, MessageSquare, Wrench } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge";
import { Card } from "../../../shared/components/ui/Card";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { MetricCard } from "../../../shared/components/layout/MetricCard";
import { mockInvoices, mockVehicles } from "../../../shared/utils/mockData";
import { getPaymentStatusLabel, getPaymentStatusTone } from "../../../shared/utils/statusLabels";

export function ClientDashboardPage() {
  return (
    <>
      <PageHeader title="Mi dashboard" description="Órdenes activas, aprobaciones, facturas pendientes, pagos y mensajes del taller." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Órdenes activas" value="2" tone="blue" icon={Car} />
        <MetricCard label="Órdenes pendientes" value="1" tone="amber" icon={CalendarClock} />
        <MetricCard label="Servicios por aprobar" value="2" tone="indigo" icon={Wrench} />
        <MetricCard label="Facturas pendientes" value="1" tone="red" icon={CreditCard} />
        <MetricCard label="Historial de órdenes" value="14" tone="green" icon={History} />
        <MetricCard label="Mensajes del Jefe de Taller" value="3" tone="blue" icon={MessageSquare} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-bold text-slate-900">Mis órdenes activas</h2>
          <div className="mt-4 space-y-3">
            {mockVehicles.slice(0, 2).map((vehicle) => (
              <div key={vehicle.id} className="rounded-md border border-slate-200 p-3">
                <p className="font-semibold text-slate-900">{vehicle.brand} {vehicle.model}</p>
                <p className="text-sm text-slate-500">Orden activa · {vehicle.mileage.toLocaleString("es-CO")} km</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold text-slate-900">Facturas pendientes</h2>
          <div className="mt-4 space-y-3">
            {mockInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                <span className="font-semibold text-slate-900">{invoice.number}</span>
                <Badge tone={getPaymentStatusTone(invoice.paymentStatus)}>{getPaymentStatusLabel(invoice.paymentStatus)}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

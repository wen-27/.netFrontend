import { Car, ClipboardList, Receipt, Timer } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge";
import { Card } from "../../../shared/components/ui/Card";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { MetricCard } from "../../../shared/components/layout/MetricCard";
import { mockInvoices, mockVehicles } from "../../../shared/utils/mockData";

export function ClientDashboardPage() {
  return (
    <>
      <PageHeader title="Mi dashboard" description="Estado de tus vehículos, órdenes, facturas y pagos asociados." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Vehículos registrados" value="2" tone="blue" icon={Car} />
        <MetricCard label="Órdenes activas" value="1" tone="amber" icon={ClipboardList} />
        <MetricCard label="Facturas pendientes" value="1" tone="red" icon={Receipt} />
        <MetricCard label="Última visita" value="24 may" tone="green" icon={Timer} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-bold text-slate-900">Mis vehículos</h2>
          <div className="mt-4 space-y-3">
            {mockVehicles.slice(0, 2).map((vehicle) => (
              <div key={vehicle.id} className="rounded-md border border-slate-200 p-3">
                <p className="font-semibold text-slate-900">{vehicle.brand} {vehicle.model}</p>
                <p className="text-sm text-slate-500">{vehicle.vin} · {vehicle.mileage.toLocaleString("es-CO")} km</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold text-slate-900">Facturas recientes</h2>
          <div className="mt-4 space-y-3">
            {mockInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                <span className="font-semibold text-slate-900">{invoice.number}</span>
                <Badge tone={invoice.paymentStatus === "Pagada" ? "green" : "amber"}>{invoice.paymentStatus}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

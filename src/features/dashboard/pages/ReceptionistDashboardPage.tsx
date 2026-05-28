import { CalendarClock, Car, ClipboardPlus, CreditCard, FileText, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { MetricCard } from "../../../shared/components/layout/MetricCard";

export function ReceptionistDashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard de recepción" description="Clientes, vehículos, órdenes de servicio, facturas, pagos y entregas." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Órdenes creadas hoy" value="6" tone="blue" icon={ClipboardPlus} />
        <MetricCard label="Vehículos ingresados" value="5" tone="green" icon={Car} />
        <MetricCard label="Clientes nuevos" value="3" tone="indigo" icon={UserPlus} />
        <MetricCard label="Facturas pendientes" value="9" tone="amber" icon={FileText} />
        <MetricCard label="Pagos por verificar" value="5" tone="amber" icon={CreditCard} />
        <MetricCard label="Próximas a entrega" value="7" tone="green" icon={CalendarClock} />
      </div>
      <Card className="mt-5 p-5">
        <h2 className="font-bold text-slate-900">Acciones rápidas</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button><Link to="/persons/new">Crear cliente</Link></Button>
          <Button variant="secondary"><Link to="/vehicles/new">Registrar vehículo</Link></Button>
          <Button variant="success"><Link to="/service-orders/new">Crear orden</Link></Button>
          <Button variant="secondary"><Link to="/reception/payments-verification">Verificar pagos</Link></Button>
        </div>
      </Card>
    </>
  );
}

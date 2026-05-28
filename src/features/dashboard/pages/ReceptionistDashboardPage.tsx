import { CalendarClock, Car, ClipboardPlus, CreditCard, FileText, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { MetricCard } from "../../../shared/components/layout/MetricCard";
import { invoicesService } from "../../invoices/services/invoicesService";
import { operationsService } from "../../operations/services/operationsService";
import { personsService } from "../../persons/services/personsService";
import { serviceOrdersService } from "../../service-orders/services/serviceOrdersService";
import { vehiclesService } from "../../vehicles/services/vehiclesService";

export function ReceptionistDashboardPage() {
  const params = { pageNumber: 1, pageSize: 50 };
  const { data: orders } = useQuery({ queryKey: ["dashboard-reception-orders"], queryFn: () => serviceOrdersService.list(params) });
  const { data: vehicles } = useQuery({ queryKey: ["dashboard-reception-vehicles"], queryFn: () => vehiclesService.list(params) });
  const { data: persons } = useQuery({ queryKey: ["dashboard-reception-persons"], queryFn: () => personsService.list(params) });
  const { data: invoices } = useQuery({ queryKey: ["dashboard-reception-invoices"], queryFn: () => invoicesService.listReception(params) });
  const { data: payments = [] } = useQuery({ queryKey: ["dashboard-reception-payments"], queryFn: operationsService.getPaymentsPendingReceptionVerification });
  const orderItems = orders?.data ?? [];
  const invoiceItems = invoices?.data ?? [];
  const pendingInvoices = invoiceItems.filter((invoice) => ["PendingPayment", "PendingReceptionVerification", "Pending"].includes(String(invoice.paymentStatus)));
  const upcomingDeliveries = orderItems.filter((order) => ["ReadyForDelivery", "PaymentUnderReview", "Paid"].includes(String(order.status)));
  return (
    <>
      <PageHeader title="Dashboard de recepción" description="Clientes, vehículos, órdenes de servicio, facturas, pagos y entregas." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Órdenes cargadas" value={String(orders?.totalCount ?? 0)} tone="blue" icon={ClipboardPlus} />
        <MetricCard label="Vehículos ingresados" value={String(vehicles?.totalCount ?? 0)} tone="green" icon={Car} />
        <MetricCard label="Clientes cargados" value={String(persons?.totalCount ?? 0)} tone="indigo" icon={UserPlus} />
        <MetricCard label="Facturas pendientes" value={String(pendingInvoices.length)} tone="amber" icon={FileText} />
        <MetricCard label="Pagos por verificar" value={String(payments.length)} tone="amber" icon={CreditCard} />
        <MetricCard label="Próximas a entrega" value={String(upcomingDeliveries.length)} tone="green" icon={CalendarClock} />
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

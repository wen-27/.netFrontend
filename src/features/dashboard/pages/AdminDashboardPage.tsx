import { Activity, Car, ClipboardList, CreditCard, Receipt, ShieldCheck, UserCheck, UserCog, Users, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ApiErrorAlert } from "../../../shared/components/feedback/ApiErrorAlert";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { MetricCard } from "../../../shared/components/layout/MetricCard";
import { formatCurrency, formatDateTime } from "../../../shared/utils/formatters";
import { getPaymentStatusLabel, getPaymentStatusTone } from "../../../shared/utils/statusLabels";
import { adminDashboardService } from "../services/adminDashboardService";

function orderTone(status: string): "green" | "amber" | "red" | "blue" | "slate" {
  if (["Delivered", "Completed", "ReadyForDelivery"].includes(status)) return "green";
  if (["Cancelled", "Voided"].includes(status)) return "red";
  if (["PendingClientApproval", "WaitingForPayment", "PaymentUnderReview"].includes(status)) return "amber";
  return "blue";
}

export function AdminDashboardPage() {
  const { data, isError, error } = useQuery({ queryKey: ["admin-dashboard"], queryFn: adminDashboardService.get });
  const totals = data?.totals;

  return (
    <>
      <PageHeader
        title="Dashboard administrativo"
        description="Vista global de usuarios, clientes, vehículos, órdenes, pagos y facturación."
        actions={(
          <>
            <Link to="/users"><Button variant="secondary">Usuarios</Button></Link>
            <Link to="/service-orders"><Button>Órdenes</Button></Link>
          </>
        )}
      />
      {isError ? <ApiErrorAlert error={error} action="No se pudo cargar el dashboard administrativo" className="mb-4" /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Clientes registrados" value={String(totals?.clients ?? 0)} tone="blue" icon={Users} />
        <MetricCard label="Vehículos registrados" value={String(totals?.vehicles ?? 0)} tone="green" icon={Car} />
        <MetricCard label="Usuarios activos" value={String(totals?.activeUsers ?? 0)} tone="indigo" icon={UserCheck} />
        <MetricCard label="Mecánicos" value={String(totals?.mechanics ?? 0)} tone="blue" icon={Wrench} />
        <MetricCard label="Recepcionistas" value={String(totals?.receptionists ?? 0)} tone="indigo" icon={UserCog} />
        <MetricCard label="Órdenes activas" value={String(totals?.activeOrders ?? 0)} tone="blue" icon={ClipboardList} />
        <MetricCard label="Órdenes pendientes" value={String(totals?.pendingOrders ?? 0)} tone="amber" icon={Activity} />
        <MetricCard label="Órdenes completadas" value={String(totals?.completedOrders ?? 0)} tone="green" icon={ShieldCheck} />
        <MetricCard label="Pagos por verificar" value={String(totals?.pendingPayments ?? 0)} tone="amber" icon={CreditCard} />
        <MetricCard label="Pagos verificados" value={String(totals?.verifiedPayments ?? 0)} tone="green" icon={CreditCard} />
        <MetricCard label="Facturas pendientes" value={String(totals?.pendingInvoices ?? 0)} tone="red" icon={Receipt} />
        <MetricCard label="Jefes de taller" value={String(totals?.workshopChiefs ?? 0)} tone="indigo" icon={UserCog} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-900">Últimas órdenes creadas</h2>
            <Link className="text-sm font-semibold text-blue-600 hover:text-blue-700" to="/service-orders">Ver órdenes</Link>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {(data?.recentOrders ?? []).length === 0 ? <p className="py-4 text-sm font-semibold text-slate-500">No hay órdenes recientes.</p> : null}
            {(data?.recentOrders ?? []).map((order) => (
              <div key={order.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{order.code} · {order.customer}</p>
                  <p className="text-sm text-slate-500">{order.vehicle} · {formatDateTime(order.entryDate)} · {formatCurrency(order.estimatedTotal)}</p>
                </div>
                <Badge tone={orderTone(order.status)}>{order.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-900">Últimos pagos</h2>
            <Link className="text-sm font-semibold text-blue-600 hover:text-blue-700" to="/payments">Ver pagos</Link>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {(data?.recentPayments ?? []).length === 0 ? <p className="py-4 text-sm font-semibold text-slate-500">No hay pagos recientes.</p> : null}
            {(data?.recentPayments ?? []).map((payment) => (
              <div key={payment.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{payment.customer} · {payment.orderCode}</p>
                  <p className="text-sm text-slate-500">{payment.vehicle} · {payment.method} · {formatDateTime(payment.date)}</p>
                </div>
                <div className="flex items-center gap-2 md:flex-col md:items-end">
                  <span className="font-bold text-slate-950">{formatCurrency(payment.amount)}</span>
                  <Badge tone={getPaymentStatusTone(payment.status)}>{getPaymentStatusLabel(payment.status)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

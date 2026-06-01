import { Car, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { MetricCard } from "../../../shared/components/layout/MetricCard";
import { receptionService } from "../../reception/services/receptionService";

function isPendingPayment(status: string) {
  return ["PendingReceptionVerification", "Pending", "Pendiente"].includes(status);
}

function isVerifiedPayment(status: string) {
  return ["Approved", "Verified", "Paid", "Aprobado", "Verificado", "Pagado"].includes(status);
}

export function ReceptionistDashboardPage() {
  const { data: dashboard } = useQuery({ queryKey: ["dashboard-reception"], queryFn: receptionService.dashboard });
  const { data: payments = [] } = useQuery({ queryKey: ["dashboard-reception-payments"], queryFn: () => receptionService.payments({}) });
  const { data: recentCustomers } = useQuery({ queryKey: ["dashboard-reception-recent-customers"], queryFn: () => receptionService.customers({ pageNumber: 1, pageSize: 5 }) });
  const pendingPayments = payments.filter((payment) => isPendingPayment(payment.status));
  const verifiedPayments = payments.filter((payment) => isVerifiedPayment(payment.status));
  const pendingPaymentCount = payments.length ? pendingPayments.length : Number(dashboard?.pendingPayments ?? 0);
  const verifiedPaymentCount = payments.length ? verifiedPayments.length : Number(dashboard?.approvedPayments ?? 0);
  const totalReviewedPayments = pendingPaymentCount + verifiedPaymentCount;
  const verifiedPercent = totalReviewedPayments ? Math.round((verifiedPaymentCount / totalReviewedPayments) * 100) : 0;
  const donutBackground = totalReviewedPayments
    ? `conic-gradient(#059669 0 ${verifiedPercent}%, #f59e0b ${verifiedPercent}% 100%)`
    : "conic-gradient(#e2e8f0 0 100%)";
  return (
    <>
      <PageHeader
        title="Dashboard de recepción"
        description="Clientes, vehículos, facturas, pagos y entregas."
        actions={(
          <>
            <Button><Link to="/reception/customers/new">Crear cliente</Link></Button>
            <Button variant="secondary"><Link to="/reception/vehicles/new">Registrar vehículo</Link></Button>
            <Button variant="secondary"><Link to="/reception/payments-verification">Verificar pagos</Link></Button>
          </>
        )}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard label="Vehículos ingresados" value={String(dashboard?.vehicles ?? 0)} tone="green" icon={Car} />
        <MetricCard label="Pagos por verificar" value={String(pendingPaymentCount)} tone="amber" icon={CreditCard} />
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-900">Clientes creados recientemente</h2>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {(recentCustomers?.data ?? []).length === 0 ? (
              <p className="py-6 text-sm font-semibold text-slate-500">No hay clientes recientes para mostrar.</p>
            ) : null}
            {(recentCustomers?.data ?? []).map((customer) => (
              <div key={customer.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{customer.fullName}</p>
                  <p className="text-sm text-slate-500">{customer.documentType} {customer.documentNumber}</p>
                </div>
                <div className="text-sm text-slate-500 sm:text-right">
                  <p>{customer.primaryPhone || "Sin teléfono"}</p>
                  <p>{customer.vehiclesCount} vehículo{customer.vehiclesCount === 1 ? "" : "s"}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold text-slate-900">Estado de pagos</h2>
          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-center xl:flex-col">
            <div className="relative grid h-44 w-44 place-items-center rounded-full" style={{ background: donutBackground }}>
              <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center shadow-inner">
                <div>
                  <p className="text-3xl font-bold text-slate-950">{verifiedPercent}%</p>
                  <p className="text-xs font-semibold uppercase text-slate-500">verificados</p>
                </div>
              </div>
            </div>
            <div className="grid w-full gap-3 sm:max-w-xs">
              <div className="flex items-center justify-between rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2">
                <span className="text-sm font-semibold text-emerald-800">Verificados</span>
                <span className="text-lg font-bold text-emerald-900">{verifiedPaymentCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-amber-100 bg-amber-50 px-3 py-2">
                <span className="text-sm font-semibold text-amber-800">Por verificar</span>
                <span className="text-lg font-bold text-amber-900">{pendingPaymentCount}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

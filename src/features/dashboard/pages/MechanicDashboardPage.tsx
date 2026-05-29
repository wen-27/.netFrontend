import { useMemo, useState } from "react";
import { CheckCircle2, FileText, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "../../../shared/components/ui/Badge";
import { Card } from "../../../shared/components/ui/Card";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { MetricCard } from "../../../shared/components/layout/MetricCard";
import { operationsService } from "../../operations/services/operationsService";
import { TablePagination } from "../../../shared/components/data-table/TablePagination";
import { AdditionalRequest, MechanicDiagnostic } from "../../../shared/types/domain";
import { serviceOrdersService } from "../../service-orders/services/serviceOrdersService";

type DashboardStatusFilter = "all" | "pending" | "approved" | "rejected";

const pageSize = 4;

const statusOptions: { value: DashboardStatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "approved", label: "Aprobado" },
  { value: "rejected", label: "Rechazado" },
];

function requestMatchesFilter(request: AdditionalRequest, filter: DashboardStatusFilter) {
  if (filter === "all") return true;
  if (filter === "pending") return request.status === "PendingWorkshopChiefApproval";
  if (filter === "rejected") return request.status === "RejectedByWorkshopChief" || request.status === "RejectedByClient";
  return ["PendingClientApproval", "ApprovedByClient", "AddedToOrder"].includes(request.status);
}

function diagnosticMatchesFilter(diagnostic: MechanicDiagnostic, filter: DashboardStatusFilter) {
  if (filter === "all") return true;
  if (filter === "pending") return diagnostic.status === "PendingWorkshopChiefApproval";
  if (filter === "approved") return diagnostic.status === "Approved";
  return diagnostic.status === "Rejected";
}

function requestStatusLabel(status: AdditionalRequest["status"]) {
  if (status === "PendingWorkshopChiefApproval") return "Pendiente jefe";
  if (status === "RejectedByWorkshopChief" || status === "RejectedByClient") return "Rechazado";
  if (status === "PendingClientApproval") return "Aprobado por jefe";
  if (status === "ApprovedByClient" || status === "AddedToOrder") return "Aprobado";
  return status;
}

function diagnosticStatusLabel(status: MechanicDiagnostic["status"]) {
  if (status === "PendingWorkshopChiefApproval") return "Pendiente jefe";
  if (status === "Approved") return "Aprobado";
  return "Rechazado";
}

function statusTone(status: AdditionalRequest["status"] | MechanicDiagnostic["status"]) {
  if (status === "Rejected" || status === "RejectedByWorkshopChief" || status === "RejectedByClient") return "red";
  if (status === "Approved" || status === "ApprovedByClient" || status === "AddedToOrder" || status === "PendingClientApproval") return "green";
  return "amber";
}

function getPagedItems<T>(items: T[], page: number) {
  return items.slice((page - 1) * pageSize, page * pageSize);
}

export function MechanicDashboardPage() {
  const { data: requests = [] } = useQuery({ queryKey: ["dashboard-mechanic-requests"], queryFn: operationsService.getMechanicRequests });
  const { data: diagnostics = [] } = useQuery({ queryKey: ["dashboard-mechanic-diagnostics"], queryFn: operationsService.getMechanicDiagnostics });
  const { data: ordersPage } = useQuery({
    queryKey: ["dashboard-mechanic-diagnostic-orders"],
    queryFn: () => serviceOrdersService.list({ pageNumber: 1, pageSize: 500 }),
  });
  const [requestFilter, setRequestFilter] = useState<DashboardStatusFilter>("all");
  const [diagnosticFilter, setDiagnosticFilter] = useState<DashboardStatusFilter>("all");
  const [requestPage, setRequestPage] = useState(1);
  const [diagnosticPage, setDiagnosticPage] = useState(1);

  const diagnosticOrderRows: MechanicDiagnostic[] = (ordersPage?.data ?? [])
    .filter((order) => String(order.generalDescription ?? "").toLowerCase().includes("problema reportado"))
    .filter((order) => !diagnostics.some((diagnostic) => diagnostic.serviceOrderId === order.id))
    .map((order) => ({
      id: `order-${order.id}`,
      serviceOrderId: order.id,
      orderCode: order.code,
      customer: order.customer,
      vehicle: order.vehicle,
      mechanicPersonId: "",
      mechanic: order.mechanic,
      status: "PendingWorkshopChiefApproval",
      findings: order.generalDescription || order.workPerformed || "Orden de diagnóstico creada.",
      recommendedWork: "Pendiente de registrar diagnóstico.",
      submittedAt: order.entryDate,
    }));
  const dashboardDiagnostics = [...diagnosticOrderRows, ...diagnostics];
  const rejectedRequests = requests.filter((request) => request.status === "RejectedByWorkshopChief" || request.status === "RejectedByClient");
  const approvedRequests = requests.filter((request) => request.status === "PendingClientApproval" || request.status === "ApprovedByClient" || request.status === "AddedToOrder");
  const pendingDiagnostics = dashboardDiagnostics.filter((diagnostic) => diagnostic.status === "PendingWorkshopChiefApproval");
  const approvedDiagnostics = dashboardDiagnostics.filter((diagnostic) => diagnostic.status === "Approved");
  const filteredRequests = useMemo(() => requests.filter((request) => requestMatchesFilter(request, requestFilter)), [requests, requestFilter]);
  const filteredDiagnostics = useMemo(() => dashboardDiagnostics.filter((diagnostic) => diagnosticMatchesFilter(diagnostic, diagnosticFilter)), [dashboardDiagnostics, diagnosticFilter]);
  const requestCurrentPage = Math.min(requestPage, Math.max(1, Math.ceil(filteredRequests.length / pageSize)));
  const diagnosticCurrentPage = Math.min(diagnosticPage, Math.max(1, Math.ceil(filteredDiagnostics.length / pageSize)));
  const pagedRequests = getPagedItems(filteredRequests, requestCurrentPage);
  const pagedDiagnostics = getPagedItems(filteredDiagnostics, diagnosticCurrentPage);

  return (
    <>
      <PageHeader title="Mi dashboard" description="Solicitudes técnicas y diagnósticos enviados al Jefe de Taller." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Solicitudes enviadas" value={String(requests.length)} tone="blue" icon={FileText} />
        <MetricCard label="Diagnósticos enviados" value={String(dashboardDiagnostics.length)} tone="indigo" icon={FileText} />
        <MetricCard label="Diagnósticos pendientes" value={String(pendingDiagnostics.length)} tone="amber" icon={FileText} />
        <MetricCard label="Diagnósticos aprobados" value={String(approvedDiagnostics.length)} tone="green" icon={CheckCircle2} />
        <MetricCard label="Solicitudes rechazadas" value={String(rejectedRequests.length)} tone="red" icon={XCircle} />
        <MetricCard label="Solicitudes aprobadas" value={String(approvedRequests.length)} tone="green" icon={CheckCircle2} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <DashboardTableHeader title="Solicitudes" filter={requestFilter} onFilterChange={(value) => { setRequestFilter(value); setRequestPage(1); }} />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Orden</th>
                  <th className="px-4 py-3">Solicitud</th>
                  <th className="px-4 py-3">Prioridad</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedRequests.length === 0 ? <tr><td className="px-4 py-5 font-semibold text-slate-500" colSpan={4}>No hay solicitudes para mostrar.</td></tr> : null}
                {pagedRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-4 py-3 font-bold text-slate-900">{request.orderCode}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{request.suggestedService}</p>
                      <p className="mt-1 text-xs text-slate-500">{request.requestType === "Service" ? "Servicio" : request.suggestedPart ?? "Repuesto"}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{request.priority}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone(request.status)}>{requestStatusLabel(request.status)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination page={requestCurrentPage} pageSize={pageSize} totalCount={filteredRequests.length} onPageChange={setRequestPage} />
        </Card>

        <Card className="overflow-hidden">
          <DashboardTableHeader title="Diagnósticos" filter={diagnosticFilter} onFilterChange={(value) => { setDiagnosticFilter(value); setDiagnosticPage(1); }} />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Orden</th>
                  <th className="px-4 py-3">Vehículo</th>
                  <th className="px-4 py-3">Hallazgos</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedDiagnostics.length === 0 ? <tr><td className="px-4 py-5 font-semibold text-slate-500" colSpan={4}>No hay diagnósticos para mostrar.</td></tr> : null}
                {pagedDiagnostics.map((diagnostic) => (
                  <tr key={diagnostic.id}>
                    <td className="px-4 py-3 font-bold text-slate-900">{diagnostic.orderCode}</td>
                    <td className="px-4 py-3 text-slate-600">{diagnostic.vehicle}</td>
                    <td className="px-4 py-3">
                      <p className="line-clamp-2 font-semibold text-slate-800">{diagnostic.findings}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{diagnostic.recommendedWork}</p>
                    </td>
                    <td className="px-4 py-3"><Badge tone={statusTone(diagnostic.status)}>{diagnosticStatusLabel(diagnostic.status)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination page={diagnosticCurrentPage} pageSize={pageSize} totalCount={filteredDiagnostics.length} onPageChange={setDiagnosticPage} />
        </Card>
      </div>
    </>
  );
}

function DashboardTableHeader({
  title,
  filter,
  onFilterChange,
}: {
  title: string;
  filter: DashboardStatusFilter;
  onFilterChange: (value: DashboardStatusFilter) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="font-bold text-slate-900">{title}</h2>
      <select
        value={filter}
        onChange={(event) => onFilterChange(event.target.value as DashboardStatusFilter)}
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

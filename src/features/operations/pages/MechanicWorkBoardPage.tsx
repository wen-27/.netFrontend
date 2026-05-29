import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { ApiErrorAlert } from "../../../shared/components/feedback/ApiErrorAlert";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Modal } from "../../../shared/components/ui/Modal";
import { formatCurrency, formatDate } from "../../../shared/utils/formatters";
import { AdditionalRequest, OrderServiceItem, ServiceOrder, WorkshopService } from "../../../shared/types/domain";
import { createAdditionalRequest, getMechanicOrders, getWorkshopServices, updateMechanicOrderServiceStatus } from "../services/operationsService";

type WorkColumn = {
  key: "assigned" | "started" | "inProgress" | "completed";
  title: string;
  statuses: string[];
  next?: string;
  nextLabel?: string;
  tone: "slate" | "blue" | "indigo" | "green";
};

type WorkCard = {
  id: string;
  order: ServiceOrder;
  service: OrderServiceItem;
};

const columns: WorkColumn[] = [
  { key: "assigned", title: "Asignadas", statuses: ["Pending"], next: "Approved", nextLabel: "Iniciar", tone: "slate" },
  { key: "started", title: "Iniciadas", statuses: ["Approved"], next: "InProgress", nextLabel: "Pasar a proceso", tone: "blue" },
  { key: "inProgress", title: "En proceso", statuses: ["InProgress", "WaitingForParts"], next: "Completed", nextLabel: "Terminar", tone: "indigo" },
  { key: "completed", title: "Terminadas", statuses: ["Completed", "Invoiced"], tone: "green" },
];

const titles = {
  electricity: "Mecánico de electricidad",
  maintenance: "Mecánico de mantenimiento",
  brakes: "Mecánico de frenos",
};

function getOrderServices(order: ServiceOrder): OrderServiceItem[] {
  const source = order as ServiceOrder & { services?: OrderServiceItem[]; orderServices?: OrderServiceItem[] };
  return source.services ?? source.orderServices ?? [];
}

function flattenWorks(orders: ServiceOrder[]) {
  return orders.flatMap((order) =>
    getOrderServices(order).map((service) => ({
      id: `${order.id}-${service.id}`,
      order,
      service,
    })),
  );
}

export function MechanicWorkBoardPage({ specialty }: { specialty: keyof typeof titles }) {
  const queryClient = useQueryClient();
  const [requestWork, setRequestWork] = useState<WorkCard | null>(null);
  const query = useQuery({ queryKey: ["mechanic-work-board"], queryFn: getMechanicOrders });
  const servicesQuery = useQuery({ queryKey: ["mechanic-workshop-services"], queryFn: getWorkshopServices });
  const works = useMemo(() => flattenWorks(query.data ?? []), [query.data]);
  const statusMutation = useMutation({
    mutationFn: ({ serviceId, status }: { serviceId: string; status: string }) => updateMechanicOrderServiceStatus(serviceId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["mechanic-work-board"] });
      await queryClient.invalidateQueries({ queryKey: ["mechanic-orders"] });
    },
  });

  return (
    <>
      <PageHeader title={titles[specialty]} description="Trabajos asignados directamente al mecánico autenticado." />
      {query.isError ? <ApiErrorAlert error={query.error} action="No se pudieron cargar los trabajos asignados" className="mb-4" /> : null}
      {statusMutation.error ? <ApiErrorAlert error={statusMutation.error} action="No se pudo actualizar el estado del trabajo" className="mb-4" /> : null}
      <div className="grid gap-4 xl:grid-cols-4">
        {columns.map((column) => {
          const columnWorks = works.filter((work) => column.statuses.includes(String(work.service.status)));
          return (
            <section key={column.key} className="min-h-[360px] rounded-md border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h2 className="font-bold text-slate-900">{column.title}</h2>
                <Badge tone={column.tone}>{columnWorks.length}</Badge>
              </div>
              <div className="space-y-3 p-3">
                {columnWorks.length === 0 ? <p className="rounded-md border border-dashed border-slate-200 bg-white p-4 text-sm font-semibold text-slate-500">Sin trabajos.</p> : null}
                {columnWorks.map((work) => (
                  <WorkCardItem
                    key={work.id}
                    work={work}
                    nextStatus={column.next}
                    nextLabel={column.nextLabel}
                    isUpdating={statusMutation.isPending}
                    onMove={() => column.next && statusMutation.mutate({ serviceId: work.service.id, status: column.next })}
                    onRequest={() => setRequestWork(work)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <AdditionalWorkRequestModal
        work={requestWork}
        services={servicesQuery.data ?? []}
        onClose={() => setRequestWork(null)}
        onCreated={async () => {
          setRequestWork(null);
          await queryClient.invalidateQueries({ queryKey: ["mechanic-requests"] });
        }}
      />
    </>
  );
}

function WorkCardItem({
  work,
  nextStatus,
  nextLabel,
  isUpdating,
  onMove,
  onRequest,
}: {
  work: WorkCard;
  nextStatus?: string;
  nextLabel?: string;
  isUpdating: boolean;
  onMove: () => void;
  onRequest: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-blue-700">{work.order.code}</p>
          <h3 className="mt-1 font-bold text-slate-950">{work.service.name}</h3>
        </div>
        <Badge tone="slate">{work.service.status}</Badge>
      </div>
      <div className="mt-3 space-y-1 text-sm text-slate-600">
        <p><strong>Cliente:</strong> {work.order.customer}</p>
        <p><strong>Vehículo:</strong> {work.order.vehicle}</p>
        <p><strong>Entrega:</strong> {formatDate(work.order.estimatedDelivery)}</p>
        <p><strong>Valor:</strong> {formatCurrency(work.service.price)}</p>
        {work.service.workPerformed ? <p>{work.service.workPerformed}</p> : null}
      </div>
      <div className="mt-4 grid gap-2">
        {nextStatus ? <Button className="w-full" isLoading={isUpdating} onClick={onMove}>{nextLabel}</Button> : null}
        <Button variant="secondary" className="w-full" onClick={onRequest}>Solicitar al jefe</Button>
      </div>
    </Card>
  );
}

function AdditionalWorkRequestModal({
  work,
  services,
  onClose,
  onCreated,
}: {
  work: WorkCard | null;
  services: WorkshopService[];
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}) {
  const [workshopServiceId, setWorkshopServiceId] = useState("");
  const [finding, setFinding] = useState("");
  const [observations, setObservations] = useState("");
  const mutation = useMutation({
    mutationFn: () => {
      if (!work) throw new Error("No hay trabajo seleccionado.");
      return createAdditionalRequest({
        orderId: work.order.id,
        requestType: "Service",
        workshopServiceId,
        problemDescription: finding,
        technicalJustification: `Trabajo relacionado: ${work.service.name}`,
        observations,
      } as Partial<AdditionalRequest> & { workshopServiceId: string });
    },
    onSuccess: onCreated,
  });

  if (!work) return null;

  return (
    <Modal open={Boolean(work)} title={`Solicitud para ${work.order.code}`} onClose={onClose}>
      <div className="grid gap-4">
        {mutation.error ? <ApiErrorAlert error={mutation.error} action="No se pudo enviar la solicitud" /> : null}
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Servicio adicional sugerido</span>
          <select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={workshopServiceId} onChange={(event) => setWorkshopServiceId(event.target.value)}>
            <option value="">Seleccionar</option>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name} · {formatCurrency(service.finalPrice)}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Descripción del hallazgo</span>
          <textarea className="mt-1 min-h-28 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={finding} onChange={(event) => setFinding(event.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Observaciones</span>
          <textarea className="mt-1 min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={observations} onChange={(event) => setObservations(event.target.value)} />
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" disabled={mutation.isPending} onClick={onClose}>Cancelar</Button>
          <Button disabled={!workshopServiceId || !finding.trim()} isLoading={mutation.isPending} icon={<Send className="h-4 w-4" />} onClick={() => mutation.mutate()}>Enviar solicitud</Button>
        </div>
      </div>
    </Modal>
  );
}

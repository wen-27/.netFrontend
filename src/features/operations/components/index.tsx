import { CheckCircle2, PackagePlus, Send, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Drawer } from "../../../shared/components/ui/Drawer";
import { Modal } from "../../../shared/components/ui/Modal";
import { ApiErrorAlert } from "../../../shared/components/feedback/ApiErrorAlert";
import { FormInput } from "../../../shared/components/forms/FormInput";
import { FormSelect } from "../../../shared/components/forms/FormSelect";
import { FormTextarea } from "../../../shared/components/forms/FormTextarea";
import { formatCurrency, formatDateTime } from "../../../shared/utils/formatters";
import { getPaymentStatusLabel, getPaymentStatusTone } from "../../../shared/utils/statusLabels";
import {
  AdditionalRequest,
  AdditionalRequestStatus,
  ClientPayment,
  OrderServiceItem,
  OrderServiceStatus,
  ServiceOrder,
  ServiceOrderStatus,
  StockSubmission,
  StockSubmissionStatus,
  WarehouseProduct,
  WorkshopService,
  WorkshopServicePart,
  WorkshopServiceStatus,
} from "../../../shared/types/domain";
import {
  calculateProductSalePrice,
  calculateWorkshopServicePrice,
  createStockSubmission,
  createAdditionalRequest,
  getPartBrandsForStock,
  getPartCategoriesForStock,
  getSuppliersForStock,
  getAvailableWorkshopParts,
  getWorkshopServices,
  sendStockSubmissionForReview,
} from "../services/operationsService";
import { serviceOrdersService } from "../../service-orders/services/serviceOrdersService";

const statusTone = {
  Draft: "slate",
  PendingWorkshopChiefApproval: "amber",
  RejectedByWorkshopChief: "red",
  PendingClientApproval: "blue",
  RejectedByClient: "red",
  ApprovedByClient: "green",
  AddedToOrder: "green",
  Pending: "amber",
  Approved: "green",
  InProgress: "blue",
  WaitingForParts: "amber",
  Completed: "green",
  Rejected: "red",
  Invoiced: "indigo",
  Created: "slate",
  PendingAssignment: "amber",
  Assigned: "blue",
  WaitingForPayment: "amber",
  PaymentUnderReview: "blue",
  Paid: "green",
  ReadyForDelivery: "green",
  Delivered: "green",
  Cancelled: "red",
  PendingInventoryManagerReview: "amber",
  RejectedByInventoryManager: "red",
  ApprovedByInventoryManager: "green",
  AddedToInventory: "green",
  Active: "green",
  Inactive: "slate",
} as const;

const additionalRequestLabels: Record<AdditionalRequestStatus, string> = {
  Draft: "Borrador",
  PendingWorkshopChiefApproval: "Pendiente de revisión técnica",
  RejectedByWorkshopChief: "Rechazada por jefe de taller",
  PendingClientApproval: "Pendiente por cliente",
  RejectedByClient: "Rechazada por cliente",
  ApprovedByClient: "Aprobada por cliente",
  AddedToOrder: "Añadida a la orden",
};

const orderServiceLabels: Record<OrderServiceStatus, string> = {
  Pending: "Pendiente",
  Approved: "Aprobado",
  InProgress: "En progreso",
  WaitingForParts: "Esperando repuestos",
  Completed: "Completado",
  Rejected: "Rechazado",
  Invoiced: "Facturado",
};

const serviceOrderLabels: Record<ServiceOrderStatus, string> = {
  Created: "Creada",
  PendingAssignment: "Pendiente de asignación",
  Assigned: "Asignada",
  InProgress: "En progreso",
  PendingClientApproval: "Pendiente de aprobación del cliente",
  WaitingForPayment: "Esperando pago",
  PaymentUnderReview: "Pago en revisión",
  Paid: "Pagada",
  ReadyForDelivery: "Lista para entrega",
  Delivered: "Entregada",
  Cancelled: "Cancelada",
};

const stockSubmissionLabels: Record<StockSubmissionStatus, string> = {
  Draft: "Borrador",
  PendingInventoryManagerReview: "Pendiente de revisión de almacén",
  RejectedByInventoryManager: "Rechazado por almacén",
  ApprovedByInventoryManager: "Aprobado por almacén",
  AddedToInventory: "Añadido al inventario",
};

export function AdditionalRequestStatusBadge({ status }: { status: AdditionalRequestStatus }) {
  return <Badge tone={statusTone[status]}>{additionalRequestLabels[status]}</Badge>;
}

export function OrderServiceStatusBadge({ status }: { status: OrderServiceStatus }) {
  return <Badge tone={statusTone[status]}>{orderServiceLabels[status]}</Badge>;
}

export function ServiceOrderStatusBadge({ status }: { status: ServiceOrderStatus | string }) {
  if (status in serviceOrderLabels) return <Badge tone={statusTone[status as ServiceOrderStatus]}>{serviceOrderLabels[status as ServiceOrderStatus]}</Badge>;
  return <Badge tone="slate">{status}</Badge>;
}

export function StockSubmissionStatusBadge({ status }: { status: StockSubmissionStatus }) {
  return <Badge tone={statusTone[status]}>{stockSubmissionLabels[status]}</Badge>;
}

export function WorkshopServiceStatusBadge({ status }: { status: WorkshopServiceStatus }) {
  return <Badge tone={statusTone[status]}>{status === "Active" ? "Activo" : "Inactivo"}</Badge>;
}

const mechanicRequestSchema = z.object({
  orderId: z.string().min(1),
  suggestedService: z.string().optional(),
  workshopServiceId: z.string().optional(),
  partId: z.string().optional(),
  requestType: z.enum(["Service", "Part"]),
  problemDescription: z.string().min(1),
  technicalJustification: z.string().min(1),
  suggestedPart: z.string().optional(),
  quantity: z.coerce.number().optional(),
  observations: z.string().optional(),
}).superRefine((value, context) => {
  if (value.requestType === "Service" && !value.workshopServiceId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["workshopServiceId"], message: "Selecciona un servicio." });
  }
  if (value.requestType === "Part" && !value.partId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["partId"], message: "Selecciona un repuesto." });
  }
  if (value.requestType === "Part" && !value.quantity) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["quantity"], message: "Indica la cantidad." });
  }
});

type MechanicRequestForm = z.infer<typeof mechanicRequestSchema>;

export function MechanicRequestModal({
  open,
  onClose,
  defaultOrderId = "1",
}: {
  open: boolean;
  onClose: () => void;
  defaultOrderId?: string;
}) {
  const queryClient = useQueryClient();
  const [orderSearch, setOrderSearch] = useState("");
  const ordersQuery = useQuery({ queryKey: ["mechanic-request-orders"], queryFn: () => serviceOrdersService.list({ pageNumber: 1, pageSize: 500 }), enabled: open });
  const servicesQuery = useQuery({ queryKey: ["mechanic-request-workshop-services"], queryFn: getWorkshopServices, enabled: open });
  const partsQuery = useQuery({ queryKey: ["mechanic-request-parts"], queryFn: getAvailableWorkshopParts, enabled: open });
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<MechanicRequestForm>({
    resolver: zodResolver(mechanicRequestSchema),
    defaultValues: { orderId: defaultOrderId, requestType: "Service" },
  });
  const requestType = watch("requestType");
  const orders = ordersQuery.data?.data ?? [];
  const filteredOrders = orders.filter((order) =>
    [order.code, order.customer, order.vehicle].join(" ").toLowerCase().includes(orderSearch.toLowerCase()),
  );
  const requestMutation = useMutation({
    mutationFn: createAdditionalRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["mechanic-requests"] });
      reset({ orderId: defaultOrderId, requestType: "Service" });
      onClose();
    },
  });

  useEffect(() => {
    if (open) reset({ orderId: defaultOrderId, requestType: "Service" });
  }, [defaultOrderId, open, reset]);

  return (
    <Modal open={open} title="Solicitar servicio o repuesto adicional" onClose={onClose}>
      <form className="grid gap-4" onSubmit={handleSubmit((values) => requestMutation.mutate(values))}>
        {requestMutation.error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">No se pudo crear la solicitud.</p> : null}
        <FormInput label="Buscar orden" value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Ej: OT-2026-0001" />
        <FormSelect
          label="Orden relacionada"
          error={errors.orderId}
          registration={register("orderId")}
          options={filteredOrders.map((order) => ({ label: `${order.code} · ${order.customer} · ${order.vehicle}`, value: order.id }))}
        />
        <FormSelect label="Tipo de solicitud" options={[{ label: "Servicio", value: "Service" }, { label: "Repuesto", value: "Part" }]} registration={register("requestType")} />
        {requestType === "Service" ? (
          <FormSelect
            label="Servicio solicitado"
            error={errors.workshopServiceId}
            registration={register("workshopServiceId")}
            options={(servicesQuery.data ?? []).map((service) => ({ label: `${service.name} · ${formatCurrency(service.finalPrice)}`, value: service.id }))}
          />
        ) : null}
        <FormTextarea label="Descripción del problema encontrado" error={errors.problemDescription} registration={register("problemDescription")} />
        <FormTextarea label="Justificación técnica" error={errors.technicalJustification} registration={register("technicalJustification")} />
        {requestType === "Part" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <FormSelect
              label="Repuesto solicitado"
              error={errors.partId}
              registration={register("partId")}
              options={(partsQuery.data ?? []).map((part) => ({ label: `${part.name} · Stock ${part.quantity}`, value: part.id }))}
            />
            <FormInput label="Cantidad" error={errors.quantity} type="number" min={1} registration={register("quantity")} />
          </div>
        ) : null}
        <FormTextarea label="Observaciones" registration={register("observations")} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={requestMutation.isPending} icon={<Send className="h-4 w-4" />}>Enviar al jefe de taller</Button>
        </div>
      </form>
    </Modal>
  );
}

export function WorkshopChiefCommentBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">Comentario del Jefe de Taller</span>
      <textarea
        className="mt-1 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function WorkshopChiefRequestDrawer({
  open,
  request,
  onClose,
  onApprove,
  onReject,
  isWorking,
}: {
  open: boolean;
  request?: AdditionalRequest;
  onClose: () => void;
  onApprove?: (request: AdditionalRequest, comment: string) => void;
  onReject?: (request: AdditionalRequest, comment: string) => void;
  isWorking?: boolean;
}) {
  const [comment, setComment] = useState(request?.workshopChiefComment ?? "");
  useEffect(() => {
    setComment(request?.workshopChiefComment ?? "");
  }, [request?.id, request?.workshopChiefComment]);
  if (!request) return null;
  const canReview = request.status === "PendingWorkshopChiefApproval";

  return (
    <Drawer open={open} title="Detalle de solicitud técnica" onClose={onClose}>
      <div className="space-y-5">
        <SummaryGrid rows={[
          ["Orden", request.orderCode],
          ["Cliente", request.customer],
          ["Vehículo", request.vehicle],
          ["Mecánico", request.mechanic],
          ["Solicitud", request.requestType === "Service" ? "Servicio" : "Repuesto"],
        ]} />
        <Card className="p-4">
          <h3 className="font-bold text-slate-900">Comentario técnico</h3>
          <p className="mt-2 text-sm text-slate-600">{request.problemDescription}</p>
          <p className="mt-2 text-sm text-slate-600">{request.technicalJustification}</p>
        </Card>
        <SummaryGrid rows={[
          ["Servicio/repuesto solicitado", request.suggestedPart ? `${request.suggestedService} · ${request.suggestedPart}` : request.suggestedService],
          ["Estado actual", additionalRequestLabels[request.status]],
          ["Precio estimado", formatCurrency(request.estimatedPrice)],
        ]} />
        <Card className="p-4">
          <h3 className="font-bold text-slate-900">Historial de decisiones</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {request.decisionHistory.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Card>
        {canReview ? (
          <>
            <WorkshopChiefCommentBox value={comment} onChange={setComment} />
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" isLoading={isWorking} onClick={() => onReject?.(request, comment)}>Denegar solicitud</Button>
              <Button isLoading={isWorking} onClick={() => onApprove?.(request, comment)}>Aprobar y enviar al cliente</Button>
            </div>
          </>
        ) : (
          <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-600">
            Esta solicitud ya fue revisada por el jefe de taller. Solo está disponible para consulta.
          </p>
        )}
      </div>
    </Drawer>
  );
}

export function ClientApprovalCard({ request }: { request: AdditionalRequest }) {
  const [message, setMessage] = useState("");
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">{request.orderCode} · {request.vehicle}</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">{request.suggestedService}</h3>
          <p className="mt-2 text-sm text-slate-600">{request.problemDescription}</p>
        </div>
        <AdditionalRequestStatusBadge status={request.status} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Info label="Repuesto sugerido" value={request.suggestedPart ?? "No aplica"} />
        <Info label="Precio estimado" value={formatCurrency(request.estimatedPrice)} />
        <Info label="Comentario del mecánico" value={request.technicalJustification} />
        <Info label="Comentario del Jefe de Taller" value={request.workshopChiefComment ?? "Sin comentario"} />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-700">Impacto en total de orden: +{formatCurrency(request.estimatedPrice)}</p>
      {message ? <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{message}</p> : null}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" icon={<XCircle className="h-4 w-4" />} onClick={() => setMessage("Servicio rechazado. No se añadirá a tu orden.")}>Rechazar</Button>
        <Button icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => setMessage("Servicio aprobado. Se añadirá a tu orden activa.")}>Aprobar</Button>
      </div>
    </Card>
  );
}

export function ClientApprovalActionCard({
  request,
  onApprove,
  onReject,
  isLoading,
}: {
  request: AdditionalRequest;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isLoading?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">{request.orderCode} · {request.vehicle}</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">{request.suggestedService}</h3>
          <p className="mt-2 text-sm text-slate-600">{request.problemDescription}</p>
        </div>
        <AdditionalRequestStatusBadge status={request.status} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Info label="Repuesto sugerido" value={request.suggestedPart ?? "No aplica"} />
        <Info label="Precio estimado" value={formatCurrency(request.estimatedPrice)} />
        <Info label="Comentario del mecánico" value={request.technicalJustification} />
        <Info label="Comentario del Jefe de Taller" value={request.workshopChiefComment ?? "Sin comentario"} />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-700">Impacto en total de orden: +{formatCurrency(request.estimatedPrice)}</p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" disabled={isLoading} icon={<XCircle className="h-4 w-4" />} onClick={() => onReject(request.id)}>Rechazar</Button>
        <Button disabled={isLoading} icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => onApprove(request.id)}>Aprobar</Button>
      </div>
    </Card>
  );
}

export function ClientOrderStatusCard({ order }: { order: ServiceOrder }) {
  const paymentText = order.paymentMessage ?? getOrderPaymentAlert(order).title;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-950">{order.code}</h3>
          <p className="mt-1 text-sm text-slate-500">{order.vehicle}</p>
        </div>
        <ServiceOrderStatusBadge status={order.status} />
      </div>
      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <Info label="Fecha de ingreso" value={order.entryDate} />
        <Info label="Entrega estimada" value={order.estimatedDelivery || "Por asignar"} />
        <Info label="Estado de pago" value={paymentText} />
        <Info label="Total estimado" value={formatCurrency(order.estimatedTotal)} />
      </div>
    </Card>
  );
}

export function OrderPaymentAlert({ order }: { order: ServiceOrder }) {
  if (!order.paymentStatus) return null;
  const alert = getOrderPaymentAlert(order);
  const toneClass = {
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    red: "border-red-200 bg-red-50 text-red-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
  }[alert.tone];

  return (
    <Card className={`${toneClass} p-4`}>
      <strong>{alert.title}</strong>
      <p>{alert.message}</p>
      {order.paymentStatus === "Approved" && order.deliveryDate ? <p className="mt-1 font-semibold">Fecha de entrega: {order.deliveryDate}</p> : null}
    </Card>
  );
}

function getOrderPaymentAlert(order: ServiceOrder) {
  if (order.paymentStatus === "PendingReceptionVerification") {
    return {
      title: "Pago enviado",
      message: order.paymentMessage ?? "Tu pago está pendiente de verificación por recepción.",
      tone: "blue" as const,
    };
  }
  if (order.paymentStatus === "PendingPayment") {
    return {
      title: "Pendiente de pago",
      message: order.paymentMessage ?? "Puedes registrar el pago de esta factura.",
      tone: "amber" as const,
    };
  }
  if (order.paymentStatus === "Approved") {
    return {
      title: "Pago exitoso",
      message: order.paymentMessage ?? "Tu pago fue verificado por recepción.",
      tone: "green" as const,
    };
  }
  if (order.paymentStatus === "Rejected") {
    return {
      title: "Pago rechazado",
      message: order.paymentMessage ?? "Puedes intentarlo nuevamente o comunicarte con recepción.",
      tone: "red" as const,
    };
  }
  return {
    title: "Sin pago registrado",
    message: "",
    tone: "blue" as const,
  };
}

export function OrderServicesTimeline({ services }: { services: OrderServiceItem[] }) {
  if (services.length === 0) {
    return <Card className="p-5 text-sm text-slate-600">Esta orden no tiene servicios registrados.</Card>;
  }

  return (
    <div className="space-y-3">
      {services.map((service, index) => (
        <div key={service.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{index + 1}</span>
            {index < services.length - 1 ? <span className="h-full w-px bg-slate-200" /> : null}
          </div>
          <Card className="flex-1 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900">{service.name}</h3>
              <OrderServiceStatusBadge status={service.status} />
            </div>
            <p className="mt-2 text-sm text-slate-500">Repuestos usados: {(service.parts ?? []).join(", ") || "Sin repuestos"}</p>
            {service.workPerformed ? <p className="mt-2 text-sm font-medium text-slate-700">{service.workPerformed}</p> : null}
          </Card>
        </div>
      ))}
    </div>
  );
}

export function PaymentSuccessMessage({ status, deliveryDate }: { status: ClientPayment["status"]; deliveryDate?: string }) {
  if (status === "Approved") {
    return <Card className="border-emerald-200 bg-emerald-50 p-4 text-emerald-800"><strong>Pago exitoso</strong><p>Tu pago fue verificado por recepción. Fecha de entrega: {deliveryDate ?? "por confirmar"}</p></Card>;
  }
  if (status === "Rejected") {
    return <Card className="border-red-200 bg-red-50 p-4 text-red-800"><strong>Pago rechazado</strong><p>Comunícate con recepción o intenta registrar un nuevo pago.</p></Card>;
  }
  return <Card className="border-blue-200 bg-blue-50 p-4 text-blue-800"><strong>Pago enviado</strong><p>Tu pago está pendiente de verificación por recepción.</p></Card>;
}

export function PaymentVerificationTable({
  payments,
  onSelect,
  toolbar,
  footer,
}: {
  payments: ClientPayment[];
  onSelect: (payment: ClientPayment) => void;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const statusToneClasses = {
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  } as const;

  return (
    <Card className="overflow-hidden">
      {toolbar}
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-3">Fecha</th>
            <th className="px-3 py-3">Cliente</th>
            <th className="px-3 py-3">Orden</th>
            <th className="px-3 py-3">Factura</th>
            <th className="px-3 py-3">Método</th>
            <th className="px-3 py-3">Valor</th>
            <th className="px-3 py-3">Referencia</th>
            <th className="px-3 py-3">Estado</th>
            <th className="px-3 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {payments.map((payment) => (
            <tr key={payment.id} className="align-middle">
              <td className="break-words px-3 py-4 text-slate-700">{formatDateTime(payment.date)}</td>
              <td className="break-words px-3 py-4">
                <p className="font-semibold text-slate-900">{payment.customer}</p>
                {payment.clientNumber ? <p className="text-xs text-slate-500">Cliente #{payment.clientNumber}</p> : null}
              </td>
              <td className="break-words px-3 py-4 font-semibold text-slate-900">{payment.orderCode}</td>
              <td className="break-words px-3 py-4">{payment.invoiceNumber}</td>
              <td className="break-words px-3 py-4">{payment.method}</td>
              <td className="break-words px-3 py-4 font-semibold">{formatCurrency(payment.amount)}</td>
              <td className="break-words px-3 py-4 text-slate-700">{payment.reference}</td>
              <td className="px-3 py-4">
                <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${statusToneClasses[getPaymentStatusTone(payment.status)]}`}>
                  {getPaymentStatusLabel(payment.status)}
                </span>
              </td>
              <td className="px-3 py-4"><Button variant="secondary" className="min-h-9 px-3" onClick={() => onSelect(payment)}>Ver</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {footer}
    </Card>
  );
}

export function DeliveryDateConfirmationForm({ onConfirm }: { onConfirm: (date: string) => void }) {
  const [date, setDate] = useState("2026-05-29");
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex-1 text-sm font-semibold text-slate-700">
        Fecha de entrega
        <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>
      <Button onClick={() => onConfirm(date)}>Confirmar fecha de entrega</Button>
    </div>
  );
}

export function PaymentVerificationDrawer({ open, payment, onClose, readOnly = false }: { open: boolean; payment?: ClientPayment; onClose: () => void; readOnly?: boolean }) {
  const [message, setMessage] = useState("");
  if (!payment) return null;
  return (
    <Drawer open={open} title={readOnly ? "Detalle de pago" : "Verificación de pago"} onClose={onClose}>
      <div className="space-y-5">
        <SummaryGrid rows={[
          ["Cliente", payment.customer],
          ["Orden", payment.orderCode],
          ["Factura", payment.invoiceNumber],
          ["Método", payment.method],
          ["Valor", formatCurrency(payment.amount)],
          ["Referencia", payment.reference],
          ["Fecha", formatDateTime(payment.date)],
          ["Estado", getPaymentStatusLabel(payment.status)],
        ]} />
        {message ? <PaymentSuccessMessage status={message === "approved" ? "Approved" : "Rejected"} deliveryDate="2026-05-29" /> : null}
        {!readOnly ? (
          <>
            <DeliveryDateConfirmationForm onConfirm={() => setMessage("approved")} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setMessage("rejected")}>Rechazar pago</Button>
              <Button onClick={() => setMessage("approved")}>Aprobar pago</Button>
            </div>
          </>
        ) : null}
      </div>
    </Drawer>
  );
}

export function ProductPriceCalculator({ supplierPrice, profitPercentage }: { supplierPrice: number; profitPercentage: number }) {
  const salePrice = calculateProductSalePrice(supplierPrice, profitPercentage);
  return (
    <Card className="bg-slate-50 p-4">
      <h3 className="font-bold text-slate-900">Cálculo de precio</h3>
      <div className="mt-3 grid gap-2 text-sm">
        <Info label="Precio proveedor" value={formatCurrency(supplierPrice)} />
        <Info label={`Ganancia ${profitPercentage}%`} value={formatCurrency(salePrice - supplierPrice)} />
        <Info label="Precio de venta" value={formatCurrency(salePrice)} />
      </div>
    </Card>
  );
}

export function StockSubmissionForm({ product }: { product?: WarehouseProduct }) {
  const queryClient = useQueryClient();
  const suppliersQuery = useQuery({ queryKey: ["stock-suppliers"], queryFn: getSuppliersForStock });
  const categoriesQuery = useQuery({ queryKey: ["stock-categories"], queryFn: getPartCategoriesForStock });
  const brandsQuery = useQuery({ queryKey: ["stock-brands"], queryFn: getPartBrandsForStock });
  const [productName, setProductName] = useState(product?.name ?? "");
  const [referenceCode, setReferenceCode] = useState(product?.referenceCode ?? "");
  const [supplierId, setSupplierId] = useState("");
  const [supplierPrice, setSupplierPrice] = useState(product?.supplierPrice ?? 0);
  const [profit, setProfit] = useState(product?.profitPercentage ?? 0);
  const [quantity, setQuantity] = useState(product?.quantity ?? 1);
  const [minimumStock, setMinimumStock] = useState(product?.minimumStock ?? 0);
  const [partCategoryId, setPartCategoryId] = useState("");
  const [partBrandId, setPartBrandId] = useState("");
  const [description, setDescription] = useState(product?.description ?? "");
  const [warehouseComment, setWarehouseComment] = useState(product?.observations ?? "");
  const [createdSubmission, setCreatedSubmission] = useState<StockSubmission | null>(null);
  const [sentSubmission, setSentSubmission] = useState<Pick<StockSubmission, "name" | "referenceCode"> | null>(null);
  const [failedSubmission, setFailedSubmission] = useState<Pick<StockSubmission, "name" | "referenceCode"> | null>(null);
  const currentSubmissionSummary = {
    name: productName.trim() || "Producto sin nombre",
    referenceCode: referenceCode.trim() || "Sin codigo",
  };
  const resetForm = () => {
    setProductName("");
    setReferenceCode("");
    setSupplierId("");
    setSupplierPrice(0);
    setProfit(0);
    setQuantity(1);
    setMinimumStock(0);
    setPartCategoryId("");
    setPartBrandId("");
    setDescription("");
    setWarehouseComment("");
  };
  const createMutation = useMutation({
    mutationFn: () => createStockSubmission({
      productName,
      referenceCode,
      supplierId,
      supplierPrice,
      profitPercentage: profit,
      quantity,
      minimumStock,
      partCategoryId,
      partBrandId,
      description,
      observations: warehouseComment,
    }),
    onSuccess: async (submission) => {
      setCreatedSubmission(submission);
      setSentSubmission(null);
      setFailedSubmission(null);
      await queryClient.invalidateQueries({ queryKey: ["warehouse-submissions"] });
    },
    onError: () => {
      setSentSubmission(null);
      setFailedSubmission(currentSubmissionSummary);
    },
  });
  const sendMutation = useMutation({
    mutationFn: (submissionId: string) => sendStockSubmissionForReview(submissionId),
    onSuccess: async (submission) => {
      setCreatedSubmission(null);
      setSentSubmission({
        name: submission.name || currentSubmissionSummary.name,
        referenceCode: submission.referenceCode || currentSubmissionSummary.referenceCode,
      });
      setFailedSubmission(null);
      resetForm();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["warehouse-submissions"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-review"] }),
      ]);
    },
    onError: () => {
      setSentSubmission(null);
      setFailedSubmission(createdSubmission ?? currentSubmissionSummary);
    },
  });
  const canSubmit = productName.trim() && referenceCode.trim() && supplierId && supplierPrice >= 0 && profit >= 0 && quantity > 0 && minimumStock >= 0;
  const isWorking = createMutation.isPending || sendMutation.isPending;
  return (
    <Card className="p-5">
      {createMutation.isError ? <ApiErrorAlert error={createMutation.error} action="No se pudo guardar la solicitud de stock" className="mb-4" /> : null}
      {sendMutation.isError ? <ApiErrorAlert error={sendMutation.error} action="No se pudo enviar la solicitud a inventario" className="mb-4" /> : null}
      {sentSubmission ? (
        <Card className="mb-4 border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Solicitud enviada a revision: {sentSubmission.referenceCode} - {sentSubmission.name}.
        </Card>
      ) : null}
      {failedSubmission ? (
        <Card className="mb-4 border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Error al enviar/guardar la solicitud: {failedSubmission.referenceCode} - {failedSubmission.name}.
        </Card>
      ) : null}
      {createdSubmission ? <Card className="mb-4 border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Solicitud guardada como borrador: {createdSubmission.referenceCode} - {createdSubmission.name}. Puedes enviarla a revision de inventario.</Card> : null}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput label="Nombre del producto" value={productName} onChange={(event) => setProductName(event.target.value)} />
          <FormInput label="Código de referencia" value={referenceCode} onChange={(event) => setReferenceCode(event.target.value)} />
          <FormSelect
            label="Proveedor"
            value={supplierId}
            onChange={(event) => setSupplierId(event.target.value)}
            options={(suppliersQuery.data ?? []).map((supplier) => ({ label: supplier.name, value: supplier.id }))}
            required
          />
          <FormInput label="Precio del proveedor" type="number" value={supplierPrice} onChange={(event) => setSupplierPrice(Number(event.target.value))} />
          <FormInput label="Porcentaje de ganancia" type="number" value={profit} onChange={(event) => setProfit(Number(event.target.value))} />
          <FormInput label="Precio de venta" value={calculateProductSalePrice(supplierPrice, profit)} readOnly />
          <FormInput label="Cantidad" type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
          <FormSelect
            label="Categoría"
            value={partCategoryId}
            onChange={(event) => setPartCategoryId(event.target.value)}
            options={(categoriesQuery.data ?? []).map((category) => ({ label: category.name, value: category.id }))}
          />
          <FormSelect
            label="Marca"
            value={partBrandId}
            onChange={(event) => setPartBrandId(event.target.value)}
            options={(brandsQuery.data ?? []).map((brand) => ({ label: brand.name, value: brand.id }))}
          />
          <FormInput label="Stock mínimo" type="number" min={0} value={minimumStock} onChange={(event) => setMinimumStock(Number(event.target.value))} />
          <div className="md:col-span-2"><FormTextarea label="Descripción" value={description} onChange={(event) => setDescription(event.target.value)} /></div>
          <div className="md:col-span-2"><FormTextarea label="Observaciones" value={warehouseComment} onChange={(event) => setWarehouseComment(event.target.value)} /></div>
        </div>
        <ProductPriceCalculator supplierPrice={supplierPrice} profitPercentage={profit} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" isLoading={createMutation.isPending} disabled={!canSubmit || isWorking} onClick={() => createMutation.mutate()}>Guardar borrador</Button>
        <Button icon={<PackagePlus className="h-4 w-4" />} isLoading={sendMutation.isPending} disabled={isWorking || (!createdSubmission && !canSubmit)} onClick={async () => {
          if (createdSubmission) {
            sendMutation.mutate(createdSubmission.submissionId);
            return;
          }
          const submission = await createMutation.mutateAsync();
          sendMutation.mutate(submission.submissionId);
        }}>Enviar stock a revisión</Button>
      </div>
    </Card>
  );
}

export function StockSubmissionReviewDrawer({ open, submission, onClose }: { open: boolean; submission?: StockSubmission; onClose: () => void }) {
  const [comment, setComment] = useState("");
  if (!submission) return null;
  return (
    <Drawer open={open} title="Revisión de stock" onClose={onClose}>
      <div className="space-y-5">
        <SummaryGrid rows={[
          ["Producto", submission.name],
          ["Código referencia", submission.referenceCode],
          ["Proveedor", submission.supplier],
          ["Cantidad enviada", String(submission.quantity)],
          ["Precio proveedor", formatCurrency(submission.supplierPrice)],
          ["Porcentaje ganancia", `${submission.profitPercentage}%`],
          ["Precio venta calculado", formatCurrency(submission.salePrice)],
          ["Comentario del Jefe de Bodega", submission.warehouseComment ?? "Sin comentario"],
        ]} />
        <label className="block text-sm font-semibold text-slate-700">
          Comentario del Jefe de Almacén
          <textarea className="mt-1 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2" value={comment} onChange={(event) => setComment(event.target.value)} />
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" disabled={!comment.trim()}>Rechazar</Button>
          <Button>Aprobar</Button>
        </div>
      </div>
    </Drawer>
  );
}

export function InventoryProductTable({ products }: { products: WarehouseProduct[] }) {
  function valueOf(product: WarehouseProduct, ...keys: string[]) {
    const source = product as unknown as Record<string, unknown>;
    return keys.map((key) => source[key]).find((value) => value !== undefined && value !== null && value !== "");
  }

  function textOf(product: WarehouseProduct, fallback: string, ...keys: string[]) {
    const value = valueOf(product, ...keys);
    return value === undefined ? fallback : String(value);
  }

  function numberOf(product: WarehouseProduct, fallback: number, ...keys: string[]) {
    const value = valueOf(product, ...keys);
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="w-[24%] break-words px-3 py-3">Producto</th>
            <th className="w-[18%] break-words px-3 py-3">Referencia</th>
            <th className="w-[22%] break-words px-3 py-3">Proveedor</th>
            <th className="w-[10%] break-words px-3 py-3">Cantidad</th>
            <th className="w-[14%] break-words px-3 py-3">Precio venta</th>
            <th className="w-[12%] break-words px-3 py-3">Stock mínimo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="break-words px-3 py-3 font-semibold">{textOf(product, "Repuesto", "name", "description", "Description")}</td>
              <td className="break-words px-3 py-3">{textOf(product, "Sin referencia", "referenceCode", "code", "Code")}</td>
              <td className="break-words px-3 py-3">{textOf(product, "Inventario", "supplier", "Supplier")}</td>
              <td className="break-words px-3 py-3">{numberOf(product, 0, "quantity", "stock", "Stock")}</td>
              <td className="break-words px-3 py-3">{formatCurrency(numberOf(product, 0, "salePrice", "unitPrice", "UnitPrice"))}</td>
              <td className="break-words px-3 py-3">{numberOf(product, 0, "minimumStock", "MinimumStock")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export function ServicePartsSelector({
  parts,
  availableParts,
  onChange,
}: {
  parts: WorkshopServicePart[];
  availableParts: WarehouseProduct[];
  onChange: (parts: WorkshopServicePart[]) => void;
}) {
  function toWorkshopPart(product: WarehouseProduct): WorkshopServicePart {
    return {
      partId: product.id,
      name: product.name,
      quantity: 1,
      salePrice: product.salePrice,
    };
  }

  function changePart(index: number, productId: string) {
    const product = availableParts.find((item) => item.id === productId);
    if (!product) return;
    onChange(parts.map((item, itemIndex) => itemIndex === index ? toWorkshopPart(product) : item));
  }

  function changeQuantity(index: number, quantity: number) {
    const part = parts[index];
    const product = availableParts.find((item) => item.id === part.partId);
    const maxQuantity = product?.quantity ?? Number.MAX_SAFE_INTEGER;
    const nextQuantity = Math.max(1, Math.min(quantity || 1, maxQuantity));
    onChange(parts.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: nextQuantity } : item));
  }

  function addPart() {
    const product = availableParts.find((item) => !parts.some((part) => part.partId === item.id)) ?? availableParts[0];
    if (product) onChange([...parts, toWorkshopPart(product)]);
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-slate-700">Repuestos del inventario</p>
        <p className="mt-1 text-xs text-slate-500">Solo se pueden escoger repuestos disponibles en inventario.</p>
      </div>
      {parts.map((part, index) => (
        <div key={`${part.partId}-${index}`} className="grid gap-3 md:grid-cols-[1fr_120px_140px_auto]">
          <FormSelect
            label="Repuesto"
            value={part.partId}
            onChange={(event) => changePart(index, event.target.value)}
            options={availableParts.map((product) => ({
              label: `${product.name} · Stock ${product.quantity}`,
              value: product.id,
            }))}
            required
          />
          <FormInput label="Cantidad" type="number" min={1} max={availableParts.find((item) => item.id === part.partId)?.quantity ?? undefined} value={part.quantity} onChange={(event) => changeQuantity(index, Number(event.target.value))} />
          <FormInput label="Precio venta" type="number" value={part.salePrice} readOnly />
          <Button type="button" variant="ghost" className="self-end" onClick={() => onChange(parts.filter((_, itemIndex) => itemIndex !== index))}>Quitar</Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={addPart} disabled={availableParts.length === 0}>Agregar repuesto</Button>
    </div>
  );
}

export function WorkshopServicePriceCalculator({ parts, laborPercentage }: { parts: WorkshopServicePart[]; laborPercentage: number }) {
  const totals = useMemo(() => calculateWorkshopServicePrice(parts, laborPercentage), [parts, laborPercentage]);
  return (
    <Card className="bg-slate-50 p-4">
      <h3 className="font-bold text-slate-900">Cálculo del servicio</h3>
      <div className="mt-3 space-y-2 text-sm text-slate-600">
        {parts.map((part) => <p key={part.partId}>{part.name} x{part.quantity} = {formatCurrency(part.salePrice * part.quantity)}</p>)}
        <div className="border-t border-slate-200 pt-3">
          <Info label="Subtotal repuestos" value={formatCurrency(totals.partsTotal)} />
          <Info label={`Mano de obra ${laborPercentage}%`} value={formatCurrency(totals.laborValue)} />
          <Info label="Total servicio" value={formatCurrency(totals.finalPrice)} />
        </div>
      </div>
    </Card>
  );
}

export function WorkshopServiceForm({
  service,
  availableParts = [],
  isSaving,
  onSave,
}: {
  service?: WorkshopService;
  availableParts?: WarehouseProduct[];
  isSaving?: boolean;
  onSave?: (payload: Pick<WorkshopService, "name" | "description" | "category" | "laborPercentage" | "parts">) => void;
}) {
  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [category, setCategory] = useState(service?.category ?? "");
  const [parts, setParts] = useState<WorkshopServicePart[]>(service?.parts ?? []);
  const [laborPercentage, setLaborPercentage] = useState(service?.laborPercentage ?? 30);

  useEffect(() => {
    if (!service) return;
    setName(service.name);
    setDescription(service.description);
    setCategory(service.category);
    setParts(service.parts);
    setLaborPercentage(service.laborPercentage);
  }, [service]);

  return (
    <Card className="p-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave?.({ name, description, category, laborPercentage, parts });
        }}
      >
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <FormInput label="Nombre del servicio" value={name} onChange={(event) => setName(event.target.value)} required />
          <FormTextarea label="Descripción" value={description} onChange={(event) => setDescription(event.target.value)} required />
          <FormInput label="Categoría de servicio" value={category} onChange={(event) => setCategory(event.target.value)} required />
          <ServicePartsSelector parts={parts} availableParts={availableParts} onChange={setParts} />
          <FormInput label="Porcentaje de mano de obra" type="number" value={laborPercentage} onChange={(event) => setLaborPercentage(Number(event.target.value))} />
          <FormSelect label="Estado" options={[{ label: "Activo", value: "Active" }, { label: "Inactivo", value: "Inactive" }]} defaultValue={service?.status ?? "Active"} />
        </div>
        <WorkshopServicePriceCalculator parts={parts} laborPercentage={laborPercentage} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => history.back()}>Cancelar</Button>
        <Button type="submit" isLoading={isSaving} disabled={parts.length === 0}>Guardar servicio</Button>
      </div>
      </form>
    </Card>
  );
}

function SummaryGrid({ rows }: { rows: [string, string][] }) {
  return (
    <Card className="p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => <Info key={label} label={label} value={value} />)}
      </div>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

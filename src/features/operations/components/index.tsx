import { CheckCircle2, PackagePlus, Send, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Drawer } from "../../../shared/components/ui/Drawer";
import { Modal } from "../../../shared/components/ui/Modal";
import { FormInput } from "../../../shared/components/forms/FormInput";
import { FormSelect } from "../../../shared/components/forms/FormSelect";
import { FormTextarea } from "../../../shared/components/forms/FormTextarea";
import { formatCurrency } from "../../../shared/utils/formatters";
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
import { calculateProductSalePrice, calculateWorkshopServicePrice } from "../services/operationsService";

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
  suggestedService: z.string().min(1),
  requestType: z.enum(["Service", "Part"]),
  problemDescription: z.string().min(1),
  technicalJustification: z.string().min(1),
  suggestedPart: z.string().optional(),
  quantity: z.coerce.number().optional(),
  observations: z.string().optional(),
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
  const { register, handleSubmit, watch, formState: { errors } } = useForm<MechanicRequestForm>({
    resolver: zodResolver(mechanicRequestSchema),
    defaultValues: { orderId: defaultOrderId, requestType: "Service" },
  });
  const requestType = watch("requestType");

  return (
    <Modal open={open} title="Solicitar servicio o repuesto adicional" onClose={onClose}>
      <form className="grid gap-4" onSubmit={handleSubmit(() => onClose())}>
        <FormInput label="Orden relacionada" error={errors.orderId} registration={register("orderId")} />
        <FormInput label="Servicio sugerido" error={errors.suggestedService} registration={register("suggestedService")} />
        <FormSelect label="Tipo de solicitud" options={[{ label: "Servicio", value: "Service" }, { label: "Repuesto", value: "Part" }]} registration={register("requestType")} />
        <FormTextarea label="Descripción del problema encontrado" error={errors.problemDescription} registration={register("problemDescription")} />
        <FormTextarea label="Justificación técnica" error={errors.technicalJustification} registration={register("technicalJustification")} />
        {requestType === "Part" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput label="Repuesto sugerido opcional" registration={register("suggestedPart")} />
            <FormInput label="Cantidad opcional" type="number" min={0} registration={register("quantity")} />
          </div>
        ) : null}
        <FormTextarea label="Observaciones" registration={register("observations")} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" icon={<Send className="h-4 w-4" />}>Enviar al jefe de taller</Button>
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
}: {
  open: boolean;
  request?: AdditionalRequest;
  onClose: () => void;
}) {
  const [comment, setComment] = useState(request?.workshopChiefComment ?? "");
  if (!request) return null;

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
        <WorkshopChiefCommentBox value={comment} onChange={setComment} />
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Denegar solicitud</Button>
          <Button onClick={onClose}>Aprobar y enviar al cliente</Button>
        </div>
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
        <Info label="Entrega estimada" value={order.estimatedDelivery} />
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
            <p className="mt-2 text-sm text-slate-500">Repuestos usados: {service.parts.join(", ") || "Sin repuestos"}</p>
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

export function PaymentVerificationTable({ payments, onSelect }: { payments: ClientPayment[]; onSelect: (payment: ClientPayment) => void }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>{["Fecha", "Cliente", "Orden", "Factura", "Método de pago", "Valor", "Referencia", "Estado", "Acciones"].map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="px-4 py-3">{payment.date}</td>
              <td className="px-4 py-3">{payment.customer}</td>
              <td className="px-4 py-3">{payment.orderCode}</td>
              <td className="px-4 py-3">{payment.invoiceNumber}</td>
              <td className="px-4 py-3">{payment.method}</td>
              <td className="px-4 py-3">{formatCurrency(payment.amount)}</td>
              <td className="px-4 py-3">{payment.reference}</td>
              <td className="px-4 py-3"><Badge tone={getPaymentStatusTone(payment.status)}>{getPaymentStatusLabel(payment.status)}</Badge></td>
              <td className="px-4 py-3"><Button variant="secondary" onClick={() => onSelect(payment)}>Ver detalle</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
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

export function PaymentVerificationDrawer({ open, payment, onClose }: { open: boolean; payment?: ClientPayment; onClose: () => void }) {
  const [message, setMessage] = useState("");
  if (!payment) return null;
  return (
    <Drawer open={open} title="Verificación de pago" onClose={onClose}>
      <div className="space-y-5">
        <SummaryGrid rows={[
          ["Cliente", payment.customer],
          ["Orden", payment.orderCode],
          ["Factura", payment.invoiceNumber],
          ["Método", payment.method],
          ["Valor", formatCurrency(payment.amount)],
          ["Referencia", payment.reference],
        ]} />
        {message ? <PaymentSuccessMessage status={message === "approved" ? "Approved" : "Rejected"} deliveryDate="2026-05-29" /> : null}
        <DeliveryDateConfirmationForm onConfirm={() => setMessage("approved")} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setMessage("rejected")}>Rechazar pago</Button>
          <Button onClick={() => setMessage("approved")}>Aprobar pago</Button>
        </div>
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
  const [supplierPrice, setSupplierPrice] = useState(product?.supplierPrice ?? 60000);
  const [profit, setProfit] = useState(product?.profitPercentage ?? 30);
  return (
    <Card className="p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput label="Nombre del producto" defaultValue={product?.name ?? "Aceite 20W50"} />
          <FormInput label="Código de referencia" defaultValue={product?.referenceCode ?? "LUB-20W50"} />
          <FormInput label="Proveedor" defaultValue={product?.supplier ?? "Lubricantes del Oriente"} />
          <FormInput label="Precio del proveedor" type="number" value={supplierPrice} onChange={(event) => setSupplierPrice(Number(event.target.value))} />
          <FormInput label="Porcentaje de ganancia" type="number" value={profit} onChange={(event) => setProfit(Number(event.target.value))} />
          <FormInput label="Precio de venta" value={calculateProductSalePrice(supplierPrice, profit)} readOnly />
          <FormInput label="Cantidad" type="number" defaultValue={product?.quantity ?? 12} />
          <FormInput label="Categoría" defaultValue={product?.category ?? "Lubricantes"} />
          <FormInput label="Marca" defaultValue={product?.brand ?? "Castrol"} />
          <FormInput label="Stock mínimo" type="number" defaultValue={product?.minimumStock ?? 6} />
          <div className="md:col-span-2"><FormTextarea label="Descripción" defaultValue={product?.description ?? "Producto registrado por bodega."} /></div>
          <div className="md:col-span-2"><FormTextarea label="Observaciones" defaultValue={product?.observations ?? ""} /></div>
        </div>
        <ProductPriceCalculator supplierPrice={supplierPrice} profitPercentage={profit} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary">Guardar borrador</Button>
        <Button icon={<PackagePlus className="h-4 w-4" />}>Enviar stock a revisión</Button>
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
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Producto", "Referencia", "Proveedor", "Cantidad", "Precio venta", "Stock mínimo"].map((header) => <th className="px-4 py-3" key={header}>{header}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-3 font-semibold">{product.name}</td>
              <td className="px-4 py-3">{product.referenceCode}</td>
              <td className="px-4 py-3">{product.supplier}</td>
              <td className="px-4 py-3">{product.quantity}</td>
              <td className="px-4 py-3">{formatCurrency(product.salePrice)}</td>
              <td className="px-4 py-3">{product.minimumStock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export function ServicePartsSelector({ parts, onChange }: { parts: WorkshopServicePart[]; onChange: (parts: WorkshopServicePart[]) => void }) {
  return (
    <div className="space-y-3">
      {parts.map((part, index) => (
        <div key={part.partId} className="grid gap-3 md:grid-cols-[1fr_120px_140px]">
          <FormInput label="Repuesto" value={part.name} onChange={(event) => onChange(parts.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} />
          <FormInput label="Cantidad" type="number" value={part.quantity} onChange={(event) => onChange(parts.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: Number(event.target.value) } : item))} />
          <FormInput label="Precio venta" type="number" value={part.salePrice} onChange={(event) => onChange(parts.map((item, itemIndex) => itemIndex === index ? { ...item, salePrice: Number(event.target.value) } : item))} />
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={() => onChange([...parts, { partId: crypto.randomUUID(), name: "Nuevo repuesto", quantity: 1, salePrice: 0 }])}>Agregar repuesto</Button>
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

export function WorkshopServiceForm({ service }: { service?: WorkshopService }) {
  const [parts, setParts] = useState<WorkshopServicePart[]>(service?.parts ?? [
    { partId: "prd-1", name: "Aceite 20W50", salePrice: 78000, quantity: 1 },
    { partId: "prd-2", name: "Filtro de aceite universal", salePrice: 32500, quantity: 1 },
  ]);
  const [laborPercentage, setLaborPercentage] = useState(service?.laborPercentage ?? 30);
  return (
    <Card className="p-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <FormInput label="Nombre del servicio" defaultValue={service?.name ?? "Cambio de aceite"} />
          <FormTextarea label="Descripción" defaultValue={service?.description ?? "Cambio de aceite y filtro con revisión visual."} />
          <FormInput label="Categoría de servicio" defaultValue={service?.category ?? "Mantenimiento preventivo"} />
          <ServicePartsSelector parts={parts} onChange={setParts} />
          <FormInput label="Porcentaje de mano de obra" type="number" value={laborPercentage} onChange={(event) => setLaborPercentage(Number(event.target.value))} />
          <FormSelect label="Estado" options={[{ label: "Activo", value: "Active" }, { label: "Inactivo", value: "Inactive" }]} defaultValue={service?.status ?? "Active"} />
        </div>
        <WorkshopServicePriceCalculator parts={parts} laborPercentage={laborPercentage} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary">Cancelar</Button>
        <Button>Guardar servicio</Button>
      </div>
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

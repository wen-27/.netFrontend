import { Badge } from "../../../shared/components/ui/Badge";

export function OrderStatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
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
  const tone = status === "Completada" || status === "Facturada" ? "green" : status === "Cancelada" ? "red" : status.includes("repuestos") || status.includes("Pendiente") ? "amber" : "blue";
  return <Badge tone={tone}>{labels[status] ?? status}</Badge>;
}

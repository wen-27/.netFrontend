import { Badge } from "../../../shared/components/ui/Badge";

export function OrderStatusBadge({ status }: { status: string }) {
  const tone = status === "Completada" || status === "Facturada" ? "green" : status === "Cancelada" ? "red" : status.includes("repuestos") || status.includes("Pendiente") ? "amber" : "blue";
  return <Badge tone={tone}>{status}</Badge>;
}

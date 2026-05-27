import { DetailShell } from "../../../shared/components/layout/DetailShell";

export function PartPurchaseDetailPage() {
  return <DetailShell title="Detalle de compra" description="Proveedor, detalle de repuestos, costos y estado de recepción." tabs={["Resumen", "Detalle", "Recepción"]} />;
}

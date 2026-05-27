import { DetailShell } from "../../../shared/components/layout/DetailShell";

export function VehicleDetailPage() {
  return <DetailShell title="Detalle de vehículo" description="Resumen, historial de propietarios, órdenes e inventario de ingreso." tabs={["Resumen", "Historial de propietarios", "Órdenes", "Inventario de ingreso"]} />;
}

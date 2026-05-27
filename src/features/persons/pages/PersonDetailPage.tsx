import { DetailShell } from "../../../shared/components/layout/DetailShell";

export function PersonDetailPage() {
  return <DetailShell title="Detalle de persona" description="Resumen de cliente, contactos, vehículos, órdenes, facturas y auditoría relacionada." tabs={["Resumen", "Contactos", "Vehículos", "Órdenes", "Facturas", "Auditoría"]} />;
}

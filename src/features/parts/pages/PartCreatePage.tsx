import { FormShell } from "../../../shared/components/layout/FormShell";

export function PartCreatePage() {
  return <FormShell title="Crear repuesto" description="Código interno, descripción, categoría, marca, stock, costo y precio de venta." primaryLabel="Código interno" secondaryLabel="Descripción" cancelTo="/inventory/products" />;
}

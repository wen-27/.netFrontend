import { FormShell } from "../../../shared/components/layout/FormShell";

export function PartEditPage() {
  return <FormShell title="Editar repuesto" description="Actualiza datos de inventario y precio del repuesto." secondaryLabel="Descripción" cancelTo="/inventory/products" showPrimary={false} />;
}

import { FormShell } from "../../../shared/components/layout/FormShell";

export function VehicleCreatePage() {
  return <FormShell title="Registrar vehículo" description="VIN, marca, modelo, tipo, kilometraje y propietario actual." primaryLabel="VIN" secondaryLabel="Propietario" />;
}

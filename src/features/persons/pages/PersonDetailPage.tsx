import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Car, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ErrorState } from "../../../shared/components/feedback/ErrorState";
import { LoadingState } from "../../../shared/components/feedback/LoadingState";
import { Card } from "../../../shared/components/ui/Card";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { formatDate } from "../../../shared/utils/formatters";
import { personsService } from "../services/personsService";

function value(text?: string | null) {
  return text && text.trim() ? text : "No registrado";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-900">{children}</div>
    </div>
  );
}

export function PersonDetailPage() {
  const { id = "" } = useParams();
  const customerQuery = useQuery({ queryKey: ["person", id], queryFn: () => personsService.getById(id), enabled: Boolean(id) });
  const vehiclesQuery = useQuery({ queryKey: ["person-vehicles", id], queryFn: () => personsService.listVehicles(id), enabled: Boolean(id) });

  if (customerQuery.isLoading) return <LoadingState label="Cargando cliente..." />;
  if (customerQuery.isError || !customerQuery.data) return <ErrorState message="No fue posible cargar el cliente." onRetry={() => customerQuery.refetch()} />;

  const customer = customerQuery.data;
  const vehicles = vehiclesQuery.data ?? [];

  return (
    <>
      <PageHeader
        title={customer.fullName}
        description="Detalle del cliente, contacto y relación operativa con el taller."
        actions={<Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}><Link to="/persons">Regresar</Link></Button>}
      />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-slate-900">Información del cliente</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre completo">{customer.fullName}</Field>
            <Field label="Rol"><Badge tone="indigo">{customer.role ?? "Client"}</Badge></Field>
            <Field label="Documento">{customer.documentType} {customer.documentNumber}</Field>
            <Field label="Estado"><Badge tone={customer.status === "Activo" ? "green" : "slate"}>{customer.status}</Badge></Field>
            <Field label="Email">{value(customer.primaryEmail)}</Field>
            <Field label="Teléfono">{value(customer.primaryPhone)}</Field>
            <Field label="Sexo / género">{value(customer.gender)}</Field>
            <Field label="Fecha de nacimiento">{customer.birthDate ? formatDate(customer.birthDate) : "No registrado"}</Field>
            <Field label="Dirección">{value(customer.address)}</Field>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Car className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-slate-900">Vehículos asociados</h2>
          </div>
          <div className="grid gap-3">
            {vehicles.length === 0 && !vehiclesQuery.isLoading ? <p className="text-sm text-slate-500">No hay vehículos asociados.</p> : null}
            {vehicles.map((vehicle) => (
              <div key={String(vehicle.id ?? vehicle.Id)} className="rounded-md border border-slate-200 p-3">
                <p className="font-semibold text-slate-900">{String(vehicle.brand ?? vehicle.Brand ?? "")} {String(vehicle.model ?? vehicle.Model ?? "")}</p>
                <p className="text-sm text-slate-600">Placa/VIN: {String(vehicle.vin ?? vehicle.Vin ?? "No registrado")}</p>
                <p className="text-sm text-slate-600">Color: {String(vehicle.color ?? vehicle.Color ?? "No registrado")}</p>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </>
  );
}

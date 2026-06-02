import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Car, History, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ErrorState } from "../../../shared/components/feedback/ErrorState";
import { LoadingState } from "../../../shared/components/feedback/LoadingState";
import { Card } from "../../../shared/components/ui/Card";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { formatDate } from "../../../shared/utils/formatters";
import { vehiclesService } from "../services/vehiclesService";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-900">{children}</div>
    </div>
  );
}

export function VehicleDetailPage() {
  const { id = "" } = useParams();
  const vehicleQuery = useQuery({ queryKey: ["vehicle", id], queryFn: () => vehiclesService.getById(id), enabled: Boolean(id) });
  const historyQuery = useQuery({ queryKey: ["vehicle-owner-history", id], queryFn: () => vehiclesService.listOwnerHistoryByVehicle(id), enabled: Boolean(id) });

  if (vehicleQuery.isLoading) return <LoadingState label="Cargando vehículo..." />;
  if (vehicleQuery.isError || !vehicleQuery.data) return <ErrorState message="No fue posible cargar el vehículo." onRetry={() => vehicleQuery.refetch()} />;

  const vehicle = vehicleQuery.data;
  const history = historyQuery.data ?? [];

  return (
    <>
      <PageHeader
        title={`${vehicle.brand} ${vehicle.model}`}
        description={`Detalle completo de ${vehicle.vin}.`}
        actions={<Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}><Link to="/vehicles">Regresar</Link></Button>}
      />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Car className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-slate-900">Información básica</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Placa / VIN">{vehicle.vin}</Field>
            <Field label="Estado"><Badge tone={vehicle.isActive ? "green" : "slate"}>{vehicle.isActive ? "Activo" : "Inactivo"}</Badge></Field>
            <Field label="Marca">{vehicle.brand}</Field>
            <Field label="Modelo">{vehicle.model}</Field>
            <Field label="Tipo">{vehicle.type}</Field>
            <Field label="Año">{vehicle.year || "No registrado"}</Field>
            <Field label="Color">{vehicle.color || "No registrado"}</Field>
            <Field label="Kilometraje">{vehicle.mileage.toLocaleString("es-CO")} km</Field>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-slate-900">Propietario actual</h2>
          </div>
          <div className="grid gap-4">
            <Field label="Nombre">{vehicle.currentOwner || "Sin propietario"}</Field>
            <Field label="Documento">Disponible en historial del cliente</Field>
            <Field label="Órdenes activas"><Badge tone={vehicle.activeOrders > 0 ? "amber" : "green"}>{vehicle.activeOrders}</Badge></Field>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-slate-900">Historial de propietarios</h2>
          </div>
          <div className="grid gap-3">
            {history.length === 0 && !historyQuery.isLoading ? <p className="text-sm text-slate-500">No hay historial registrado.</p> : null}
            {history.map((item) => (
              <div key={String(item.id ?? item.Id)} className="rounded-md border border-slate-200 p-3">
                <p className="font-semibold text-slate-900">{String(item.owner ?? item.Owner ?? "Propietario")}</p>
                <p className="text-sm text-slate-600">Desde: {formatDate(String(item.startDate ?? item.StartDate ?? ""))}</p>
                <p className="text-sm text-slate-600">Hasta: {item.endDate ?? item.EndDate ? formatDate(String(item.endDate ?? item.EndDate)) : "Actual"}</p>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </>
  );
}

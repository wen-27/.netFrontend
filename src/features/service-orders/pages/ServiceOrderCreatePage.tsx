import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPaginated } from "../../../services/apiClient";
import { ApiErrorAlert } from "../../../shared/components/feedback/ApiErrorAlert";
import { PageHeader } from "../../../shared/components/layout/PageHeader";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { serviceOrdersService } from "../services/serviceOrdersService";

type ApiPerson = {
  id?: number;
  Id?: number;
  firstNames?: string;
  FirstNames?: string;
  firstName?: string;
  FirstName?: string;
  middleName?: string | null;
  MiddleName?: string | null;
  lastNames?: string;
  LastNames?: string;
  lastName?: string;
  LastName?: string;
  secondLastName?: string | null;
  SecondLastName?: string | null;
  documentNumber?: string;
  DocumentNumber?: string;
};

type ApiVehicle = {
  id?: number;
  Id?: number;
  vin?: string;
  VIN?: string;
  year?: number;
  Year?: number;
  mileage?: number;
  Mileage?: number;
  isActive?: boolean;
  IsActive?: boolean;
  brand?: string;
  model?: string;
};

type ApiOwnerHistory = {
  vehicleId?: number;
  VehicleId?: number;
  personId?: number;
  PersonId?: number;
  endDate?: string | null;
  EndDate?: string | null;
};

type ApiServiceOrder = {
  vehicleId?: number | string;
  VehicleId?: number | string;
  orderStatusId?: number | string;
  OrderStatusId?: number | string;
  status?: string | null;
  Status?: string | null;
};

const blockingOrderStatuses = new Set([
  "Created",
  "PendingAssignment",
  "Assigned",
  "InProgress",
  "PendingClientApproval",
  "WaitingForPayment",
  "PaymentUnderReview",
  "Paid",
  "ReadyForDelivery",
]);

const statusById: Record<string, string> = {
  "1": "Created",
  "2": "PendingAssignment",
  "3": "Assigned",
  "4": "InProgress",
  "5": "PendingClientApproval",
  "6": "WaitingForPayment",
  "7": "PaymentUnderReview",
  "8": "Paid",
  "9": "ReadyForDelivery",
  "10": "Delivered",
  "11": "Cancelled",
};

function fieldClass() {
  return "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
}

function personName(person: ApiPerson) {
  const fullName = [person.firstNames ?? person.FirstNames, person.lastNames ?? person.LastNames].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;
  const separatedName = [person.firstName ?? person.FirstName, person.middleName ?? person.MiddleName, person.lastName ?? person.LastName, person.secondLastName ?? person.SecondLastName]
    .filter(Boolean)
    .join(" ");
  return separatedName || `Cliente #${person.id ?? person.Id}`;
}

function vehicleName(vehicle: ApiVehicle) {
  const year = vehicle.year ?? vehicle.Year;
  const vin = vehicle.vin ?? vehicle.VIN;
  return [vehicle.brand, vehicle.model, year].filter(Boolean).join(" ") || `Vehículo #${vehicle.id ?? vehicle.Id}${vin ? ` · ${vin}` : ""}`;
}

export function ServiceOrderCreatePage() {
  const navigate = useNavigate();
  const [clientId, setClientId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [vehicleWarning, setVehicleWarning] = useState("");

  const personsQuery = useQuery({
    queryKey: ["empty-order-persons"],
    queryFn: () => getPaginated<ApiPerson>("/api/persons", { pageNumber: 1, pageSize: 200 }),
  });
  const vehiclesQuery = useQuery({
    queryKey: ["empty-order-vehicles"],
    queryFn: () => getPaginated<ApiVehicle>("/api/vehicles", { pageNumber: 1, pageSize: 500 }),
  });
  const ownerHistoryQuery = useQuery({
    queryKey: ["empty-order-owner-history"],
    queryFn: () => getPaginated<ApiOwnerHistory>("/api/vehicleownerhistory", { pageNumber: 1, pageSize: 500 }),
  });
  const serviceOrdersQuery = useQuery({
    queryKey: ["empty-order-service-orders"],
    queryFn: () => getPaginated<ApiServiceOrder>("/api/serviceorders", { pageNumber: 1, pageSize: 1000 }),
  });

  const people = personsQuery.data?.data ?? [];
  const vehicles = vehiclesQuery.data?.data ?? [];
  const ownerHistory = ownerHistoryQuery.data?.data ?? [];
  const serviceOrders = serviceOrdersQuery.data?.data ?? [];

  const activeOrderVehicleIds = useMemo(() => {
    return new Set(serviceOrders
      .filter((order) => {
        const statusId = String(order.orderStatusId ?? order.OrderStatusId ?? "");
        const status = String(order.status ?? order.Status ?? statusById[statusId] ?? "");
        return blockingOrderStatuses.has(status);
      })
      .map((order) => String(order.vehicleId ?? order.VehicleId))
      .filter(Boolean));
  }, [serviceOrders]);

  const vehiclesById = useMemo(() => new Map(vehicles.map((vehicle) => [String(vehicle.id ?? vehicle.Id), vehicle])), [vehicles]);

  const availableVehicleIdsByClient = useMemo(() => {
    const grouped = new Map<string, Set<string>>();
    ownerHistory
      .filter((item) => !(item.endDate ?? item.EndDate))
      .forEach((item) => {
        const personId = String(item.personId ?? item.PersonId ?? "");
        const ownerVehicleId = String(item.vehicleId ?? item.VehicleId ?? "");
        const vehicle = vehiclesById.get(ownerVehicleId);
        if (!personId || !ownerVehicleId || !vehicle) return;
        if (!(vehicle.isActive ?? vehicle.IsActive ?? true)) return;
        if (activeOrderVehicleIds.has(ownerVehicleId)) return;
        const ids = grouped.get(personId) ?? new Set<string>();
        ids.add(ownerVehicleId);
        grouped.set(personId, ids);
      });
    return grouped;
  }, [activeOrderVehicleIds, ownerHistory, vehiclesById]);

  const availablePeople = useMemo(() => {
    return people.filter((person) => availableVehicleIdsByClient.has(String(person.id ?? person.Id)));
  }, [availableVehicleIdsByClient, people]);

  const selectedClient = availablePeople.find((person) => String(person.id ?? person.Id) === clientId);

  const availableVehicles = useMemo(() => {
    const ids = availableVehicleIdsByClient.get(clientId) ?? new Set<string>();
    return vehicles.filter((vehicle) => ids.has(String(vehicle.id ?? vehicle.Id)));
  }, [availableVehicleIdsByClient, clientId, vehicles]);

  const createMutation = useMutation({
    mutationFn: () => serviceOrdersService.createEmpty({ clientPersonId: Number(clientId), vehicleId: Number(vehicleId) }),
    onSuccess: (response) => {
      const id = (response.data as { id?: number }).id;
      navigate(id ? `/service-orders/${id}` : "/service-orders");
    },
  });

  const canCreate = Boolean(clientId && vehicleId);

  return (
    <>
      <PageHeader title="Crear orden" description="El Jefe de Taller crea una orden vacía asociando un cliente con uno de sus vehículos activos." />
      {(personsQuery.isError || vehiclesQuery.isError || ownerHistoryQuery.isError || serviceOrdersQuery.isError) ? (
        <ApiErrorAlert error={personsQuery.error ?? vehiclesQuery.error ?? ownerHistoryQuery.error ?? serviceOrdersQuery.error} action="No se pudo cargar la información" />
      ) : null}

      <Card className="p-5">
        <div className="grid gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Cliente</span>
            <select className={fieldClass()} value={clientId} onChange={(event) => { setClientId(event.target.value); setVehicleId(""); setVehicleWarning(""); }}>
              <option value="">Seleccionar</option>
              {availablePeople.map((person) => (
                <option key={person.id ?? person.Id} value={person.id ?? person.Id}>
                  {personName(person)}
                </option>
              ))}
            </select>
            {!availablePeople.length && !personsQuery.isLoading && !vehiclesQuery.isLoading && !ownerHistoryQuery.isLoading && !serviceOrdersQuery.isLoading ? (
              <span className="mt-2 block text-sm font-semibold text-amber-700">
                No hay clientes con vehículos activos disponibles para crear una orden.
              </span>
            ) : null}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Vehículo activo asociado</span>
            <select
              className={fieldClass()}
              value={vehicleId}
              onFocus={() => {
                if (!clientId) setVehicleWarning("Primero debes seleccionar el cliente para ver sus vehículos asociados.");
              }}
              onMouseDown={() => {
                if (!clientId) setVehicleWarning("Primero debes seleccionar el cliente para ver sus vehículos asociados.");
              }}
              onChange={(event) => {
                if (!clientId) {
                  setVehicleWarning("Primero debes seleccionar el cliente para ver sus vehículos asociados.");
                  return;
                }
                setVehicleId(event.target.value);
                setVehicleWarning("");
              }}
            >
              <option value="">{clientId ? "Seleccionar" : "Seleccione primero un cliente"}</option>
              {clientId ? availableVehicles.map((vehicle) => (
                  <option key={vehicle.id ?? vehicle.Id} value={vehicle.id ?? vehicle.Id}>
                    {vehicleName(vehicle)} · Km {vehicle.mileage ?? vehicle.Mileage ?? 0}
                  </option>
                )) : null}
            </select>
            {vehicleWarning ? <span className="mt-2 block text-sm font-semibold text-red-600">{vehicleWarning}</span> : null}
          </label>
        </div>

        {selectedClient ? (
          <p className="mt-4 text-sm font-semibold text-slate-600">
            <CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-600" />
            Cliente seleccionado: {personName(selectedClient)}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end">
          <Button disabled={!canCreate} isLoading={createMutation.isPending} onClick={() => createMutation.mutate()}>
            Crear orden vacía
          </Button>
        </div>
      </Card>
    </>
  );
}
